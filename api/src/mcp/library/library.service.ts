import { Injectable } from '@nestjs/common';
import { BOOKS } from './catalogue.data';
import { z } from 'zod';
import { generateSignedUrl, isS3Url } from '../../common/s3.utils';
import { 
  LIBRARY_TOOLS, 
  LibraryToolName, 
  ListBooksParams, 
  ListChaptersParams, 
  GetChapterAudioParams,
  GetCatalogParams 
} from './library.tools';

@Injectable()
export class LibraryService {
  listBooks(params: z.infer<typeof ListBooksParams>) {
    const q = params.query.toLowerCase();
    return BOOKS.filter(
      (b) => b.title.toLowerCase().includes(q) || 
             b.author.toLowerCase().includes(q) ||
             b.chapters.some(ch => ch.title.toLowerCase().includes(q))
    ).map(({ book_id, title, author }) => ({ book_id, title, author }));
  }

  listChapters(params: z.infer<typeof ListChaptersParams>) {
    const book = BOOKS.find((b) => b.book_id === params.book_id);
    if (!book) throw new Error('Book not found');
    return book.chapters.map(({ chap_id, title }) => ({ chap_id, title }));
  }

  async getChapterAudio(params: z.infer<typeof GetChapterAudioParams>) {
    const book = BOOKS.find((b) => b.book_id === params.book_id);
    const chapter = book?.chapters.find((c) => c.chap_id === params.chap_id);
    if (!chapter) throw new Error('Chapter not found');
    
    let url = chapter.audio_url;
    if (isS3Url(url)) {
      url = await generateSignedUrl(url);
    }
    
    return { url, start_sec: chapter.start_sec };
  }

  getFullCatalog() {
    return BOOKS;
  }

  // MCP Tool Provider Interface
  getToolDefinitions() {
    return LIBRARY_TOOLS;
  }

  handles(toolName: string): toolName is LibraryToolName {
    return toolName in LIBRARY_TOOLS;
  }

  async execute(toolName: LibraryToolName, args: any) {
    switch (toolName) {
      case 'list_books':
        return this.listBooks(args);
      case 'list_chapters':
        return this.listChapters(args);
      case 'get_chapter_audio':
        return this.getChapterAudio(args);
      case 'get_catalog':
        return this.getFullCatalog();
      default:
        throw new Error(`Unknown library tool: ${toolName}`);
    }
  }
}