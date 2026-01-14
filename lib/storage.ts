
import { SavedDocument, ReadingSession } from '../types';

const DOCUMENTS_KEY = 'flowstate_documents';
const SESSIONS_KEY = 'flowstate_sessions';
const CURRENT_DOC_KEY = 'flowstate_current_doc';

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Documents
export const getSavedDocuments = (): SavedDocument[] => {
  try {
    const data = localStorage.getItem(DOCUMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveDocument = (doc: Omit<SavedDocument, 'id' | 'createdAt' | 'updatedAt'>): SavedDocument => {
  const documents = getSavedDocuments();
  const newDoc: SavedDocument = {
    ...doc,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  documents.unshift(newDoc);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
  return newDoc;
};

export const updateDocument = (id: string, updates: Partial<SavedDocument>): void => {
  const documents = getSavedDocuments();
  const index = documents.findIndex(d => d.id === id);
  if (index !== -1) {
    documents[index] = {
      ...documents[index],
      ...updates,
      updatedAt: Date.now(),
    };
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
  }
};

export const deleteDocument = (id: string): void => {
  const documents = getSavedDocuments().filter(d => d.id !== id);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
};

export const getDocument = (id: string): SavedDocument | null => {
  const documents = getSavedDocuments();
  return documents.find(d => d.id === id) || null;
};

// Reading Sessions
export const getReadingSessions = (): ReadingSession[] => {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveReadingSession = (session: Omit<ReadingSession, 'id'>): ReadingSession => {
  const sessions = getReadingSessions();
  const newSession: ReadingSession = {
    ...session,
    id: generateId(),
  };
  sessions.unshift(newSession);
  // Keep only last 100 sessions
  if (sessions.length > 100) {
    sessions.splice(100);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return newSession;
};

export const clearAllSessions = (): void => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify([]));
};

// Current document tracking (for resuming)
export const setCurrentDocument = (docId: string | null): void => {
  if (docId) {
    localStorage.setItem(CURRENT_DOC_KEY, docId);
  } else {
    localStorage.removeItem(CURRENT_DOC_KEY);
  }
};

export const getCurrentDocumentId = (): string | null => {
  return localStorage.getItem(CURRENT_DOC_KEY);
};

// Check if first visit (for showing landing page)
const VISITED_KEY = 'flowstate_visited';

export const hasVisitedBefore = (): boolean => {
  return localStorage.getItem(VISITED_KEY) === 'true';
};

export const markAsVisited = (): void => {
  localStorage.setItem(VISITED_KEY, 'true');
};
