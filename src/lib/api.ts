import { supabase } from './clients/supabase/client';
import {
  Bookmark,
  BookmarkResponse,
  BookmarkSearchResponse,
  OgImageResponse,
  Note,
  NotesResponse,
  NoteResponse,
  CodeSnippet,
  CodeSnippetsResponse,
  CodeSnippetResponse,
  Diagram,
  DiagramsResponse,
  DiagramResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.turbodoc.ai';

export async function getBookmarks(): Promise<Bookmark[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/bookmarks`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookmarks');
  }

  const result: BookmarkResponse = await response.json();
  return result.data;
}

export async function searchBookmarks(query: string): Promise<Bookmark[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(
    `${API_BASE_URL}/v1/bookmarks/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to search bookmarks');
  }

  const result: BookmarkSearchResponse = await response.json();
  return result.data;
}

export async function getOgImage(url: string): Promise<OgImageResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(
    `${API_BASE_URL}/v1/bookmarks/og-image?url=${encodeURIComponent(url)}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    return { ogImage: null, title: null };
  }

  return await response.json();
}

export async function deleteBookmark(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/bookmarks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete bookmark');
  }
}

export async function updateBookmark(
  id: string,
  updates: Partial<Bookmark>,
): Promise<Bookmark> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/bookmarks/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update bookmark');
  }

  const result = await response.json();
  return result.data;
}

export async function createBookmark(bookmark: {
  title: string;
  url: string;
  tags?: string;
  status?: string;
}): Promise<Bookmark> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/bookmarks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookmark),
  });

  if (!response.ok) {
    throw new Error('Failed to create bookmark');
  }

  const result = await response.json();
  return result.data;
}

// Notes API functions
export async function getNotes(): Promise<Note[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/notes`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  const result: NotesResponse = await response.json();
  return result.data;
}

export async function getNote(id: string): Promise<Note> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/notes/${id}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch note');
  }

  const result: NoteResponse = await response.json();
  return result.data;
}

export async function createNote(note: {
  title?: string;
  content?: string;
  tags?: string;
}): Promise<Note> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  const result = await response.json();
  return result.data;
}

export async function updateNote(
  id: string,
  updates: Partial<Note>,
): Promise<Note> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/notes/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  // Handle version conflict (409)
  if (response.status === 409) {
    const conflictData = await response.json();
    const error: any = new Error('Version conflict detected');
    error.conflict = true;
    error.serverNote = conflictData.data;
    throw error;
  }

  if (!response.ok) {
    throw new Error('Failed to update note');
  }

  const result = await response.json();
  return result.data;
}

export async function deleteNote(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/notes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
}

// Code Snippets API functions
export async function getCodeSnippets(): Promise<CodeSnippet[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/code-snippets`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch code snippets');
  }

  const result: CodeSnippetsResponse = await response.json();
  return result.data;
}

export async function createCodeSnippet(snippet: {
  title: string;
  code: string;
  language?: string;
  theme?: string;
  background_type?: string;
  background_value?: string;
  padding?: number;
  show_line_numbers?: boolean;
  font_family?: string;
  font_size?: number;
  window_style?: string;
}): Promise<CodeSnippet> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/code-snippets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snippet),
  });

  if (!response.ok) {
    throw new Error('Failed to create code snippet');
  }

  const result: CodeSnippetResponse = await response.json();
  return result.data;
}

export async function updateCodeSnippet(
  id: string,
  updates: Partial<CodeSnippet>,
): Promise<CodeSnippet> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/code-snippets/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update code snippet');
  }

  const result: CodeSnippetResponse = await response.json();
  return result.data;
}

export async function deleteCodeSnippet(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/code-snippets/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete code snippet');
  }
}

// Diagram API functions
export async function getDiagrams(): Promise<Diagram[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/diagrams`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch diagrams');
  }

  const result: DiagramsResponse = await response.json();
  return result.data;
}

export async function getDiagram(id: string): Promise<Diagram> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/diagrams/${id}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch diagram');
  }

  const result: DiagramResponse = await response.json();
  return result.data;
}

export async function createDiagram(diagram: {
  title: string;
  shapes?: any[];
  connections?: any[];
  thumbnail?: string;
}): Promise<Diagram> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/diagrams`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(diagram),
  });

  if (!response.ok) {
    throw new Error('Failed to create diagram');
  }

  const result: DiagramResponse = await response.json();
  return result.data;
}

export async function updateDiagram(
  id: string,
  updates: Partial<Diagram>,
): Promise<Diagram> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/diagrams/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update diagram');
  }

  const result: DiagramResponse = await response.json();
  return result.data;
}

export async function deleteDiagram(id: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/diagrams/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete diagram');
  }
}

export async function duplicateDiagram(id: string): Promise<Diagram> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No session found');
  }

  const response = await fetch(`${API_BASE_URL}/v1/diagrams/${id}/duplicate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to duplicate diagram');
  }

  const result: DiagramResponse = await response.json();
  return result.data;
}

// Contact API function (no authentication required)
export async function sendContactMessage(contactData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/v1/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return await response.json();
}
