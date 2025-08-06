import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { BOOKS } from './catalogue.data';
import { z } from 'zod';
import {
  ListChaptersParams,
  GetChapterAudioParams,
  ListBooksParams,
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

  @Tool({
    name: 'list_books',
    description: 'Get the complete library catalog without chapters',
    parameters: ListBooksParams,
  })
  listBooks() {
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
