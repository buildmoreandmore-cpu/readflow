import { SubstackPublication, SubstackArticle } from '../types';

const CORS_PROXY = 'https://corsproxy.io/?';

// Curated list of popular Substack publications
export const FEATURED_PUBLICATIONS: SubstackPublication[] = [
  {
    name: 'stratechery',
    displayName: 'Stratechery',
    author: 'Ben Thompson',
    description: 'Tech strategy and business analysis',
  },
  {
    name: 'pragmaticengineer',
    displayName: 'The Pragmatic Engineer',
    author: 'Gergely Orosz',
    description: 'Software engineering insights',
  },
  {
    name: 'bytebytego',
    displayName: 'ByteByteGo',
    author: 'Alex Xu',
    description: 'System design fundamentals',
  },
  {
    name: 'lennysnewsletter',
    displayName: "Lenny's Newsletter",
    author: 'Lenny Rachitsky',
    description: 'Product management advice',
  },
  {
    name: 'thediff',
    displayName: 'The Diff',
    author: 'Byrne Hobart',
    description: 'Finance, tech, and economics',
  },
  {
    name: 'platformer',
    displayName: 'Platformer',
    author: 'Casey Newton',
    description: 'Tech and democracy coverage',
  },
  {
    name: 'noahpinion',
    displayName: 'Noahpinion',
    author: 'Noah Smith',
    description: 'Economics and policy',
  },
  {
    name: 'thegeneralist',
    displayName: 'The Generalist',
    author: 'Mario Gabriele',
    description: 'Deep dives into tech companies',
  },
];

// Fetch and parse RSS feed for a publication
export async function fetchPublicationFeed(publicationName: string): Promise<SubstackArticle[]> {
  const feedUrl = `https://${publicationName}.substack.com/feed`;
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`);
    }

    const xmlText = await response.text();
    return parseSubstackRSS(xmlText, publicationName);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
}

// Parse RSS XML into SubstackArticle array
function parseSubstackRSS(xmlText: string, publicationName: string): SubstackArticle[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Failed to parse RSS feed');
  }

  const items = doc.querySelectorAll('item');

  return Array.from(items).map((item) => {
    // Get content:encoded (full HTML content)
    const contentEncoded = item.getElementsByTagName('content:encoded')[0]?.textContent || '';

    return {
      id: item.querySelector('guid')?.textContent || `${publicationName}-${Date.now()}`,
      title: item.querySelector('title')?.textContent || 'Untitled',
      author: item.getElementsByTagName('dc:creator')[0]?.textContent || publicationName,
      publicationName,
      publishedAt: item.querySelector('pubDate')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      content: extractTextFromHTML(contentEncoded),
    };
  });
}

// Extract plain text from HTML content for speed reading
export function extractTextFromHTML(html: string): string {
  if (!html) return '';

  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Remove unwanted elements
  const selectorsToRemove = [
    'script', 'style', 'button', 'form', 'nav', 'footer',
    'iframe', 'noscript', '.subscription-widget', '.subscribe-widget',
    '.footnote', '.paywall'
  ];

  selectorsToRemove.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Extract text from block-level elements, preserving structure
  const blockElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre');

  if (blockElements.length > 0) {
    return Array.from(blockElements)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 0)
      .join('\n\n');
  }

  // Fallback: get all text content
  return doc.body?.textContent?.trim() || '';
}

// Format date for display
export function formatPublishedDate(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Get publication logo URL (Substack uses a standard pattern)
export function getPublicationLogoUrl(publicationName: string): string {
  return `https://${publicationName}.substack.com/favicon.ico`;
}
