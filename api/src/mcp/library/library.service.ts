import { Injectable } from '@nestjs/common';
import { Tool, Resource } from '@rekog/mcp-nest';
import { BOOKS } from './catalogue.data';
import { z } from 'zod';
import {
  ListChaptersParams,
  GetChapterAudioParams,
  // ListBooksParams,  // no longer needed for a resource
} from './library.schemas';

@Injectable()
export class LibraryService {
  @Tool({
    name: 'list_chapters',
    description: 'Get all chapters for a specific book',
    parameters: ListChaptersParams,
  })
  listChapters(params: z.infer<typeof ListChaptersParams>) {
    const book = this.findBook(params.book_id);
    return book.chapters.map(({ chap_id, title }) => ({ chap_id, title }));
  }

  @Tool({
    name: 'get_chapter_audio',
    description: 'Get the audio URL and timing information for a specific chapter',
    parameters: GetChapterAudioParams,
  })
  async getChapterAudio(params: z.infer<typeof GetChapterAudioParams>) {
    const book = this.findBook(params.book_id);
    const chapter = book.chapters.find((c) => c.chap_id === params.chap_id);
    if (!chapter) throw new Error('Chapter not found');

    return { url: book.audio_url, start_sec: chapter.start_sec };
  }

  // >>> listBooks is now a Resource (no params, read-only) <<<
  @Resource({
    uri: 'mcp://library/books',            // unique, stable identifier
    name: 'Library Catalog (Books)',
    description: 'Complete library catalog without chapters',
    mimeType: 'application/json',
  })
  listBooks() {
    // Return the content that should be served when the MCP client reads this resource
    return BOOKS.map(({ book_id, title, author, audio_url }) => ({
      book_id,
      title,
      author,
      audio_url,
    }));
  }

  private findBook(book_id: number) {
    const book = BOOKS.find((b) => b.book_id === book_id);
    if (!book) throw new Error('Book not found');
    return book;
  }
}
