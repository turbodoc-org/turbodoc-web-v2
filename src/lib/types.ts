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

export interface DiagramShape {
  id: string;
  type: 'rectangle' | 'circle' | 'diamond' | 'database' | 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color?: string;
  fontSize?: number;
  imageUrl?: string;
}

export interface DiagramConnection {
  id: string;
  from: string;
  to: string;
  fromAnchor: string;
  toAnchor: string;
}

export interface Diagram {
  id: string;
  user_id: string;
  title: string;
  shapes: DiagramShape[];
  connections: DiagramConnection[];
  thumbnail?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiagramListItem {
  id: string;
  title: string;
  thumbnail?: string | null;
  updated_at: string;
}

export interface DiagramsResponse {
  data: Diagram[];
}

export interface DiagramResponse {
  data: Diagram;
}

export interface DiagramListResponse {
  data: DiagramListItem[];
}
