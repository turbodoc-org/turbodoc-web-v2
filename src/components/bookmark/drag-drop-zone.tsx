'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Upload, Link2, Plus } from 'lucide-react';
import { createBookmark, getOgImage } from '@/lib/api';
import { Bookmark } from '@/lib/types';

interface DragDropZoneProps {
  onBookmarkCreated: (bookmark: Bookmark) => void;
}

export function DragDropZone({ onBookmarkCreated }: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);

    // Check if the dragged item contains a URL
    if (
      e.dataTransfer.types.includes('text/uri-list') ||
      e.dataTransfer.types.includes('text/plain')
    ) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev - 1);

    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const extractTitleFromHtml = (html: string): string => {
    // Try to extract title from link HTML
    const linkMatch = html.match(/<a[^>]*>([^<]+)<\/a>/i);
    if (linkMatch && linkMatch[1]) {
      return linkMatch[1].trim();
    }

    // Fallback: try to extract from any text content
    const textMatch = html.match(/>([^<]+)</);
    if (textMatch && textMatch[1]) {
      return textMatch[1].trim();
    }

    return '';
  };

  const extractUrlFromData = (dataTransfer: DataTransfer): string | null => {
    // Try to get URL from different data types
    const url =
      dataTransfer.getData('text/uri-list') ||
      dataTransfer.getData('text/plain') ||
      dataTransfer.getData('text/x-moz-url')?.split('\n')[0];

    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return url.trim();
    }

    return null;
  };

  const fetchTitleFromUrl = async (url: string): Promise<string> => {
    try {
      // Try to extract title from URL pathname as fallback
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || '';

      if (filename && filename !== '/') {
        return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      }

      return urlObj.hostname;
    } catch {
      return 'Untitled Bookmark';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);
    setIsCreating(true);

    try {
      // Extract URL
      const url = extractUrlFromData(e.dataTransfer);
      if (!url) {
        console.error('No valid URL found in dropped data');
        return;
      }

      // Extract title from HTML if available
      let title = '';
      const html = e.dataTransfer.getData('text/html');
      if (html) {
        title = extractTitleFromHtml(html);
      }

      // If no title from HTML, try to get it from URL or fetch OG data
      if (!title) {
        try {
          const ogData = await getOgImage(url);
          title = ogData.title || (await fetchTitleFromUrl(url));
        } catch {
          title = await fetchTitleFromUrl(url);
        }
      }

      // Create the bookmark
      const newBookmark = await createBookmark({
        title: title || 'Untitled Bookmark',
        url: url,
        status: 'unread',
      });

      // Fetch OG image for the created bookmark
      try {
        const ogData = await getOgImage(url);
        if (ogData.ogImage) {
          newBookmark.ogImage = ogData.ogImage;
        }
      } catch (error) {
        console.error('Failed to fetch OG image:', error);
      }

      onBookmarkCreated(newBookmark);
    } catch (error) {
      console.error('Failed to create bookmark from drop:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card
      ref={dropZoneRef}
      className={`
        transition-all duration-200 border-2 border-dashed bg-background/40 backdrop-blur-sm
        ${
          isDragOver
            ? 'border-primary bg-primary/10 shadow-lg scale-105'
            : 'border-border hover:border-primary/50'
        }
        ${isCreating ? 'opacity-50' : ''}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div
            className={`
            w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-200
            ${
              isDragOver
                ? 'bg-primary text-primary-foreground scale-110'
                : 'bg-secondary text-foreground'
            }
          `}
          >
            {isCreating ? (
              <div className="animate-spin">
                <Plus className="h-6 w-6" />
              </div>
            ) : isDragOver ? (
              <Link2 className="h-6 w-6" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>

          <h3
            className={`
            text-lg font-semibold mb-2 transition-colors duration-200
            text-foreground
          `}
          >
            {isCreating
              ? 'Creating bookmark...'
              : isDragOver
                ? 'Drop to create bookmark'
                : 'Drag & Drop Links Here'}
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            {isCreating
              ? 'Please wait while we save your bookmark'
              : isDragOver
                ? 'Release to add this link to your bookmarks'
                : 'Drag any link from your browser or other applications to quickly add it to your bookmarks'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
