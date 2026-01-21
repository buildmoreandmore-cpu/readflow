import { SubstackPublication, SubstackArticle, SubstackCategory } from '../types';

const CORS_PROXY = 'https://corsproxy.io/?';

// Curated list of popular Substack publications
export const FEATURED_PUBLICATIONS: SubstackPublication[] = [
  // Tech & Engineering
  {
    name: 'stratechery',
    displayName: 'Stratechery',
    author: 'Ben Thompson',
    description: 'Tech strategy and business analysis',
    category: SubstackCategory.TECH,
  },
  {
    name: 'pragmaticengineer',
    displayName: 'The Pragmatic Engineer',
    author: 'Gergely Orosz',
    description: 'Software engineering insights',
    category: SubstackCategory.TECH,
  },
  {
    name: 'bytebytego',
    displayName: 'ByteByteGo',
    author: 'Alex Xu',
    description: 'System design fundamentals',
    category: SubstackCategory.TECH,
  },
  {
    name: 'thegeneralist',
    displayName: 'The Generalist',
    author: 'Mario Gabriele',
    description: 'Deep dives into tech companies',
    category: SubstackCategory.TECH,
  },
  {
    name: 'platformer',
    displayName: 'Platformer',
    author: 'Casey Newton',
    description: 'Tech and democracy coverage',
    category: SubstackCategory.TECH,
  },
  {
    name: 'notboring',
    displayName: 'Not Boring',
    author: 'Packy McCormick',
    description: 'Optimistic takes on business and tech',
    category: SubstackCategory.TECH,
  },
  {
    name: 'technically',
    displayName: 'Technically',
    author: 'Justin Gage',
    description: 'Tech explained simply',
    category: SubstackCategory.TECH,
  },
  // Business & Finance
  {
    name: 'thediff',
    displayName: 'The Diff',
    author: 'Byrne Hobart',
    description: 'Finance, tech, and economics',
    category: SubstackCategory.BUSINESS,
  },
  {
    name: 'lennysnewsletter',
    displayName: "Lenny's Newsletter",
    author: 'Lenny Rachitsky',
    description: 'Product management advice',
    category: SubstackCategory.BUSINESS,
  },
  {
    name: 'netinterest',
    displayName: 'Net Interest',
    author: 'Marc Rubinstein',
    description: 'Finance industry deep dives',
    category: SubstackCategory.BUSINESS,
  },
  {
    name: 'thehustle',
    displayName: 'The Hustle',
    author: 'The Hustle Team',
    description: 'Business news and trends',
    category: SubstackCategory.BUSINESS,
  },
  {
    name: 'fintechtoday',
    displayName: 'Fintech Today',
    author: 'Ian Kar',
    description: 'Fintech industry coverage',
    category: SubstackCategory.BUSINESS,
  },
  // Culture & Society
  {
    name: 'culture',
    displayName: 'Culture Study',
    author: 'Anne Helen Petersen',
    description: 'Culture and work analysis',
    category: SubstackCategory.CULTURE,
  },
  {
    name: 'garbageday',
    displayName: 'Garbage Day',
    author: 'Ryan Broderick',
    description: 'Internet culture newsletter',
    category: SubstackCategory.CULTURE,
  },
  {
    name: 'thefp',
    displayName: 'The Free Press',
    author: 'Bari Weiss',
    description: 'Independent journalism',
    category: SubstackCategory.CULTURE,
  },
  // Science & Health
  {
    name: 'groundtruths',
    displayName: 'Ground Truths',
    author: 'Eric Topol',
    description: 'Medicine and AI insights',
    category: SubstackCategory.SCIENCE,
  },
  {
    name: 'yourlocalepidemiologist',
    displayName: 'Your Local Epidemiologist',
    author: 'Katelyn Jetelina',
    description: 'Public health explained',
    category: SubstackCategory.SCIENCE,
  },
  {
    name: 'parentdata',
    displayName: 'ParentData',
    author: 'Emily Oster',
    description: 'Data-driven parenting',
    category: SubstackCategory.SCIENCE,
  },
  // Politics & Policy
  {
    name: 'noahpinion',
    displayName: 'Noahpinion',
    author: 'Noah Smith',
    description: 'Economics and policy',
    category: SubstackCategory.POLITICS,
  },
  {
    name: 'slowboring',
    displayName: 'Slow Boring',
    author: 'Matthew Yglesias',
    description: 'Policy and politics analysis',
    category: SubstackCategory.POLITICS,
  },
  {
    name: 'thedispatch',
    displayName: 'The Dispatch',
    author: 'The Dispatch Team',
    description: 'Conservative news and commentary',
    category: SubstackCategory.POLITICS,
  },
  {
    name: 'silverbulletin',
    displayName: 'Silver Bulletin',
    author: 'Nate Silver',
    description: 'Data-driven political analysis',
    category: SubstackCategory.POLITICS,
  },
  // Personal Growth
  {
    name: 'waitbutwhy',
    displayName: 'Wait But Why',
    author: 'Tim Urban',
    description: 'Long-form essays on life',
    category: SubstackCategory.PERSONAL,
  },
  {
    name: 'jamesclear',
    displayName: '3-2-1 Thursday',
    author: 'James Clear',
    description: 'Habits and self-improvement',
    category: SubstackCategory.PERSONAL,
  },
  {
    name: 'theprofile',
    displayName: 'The Profile',
    author: 'Polina Marinova',
    description: 'Profiles of remarkable people',
    category: SubstackCategory.PERSONAL,
  },
  // Sports
  {
    name: 'defector',
    displayName: 'Defector',
    author: 'Defector Staff',
    description: 'Sports and culture',
    category: SubstackCategory.SPORTS,
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

// Validate and fetch publication metadata from a Substack URL
export async function validateAndFetchPublication(
  substackInput: string,
  category: SubstackCategory
): Promise<SubstackPublication | null> {
  // Extract publication name from URL or use directly
  let publicationName = substackInput.trim().toLowerCase();

  // Handle full URLs like "https://stratechery.substack.com" or "stratechery.substack.com"
  const urlMatch = publicationName.match(/(?:https?:\/\/)?([a-z0-9-]+)\.substack\.com/);
  if (urlMatch) {
    publicationName = urlMatch[1];
  }

  // Remove any remaining special characters
  publicationName = publicationName.replace(/[^a-z0-9-]/g, '');

  if (!publicationName) {
    throw new Error('Invalid publication name');
  }

  const feedUrl = `https://${publicationName}.substack.com/feed`;
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Publication not found');
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid RSS feed');
    }

    // Extract metadata from the channel
    const channel = doc.querySelector('channel');
    if (!channel) {
      throw new Error('Invalid RSS feed structure');
    }

    const title = channel.querySelector('title')?.textContent || publicationName;
    const description = channel.querySelector('description')?.textContent || '';

    // Try to get author from first item's dc:creator
    const firstItem = doc.querySelector('item');
    const author = firstItem?.getElementsByTagName('dc:creator')[0]?.textContent || title;

    return {
      name: publicationName,
      displayName: title,
      author: author,
      description: description.substring(0, 150),
      category: category,
      isUserAdded: true,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw new Error(err.message || 'Failed to validate publication');
  }
}
