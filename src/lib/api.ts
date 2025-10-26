import { supabase } from './clients/supabase';
import {
  Bookmark,
  BookmarkResponse,
  BookmarkSearchResponse,
  OgImageResponse,
  Note,
  NotesResponse,
  NoteResponse,
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
