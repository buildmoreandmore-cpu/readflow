
import React, { useState, useEffect } from 'react';
import { GutenbergBook, SavedDocument, AppConfig, SubstackPublication, SubstackArticle } from '../types';
import { getCachedBook, cacheBook, cacheSubstackArticle } from '../lib/storage';
import { FEATURED_PUBLICATIONS, fetchPublicationFeed, formatPublishedDate, getPublicationLogoUrl } from '../services/substackService';

interface LibraryProps {
  onSelectBook: (content: string, title: string, author?: string, gutenbergId?: number) => void;
  onSelectSubstackArticle: (content: string, title: string, author: string, articleId: string, publicationName: string) => void;
  onBack: () => void;
  savedDocuments: SavedDocument[];
  onDeleteDocument: (id: string) => void;
  onResumeDocument: (doc: SavedDocument) => void;
  config: AppConfig;
  isLoadingResume?: boolean;
  resumeError?: string | null;
}

// Helper to generate Gutenberg cover URL
const getGutenbergCoverUrl = (id: number) =>
  `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`;

const FEATURED_BOOKS = [
  { id: 1342, title: "Pride and Prejudice", author: "Jane Austen", coverUrl: getGutenbergCoverUrl(1342) },
  { id: 11, title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", coverUrl: getGutenbergCoverUrl(11) },
  { id: 1661, title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", coverUrl: getGutenbergCoverUrl(1661) },
  { id: 84, title: "Frankenstein", author: "Mary Shelley", coverUrl: getGutenbergCoverUrl(84) },
  { id: 1232, title: "The Prince", author: "Niccolò Machiavelli", coverUrl: getGutenbergCoverUrl(1232) },
  { id: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", coverUrl: getGutenbergCoverUrl(174) },
  { id: 98, title: "A Tale of Two Cities", author: "Charles Dickens", coverUrl: getGutenbergCoverUrl(98) },
  { id: 2701, title: "Moby Dick", author: "Herman Melville", coverUrl: getGutenbergCoverUrl(2701) },
];

const Library: React.FC<LibraryProps> = ({
  onSelectBook,
  onSelectSubstackArticle,
  onBack,
  savedDocuments,
  onDeleteDocument,
  onResumeDocument,
  config,
  isLoadingResume = false,
  resumeError = null
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'discover' | 'substack'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GutenbergBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBookId, setLoadingBookId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumingDocId, setResumingDocId] = useState<string | null>(null);

  // Substack state
  const [selectedPublication, setSelectedPublication] = useState<SubstackPublication | null>(null);
  const [substackArticles, setSubstackArticles] = useState<SubstackArticle[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [loadingArticleId, setLoadingArticleId] = useState<string | null>(null);
  const [substackError, setSubstackError] = useState<string | null>(null);

  const isDark = config.theme === 'DARK';

  const handleResume = (doc: SavedDocument) => {
    setResumingDocId(doc.id);
    onResumeDocument(doc);
  };

  // Clear resuming state when loading finishes
  React.useEffect(() => {
    if (!isLoadingResume) {
      setResumingDocId(null);
    }
  }, [isLoadingResume]);

  const searchGutenberg = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `https://gutendex.com/books/?search=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      const books: GutenbergBook[] = data.results.map((book: any) => ({
        id: book.id,
        title: book.title,
        author: book.authors[0]?.name || 'Unknown Author',
        coverUrl: book.formats['image/jpeg'],
        textUrl: book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'],
        subjects: book.subjects,
        downloadCount: book.download_count,
      }));

      setSearchResults(books);
    } catch (err) {
      setError('Failed to search books. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchBookContent = async (book: GutenbergBook) => {
    if (!book.textUrl) {
      setError('No readable text format available for this book.');
      return;
    }

    setIsLoading(true);
    setLoadingBookId(book.id);
    setError(null);

    // Check cache first for instant loading
    const cached = getCachedBook(book.id);
    if (cached) {
      onSelectBook(cached, book.title, book.author, book.id);
      setIsLoading(false);
      setLoadingBookId(null);
      return;
    }

    try {
      // Use faster CORS proxy with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(book.textUrl)}`;
      const response = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      let text = await response.text();

      if (!text) {
        throw new Error('No content returned');
      }

      // Clean up Gutenberg header/footer
      const startMarkers = [
        '*** START OF THE PROJECT GUTENBERG',
        '*** START OF THIS PROJECT GUTENBERG',
        '*END*THE SMALL PRINT',
      ];
      const endMarkers = [
        '*** END OF THE PROJECT GUTENBERG',
        '*** END OF THIS PROJECT GUTENBERG',
        'End of the Project Gutenberg',
        'End of Project Gutenberg',
      ];

      for (const marker of startMarkers) {
        const idx = text.indexOf(marker);
        if (idx !== -1) {
          const lineEnd = text.indexOf('\n', idx);
          text = text.substring(lineEnd + 1);
          break;
        }
      }

      for (const marker of endMarkers) {
        const idx = text.indexOf(marker);
        if (idx !== -1) {
          text = text.substring(0, idx);
          break;
        }
      }

      text = text.trim();

      if (text.length < 100) {
        setError('Could not extract book content. Please try another book.');
        return;
      }

      // Cache for next time
      cacheBook(book.id, text);

      onSelectBook(text, book.title, book.author, book.id);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to fetch book content. Please try again.');
      }
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
      setLoadingBookId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGutenberg(searchQuery);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchGutenberg(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Substack: Select a publication and fetch its feed
  const handleSelectPublication = async (publication: SubstackPublication) => {
    setSelectedPublication(publication);
    setSubstackArticles([]);
    setSubstackError(null);
    setIsLoadingFeed(true);

    try {
      const articles = await fetchPublicationFeed(publication.name);
      setSubstackArticles(articles);
    } catch (err: any) {
      setSubstackError(err.message || 'Failed to load articles. Please try again.');
    } finally {
      setIsLoadingFeed(false);
    }
  };

  // Substack: Select an article to read
  const handleSelectArticle = (article: SubstackArticle) => {
    if (!article.content || article.content.length < 50) {
      setSubstackError('This article appears to be paywalled or has no readable content.');
      return;
    }

    setLoadingArticleId(article.id);

    // Cache the article content
    cacheSubstackArticle(article.id, article.content);

    // Pass to App.tsx handler
    onSelectSubstackArticle(
      article.content,
      article.title,
      article.author,
      article.id,
      article.publicationName
    );

    setLoadingArticleId(null);
  };

  // Substack: Go back to publications list
  const handleBackToPublications = () => {
    setSelectedPublication(null);
    setSubstackArticles([]);
    setSubstackError(null);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b] text-[#f5f5f4]' : 'bg-[#faf9f7] text-[#1c1c1c]'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDark ? 'bg-[#0a0a0b]/95' : 'bg-[#faf9f7]/95'} backdrop-blur-md border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              onClick={onBack}
              className={`flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-lg sm:text-2xl font-bold">Library</h1>
            <div className="w-12 sm:w-20"></div>
          </div>

          {/* Tabs */}
          <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'bg-amber-500 text-black'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <span className="hidden sm:inline">Books</span>
              <span className="sm:hidden">Books</span>
            </button>
            <button
              onClick={() => { setActiveTab('substack'); handleBackToPublications(); }}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'substack'
                  ? 'bg-amber-500 text-black'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <span className="hidden sm:inline">Substack</span>
              <span className="sm:hidden">Substack</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'bg-amber-500 text-black'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <span className="hidden sm:inline">Saved ({savedDocuments.length})</span>
              <span className="sm:hidden">Saved ({savedDocuments.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {activeTab === 'discover' && (
          <>
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4 sm:mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 60,000+ free books..."
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 pr-10 sm:pr-12 rounded-xl border text-sm sm:text-base ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500'
                      : 'bg-white border-zinc-200 text-black placeholder-zinc-400'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
                />
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                  {isSearching ? (
                    <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </form>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Featured or Search Results */}
            {searchResults.length > 0 ? (
              <>
                <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Search Results ({searchResults.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {searchResults.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={() => fetchBookContent(book)}
                      isLoading={loadingBookId === book.id}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </>
            ) : !searchQuery ? (
              <>
                <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Featured Classics
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {FEATURED_BOOKS.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book as GutenbergBook}
                      onSelect={() => fetchBookContent({ ...book, textUrl: `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.txt` } as GutenbergBook)}
                      isLoading={loadingBookId === book.id}
                      isDark={isDark}
                    />
                  ))}
                </div>

                <div className={`mt-6 sm:mt-12 p-4 sm:p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-zinc-100 border border-zinc-200'}`}>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">About Project Gutenberg</h3>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Project Gutenberg offers over 60,000 free eBooks. These are public domain works—classics whose copyright has expired.
                    You can read Pride and Prejudice, Sherlock Holmes, Moby Dick, and thousands more for free.
                  </p>
                </div>
              </>
            ) : null}
          </>
        )}

        {activeTab === 'substack' && (
          <>
            {substackError && (
              <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm">
                {substackError}
              </div>
            )}

            {selectedPublication ? (
              // Article list view
              <>
                <button
                  onClick={handleBackToPublications}
                  className={`flex items-center gap-2 mb-4 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'} transition-colors`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-sm">Back to publications</span>
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-lg overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} flex items-center justify-center`}>
                    <img
                      src={getPublicationLogoUrl(selectedPublication.name)}
                      alt={selectedPublication.displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedPublication.displayName}</h2>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>by {selectedPublication.author}</p>
                  </div>
                </div>

                {isLoadingFeed ? (
                  <div className="flex items-center justify-center py-12">
                    <svg className="w-8 h-8 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : substackArticles.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    No articles found. This publication may require a subscription.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {substackArticles.map((article) => (
                      <SubstackArticleCard
                        key={article.id}
                        article={article}
                        onSelect={() => handleSelectArticle(article)}
                        isLoading={loadingArticleId === article.id}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Publications grid view
              <>
                <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Featured Publications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {FEATURED_PUBLICATIONS.map((publication) => (
                    <SubstackPublicationCard
                      key={publication.name}
                      publication={publication}
                      onSelect={() => handleSelectPublication(publication)}
                      isDark={isDark}
                    />
                  ))}
                </div>

                <div className={`mt-6 sm:mt-12 p-4 sm:p-6 rounded-xl ${isDark ? 'bg-zinc-900/50 border border-zinc-800' : 'bg-zinc-100 border border-zinc-200'}`}>
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">About Substack</h3>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Substack is a platform for independent writers and publishers. Browse free articles from popular newsletters.
                    Note: Paywalled content requires a subscription and cannot be read here.
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <>
            {/* Resume Error Message */}
            {resumeError && (
              <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm">
                {resumeError}
              </div>
            )}

            {savedDocuments.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'} flex items-center justify-center`}>
                  <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  No saved documents
                </h3>
                <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  Your reading progress will be saved here automatically.
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Browse Library
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {savedDocuments.map((doc) => {
                  const isThisDocLoading = isLoadingResume && resumingDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className={`p-3 sm:p-4 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200'} flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-14 sm:w-12 sm:h-16 rounded-lg flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                          <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm sm:text-base">{doc.title}</h3>
                          {doc.author && (
                            <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{doc.author}</p>
                          )}
                          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                            <div className={`h-1 sm:h-1.5 flex-1 max-w-[150px] sm:max-w-[200px] rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${doc.progressPercent}%` }}
                              />
                            </div>
                            <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                              {Math.round(doc.progressPercent)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-auto sm:ml-0">
                        <button
                          onClick={() => !isThisDocLoading && handleResume(doc)}
                          disabled={isThisDocLoading}
                          className={`flex-1 sm:flex-none font-medium py-2.5 px-5 rounded-lg transition-colors text-xs sm:text-sm select-none flex items-center justify-center gap-2 ${
                            isThisDocLoading
                              ? 'bg-amber-500/50 text-black/50 cursor-not-allowed'
                              : 'bg-amber-500 active:bg-amber-600 text-black'
                          }`}
                          style={{ touchAction: 'manipulation' }}
                        >
                          {isThisDocLoading ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading...
                            </>
                          ) : doc.progressPercent > 0 ? 'Resume' : 'Read'}
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          disabled={isThisDocLoading}
                          className={`p-2.5 rounded-lg transition-colors select-none ${isDark ? 'active:bg-zinc-700 text-zinc-500' : 'active:bg-zinc-200 text-zinc-400'} ${isThisDocLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Book Card Component
const BookCard: React.FC<{
  book: GutenbergBook;
  onSelect: () => void;
  isLoading: boolean;
  isDark: boolean;
}> = ({ book, onSelect, isLoading, isDark }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      onClick={() => !isLoading && onSelect()}
      className={`group rounded-lg sm:rounded-xl border overflow-hidden transition-all active:scale-95 cursor-pointer select-none ${
        isDark
          ? 'bg-zinc-900/50 border-zinc-800 active:border-amber-500/50'
          : 'bg-white border-zinc-200 active:border-amber-500/50'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <div className={`aspect-[2/3] ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} flex items-center justify-center relative pointer-events-none`}>
        {book.coverUrl && !imgError ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            draggable={false}
          />
        ) : (
          <svg className={`w-8 h-8 sm:w-12 sm:h-12 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-4 pointer-events-none">
        <h3 className="font-medium text-xs sm:text-sm line-clamp-2 mb-0.5 sm:mb-1">{book.title}</h3>
        <p className={`text-[10px] sm:text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'} mb-2 sm:mb-3 truncate`}>{book.author}</p>
        <div
          className={`w-full text-center font-medium py-2 sm:py-2.5 px-2 sm:px-3 rounded-md sm:rounded-lg text-xs sm:text-sm ${
            isLoading
              ? 'bg-amber-500/50 text-black/50'
              : 'bg-amber-500 text-black'
          }`}
        >
          {isLoading ? 'Loading...' : 'Read Now'}
        </div>
      </div>
    </div>
  );
};

// Substack Publication Card Component
const SubstackPublicationCard: React.FC<{
  publication: SubstackPublication;
  onSelect: () => void;
  isDark: boolean;
}> = ({ publication, onSelect, isDark }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      onClick={onSelect}
      className={`group rounded-lg sm:rounded-xl border overflow-hidden transition-all active:scale-98 cursor-pointer select-none p-4 ${
        isDark
          ? 'bg-zinc-900/50 border-zinc-800 hover:border-amber-500/50'
          : 'bg-white border-zinc-200 hover:border-amber-500/50'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} flex items-center justify-center`}>
          {!imgError ? (
            <img
              src={getPublicationLogoUrl(publication.name)}
              alt={publication.displayName}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              draggable={false}
            />
          ) : (
            <svg className={`w-6 h-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm sm:text-base truncate">{publication.displayName}</h3>
          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>by {publication.author}</p>
          {publication.description && (
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'} line-clamp-2`}>{publication.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Substack Article Card Component
const SubstackArticleCard: React.FC<{
  article: SubstackArticle;
  onSelect: () => void;
  isLoading: boolean;
  isDark: boolean;
}> = ({ article, onSelect, isLoading, isDark }) => {
  const hasContent = article.content && article.content.length > 50;

  return (
    <div
      onClick={() => !isLoading && hasContent && onSelect()}
      className={`rounded-lg sm:rounded-xl border overflow-hidden transition-all select-none p-4 ${
        hasContent ? 'cursor-pointer active:scale-98' : 'cursor-not-allowed opacity-60'
      } ${
        isDark
          ? 'bg-zinc-900/50 border-zinc-800 hover:border-amber-500/50'
          : 'bg-white border-zinc-200 hover:border-amber-500/50'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-1">{article.title}</h3>
          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'} mb-2`}>
            {formatPublishedDate(article.publishedAt)}
          </p>
          {article.description && (
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'} line-clamp-2`}>
              {article.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
          )}
          {!hasContent && (
            <p className="text-xs text-amber-500 mt-2">Subscriber-only content</p>
          )}
        </div>
        <div className="flex-shrink-0">
          {isLoading ? (
            <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : hasContent ? (
            <button
              className="bg-amber-500 text-black font-medium py-2 px-4 rounded-lg text-xs sm:text-sm"
            >
              Read
            </button>
          ) : (
            <svg className={`w-5 h-5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
