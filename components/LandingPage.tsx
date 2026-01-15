
import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onStart: () => void;
  onOpenLibrary?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onOpenLibrary }) => {
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);

  // Demo chunks for animation
  const demoChunks = [
    "The skill",
    "stays with you",
    "even when",
    "you stop",
    "using the app."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChunkIndex((prev) => (prev + 1) % demoChunks.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f4] overflow-x-hidden overflow-y-auto">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Lumen" className="h-10 sm:h-12 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-zinc-400">
            <button onClick={() => scrollToSection('method')} className="hover:text-white transition-colors">Method</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('library')} className="hover:text-white transition-colors">Library</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button>
          </div>
          <button
            onClick={onStart}
            className="bg-amber-500 hover:bg-amber-400 text-black font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-6 sm:mb-8">
            <img src="/logo.png" alt="Lumen" className="h-24 sm:h-32 md:h-40 lg:h-48 w-auto mx-auto" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
            Illuminate your reading.
            <br />
            <span className="text-amber-500">The skill stays with you.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-zinc-400 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
            Most speed reading apps create dependency. Lumen builds comprehension that transfers to everything you read.
          </p>

          {/* Animated Demo */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 max-w-2xl mx-auto">
            <div className="text-xs sm:text-sm text-zinc-500 mb-3 sm:mb-4 uppercase tracking-wider">Live Preview</div>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center min-h-[60px] sm:min-h-[80px]">
              {demoChunks.map((chunk, index) => (
                <span
                  key={index}
                  className={`text-lg sm:text-2xl md:text-3xl font-serif transition-all duration-300 ${
                    index === activeChunkIndex
                      ? 'text-amber-500 scale-105 sm:scale-110 font-semibold'
                      : index < activeChunkIndex
                      ? 'text-zinc-600'
                      : 'text-zinc-700'
                  }`}
                >
                  {chunk}
                </span>
              ))}
            </div>
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2">
              <div className="h-1 bg-zinc-800 rounded-full flex-1 max-w-xs overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${((activeChunkIndex + 1) / demoChunks.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500">250 WPM</span>
            </div>
          </div>

          <button
            onClick={onStart}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/20"
          >
            Start Reading Free
          </button>
          <p className="text-xs sm:text-sm text-zinc-500 mt-3 sm:mt-4">No account required. Just paste and read.</p>
        </div>

        {/* Scroll indicator - hidden on mobile */}
        <div className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                RSVP apps flash words.
                <br />
                <span className="text-red-400">That's not reading.</span>
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg mb-3 sm:mb-4">
                You read fast inside the app, then forget everything. Your brain never learns to scan, predict, or chunk naturally.
              </p>
              <p className="text-zinc-300 text-base sm:text-lg font-medium">
                That's dependency, not skill.
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="text-xs sm:text-sm text-zinc-500 mb-3 sm:mb-4">Traditional RSVP (One word at a time)</div>
              <div className="text-center py-6 sm:py-8">
                <span className="text-3xl sm:text-4xl font-mono text-red-400 animate-pulse">reading</span>
              </div>
              <div className="text-xs text-zinc-600 text-center">
                No context. No comprehension. No transfer.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section id="method" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Lumen uses <span className="text-amber-500">semantic chunking</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto px-2">
              The way elite readers actually process text. You see surrounding context. Your brain learns to predict. The skill transfers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
            {/* RSVP comparison */}
            <div className="bg-zinc-900/50 border border-red-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-red-500 rounded-full"></span>
                <span className="text-xs sm:text-sm text-red-400 font-medium">Traditional RSVP</span>
              </div>
              <div className="space-y-2 font-mono text-xs sm:text-sm text-zinc-500">
                <div className="bg-zinc-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded">The</div>
                <div className="bg-zinc-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded">quick</div>
                <div className="bg-zinc-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded">brown</div>
                <div className="bg-zinc-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded">fox</div>
                <div className="bg-zinc-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded">jumps</div>
              </div>
              <p className="text-xs text-zinc-600 mt-3 sm:mt-4">One word. No context. No prediction.</p>
            </div>

            {/* Lumen */}
            <div className="bg-zinc-900/50 border border-amber-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-amber-500 rounded-full"></span>
                <span className="text-xs sm:text-sm text-amber-400 font-medium">Lumen Chunking</span>
              </div>
              <div className="space-y-2 font-serif text-base sm:text-lg">
                <div className="text-zinc-600 px-2 sm:px-3 py-1.5 sm:py-2">The quick brown fox</div>
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 sm:px-3 py-1.5 sm:py-2 rounded font-medium">
                  jumps over
                </div>
                <div className="text-zinc-600 px-2 sm:px-3 py-1.5 sm:py-2">the lazy dog.</div>
              </div>
              <p className="text-xs text-zinc-400 mt-3 sm:mt-4">Phrase chunks with context. Natural reading rhythm.</p>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 text-center px-2">
            <p className="text-base sm:text-lg text-zinc-300">
              Your brain sees the surrounding text and learns to <span className="text-amber-500 font-medium">predict what comes next</span>.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>That's how fast readers actually read.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Everything you need to train</h2>
            <p className="text-zinc-400 text-base sm:text-lg">Simple tools. Real results.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[
              {
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                title: "Paste anything",
                description: "Articles, essays, documents. Just paste and start."
              },
              {
                icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
                title: "Fetch URLs",
                description: "Import articles from any website."
              },
              {
                icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
                title: "Adjustable pace",
                description: "100-1000 WPM. Find your speed."
              },
              {
                icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
                title: "Bionic mode",
                description: "Bold first letters for focus."
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Track progress",
                description: "See your WPM improve."
              },
              {
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                title: "60,000+ books",
                description: "Free classics library."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-6 hover:border-zinc-700 transition-colors">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-2 sm:mb-4">
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-xs sm:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Library Section */}
      <section id="library" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full mb-4 sm:mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Free Library Included
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Don't have anything to read?
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              Access <span className="text-amber-500 font-semibold">60,000+ free books</span> from Project Gutenberg.
              Classic literature, timeless stories—all ready for speed reading.
            </p>
          </div>

          {/* Book covers showcase */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3 mb-8 sm:mb-10">
            {[
              { id: 1342, title: "Pride and Prejudice" },
              { id: 11, title: "Alice in Wonderland" },
              { id: 1661, title: "Sherlock Holmes" },
              { id: 84, title: "Frankenstein" },
              { id: 174, title: "Dorian Gray" },
              { id: 98, title: "Tale of Two Cities" },
              { id: 2701, title: "Moby Dick" },
              { id: 1232, title: "The Prince" },
            ].map((book) => (
              <div
                key={book.id}
                className="aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 hover:scale-105 transition-transform cursor-pointer"
                onClick={onOpenLibrary}
                title={book.title}
              >
                <img
                  src={`https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>

          {/* Featured titles */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 text-xs sm:text-sm text-zinc-500">
            <span className="px-2 sm:px-3 py-1 bg-zinc-900 rounded-full">Pride & Prejudice</span>
            <span className="px-2 sm:px-3 py-1 bg-zinc-900 rounded-full">Sherlock Holmes</span>
            <span className="px-2 sm:px-3 py-1 bg-zinc-900 rounded-full">Frankenstein</span>
            <span className="px-2 sm:px-3 py-1 bg-zinc-900 rounded-full">Moby Dick</span>
            <span className="hidden sm:inline px-3 py-1 bg-zinc-900 rounded-full">The Great Gatsby</span>
            <span className="px-2 sm:px-3 py-1 bg-zinc-900 rounded-full">+ 60,000 more</span>
          </div>

          <div className="text-center">
            <button
              onClick={onOpenLibrary}
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 sm:px-8 rounded-xl transition-colors text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Browse Free Library
            </button>
            <p className="text-xs sm:text-sm text-zinc-600 mt-3">
              No sign-up required. Start reading classics instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl p-6 sm:p-12">
            <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">40%</div>
            <p className="text-lg sm:text-2xl font-medium mb-3 sm:mb-4 px-2">
              After 3 weeks, users read <span className="text-amber-500">40% faster</span> — without the app.
            </p>
            <p className="text-zinc-400 text-sm sm:text-base px-2">
              The skill transfers because you're training real reading patterns, not app dependency.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-zinc-500 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No account required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Works on any device</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Simple pricing</h2>
            <p className="text-zinc-400 text-base sm:text-lg">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 max-w-3xl mx-auto">
            {/* Free tier */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl sm:rounded-2xl p-5 sm:p-8">
              <div className="text-xs sm:text-sm text-zinc-500 uppercase tracking-wider mb-2">Free</div>
              <div className="text-3xl sm:text-4xl font-bold mb-1">$0</div>
              <div className="text-zinc-500 text-sm mb-4 sm:mb-6">Forever free</div>

              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  "Paste any text",
                  "3 URL imports per day",
                  "Basic reading stats",
                  "All training features",
                  "60,000+ free books"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 sm:gap-3 text-zinc-300 text-sm sm:text-base">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={onStart}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
              >
                Get Started
              </button>
            </div>

            {/* Pro tier */}
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                COMING SOON
              </div>
              <div className="text-xs sm:text-sm text-amber-500 uppercase tracking-wider mb-2">Pro</div>
              <div className="text-3xl sm:text-4xl font-bold mb-1">$7</div>
              <div className="text-zinc-500 text-sm mb-4 sm:mb-6">per month</div>

              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  "Everything in Free",
                  "Unlimited URL imports",
                  "Unlimited saved docs",
                  "Full analytics history",
                  "Comprehension quizzes",
                  "Export your stats"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 sm:gap-3 text-zinc-300 text-sm sm:text-base">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="w-full bg-zinc-800 text-zinc-500 font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl cursor-not-allowed text-sm sm:text-base"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Frequently asked questions</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: "How is this different from Spreeder/Spritz?",
                a: "Traditional RSVP apps flash one word at a time with no context. Lumen shows semantic chunks—meaningful phrase groups—while keeping surrounding text visible. This trains your brain to predict and chunk naturally, building skills that transfer to regular reading."
              },
              {
                q: "Does it actually improve reading long-term?",
                a: "Yes. Because Lumen trains real reading patterns (chunking, prediction, peripheral awareness) rather than app-dependent reflexes, the improvements carry over. Users report reading faster even on physical books after 2-3 weeks of training."
              },
              {
                q: "What's semantic chunking?",
                a: "Semantic chunking breaks text at natural phrase boundaries—where meaning groups together. Instead of arbitrary 3-word splits, Lumen identifies prepositional phrases, clause boundaries, and natural pause points. This mirrors how expert readers actually process text."
              },
              {
                q: "Do I need to create an account?",
                a: "No. You can start reading immediately by pasting text. Account creation is only needed if you want to save documents and track progress over time."
              },
              {
                q: "What's in the free library?",
                a: "Access to over 60,000 public domain books from Project Gutenberg—classics like Pride and Prejudice, Sherlock Holmes, The Great Gatsby, and thousands more. All completely free."
              }
            ].map((faq, index) => (
              <details key={index} className="group bg-zinc-900/50 border border-zinc-800 rounded-lg sm:rounded-xl">
                <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer list-none">
                  <span className="font-medium text-sm sm:text-base pr-4">{faq.q}</span>
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 text-zinc-500 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-zinc-400 text-sm sm:text-base">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-t from-amber-500/5 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-2">
            Ready to illuminate your reading?
          </h2>
          <p className="text-base sm:text-xl text-zinc-400 mb-6 sm:mb-8 px-2">
            Stop depending on apps. Start building skills that last.
          </p>
          <button
            onClick={onStart}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/20"
          >
            Start Training Free
          </button>
          <p className="text-xs sm:text-sm text-zinc-500 mt-3 sm:mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Lumen" className="h-8 sm:h-10 w-auto" />
          </div>
          <div className="text-xs sm:text-sm text-zinc-600 text-center sm:text-right">
            Built for readers who want to get faster without the crutch.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
