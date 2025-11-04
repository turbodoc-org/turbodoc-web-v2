export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  time_added: number;
  tags: string | null;
  status: 'read' | 'unread' | 'archived';
  created_at: string | null;
  updated_at: string | null;
  ogImage?: string | null;
}

export interface BookmarkResponse {
  data: Bookmark[];
}

export interface BookmarkSearchResponse {
  data: Bookmark[];
  query: string;
}

export interface OgImageResponse {
  ogImage: string | null;
  title: string | null;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string | null;
  version: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotesResponse {
  data: Note[];
  count: number;
}

export interface NoteResponse {
  data: Note;
}

export interface CodeSnippet {
  id: string;
  user_id: string;
  title: string;
  code: string;
  language: string;
  theme: string;
  background_type: string;
  background_value: string;
  padding: number;
  show_line_numbers: boolean;
  font_family: string;
  font_size: number;
  window_style: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CodeSnippetsResponse {
  data: CodeSnippet[];
}

export interface CodeSnippetResponse {
  data: CodeSnippet;
}
