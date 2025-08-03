import { z } from 'zod';

// Tool parameter schemas
export const ListBooksParams = z.object({ 
  query: z.string().describe('Search query for books by title, author, or chapter content') 
});

export const ListChaptersParams = z.object({ 
  book_id: z.number().describe('The unique ID of the book') 
});

export const GetChapterAudioParams = z.object({ 
  book_id: z.number().describe('The unique ID of the book'),
  chap_id: z.number().describe('The unique ID of the chapter') 
});

export const GetCatalogParams = z.object({});

// Tool definitions for AI SDK
export const LIBRARY_TOOLS = {
  list_books: {
    description: 'Search for books in the library by title, author, or chapter content',
    parameters: ListBooksParams,
  },
  list_chapters: {
    description: 'Get all chapters for a specific book',
    parameters: ListChaptersParams,
  },
  get_chapter_audio: {
    description: 'Get the audio URL and timing information for a specific chapter',
    parameters: GetChapterAudioParams,
  },
  get_catalog: {
    description: 'Get the complete library catalog with all books and chapters',
    parameters: GetCatalogParams,
  },
};

export type LibraryToolName = keyof typeof LIBRARY_TOOLS;