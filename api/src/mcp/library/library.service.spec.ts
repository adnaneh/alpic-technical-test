import { LibraryService } from "./library.service";
import { BOOKS } from "./catalogue.data";

describe("LibraryService", () => {
  let service: LibraryService;

  beforeEach(() => {
    service = new LibraryService();
  });

  it("listChapters returns chapter ids and titles", () => {
    const book = BOOKS[0];
    const chapters = service.listChapters({ book_id: book.book_id });
    expect(chapters).toHaveLength(book.chapters.length);
    expect(chapters[0]).toEqual({
      chap_id: book.chapters[0].chap_id,
      title: book.chapters[0].title,
    });
  });

  it("getChapterAudio returns url and start_sec", async () => {
    const book = BOOKS[0];
    const chap = book.chapters[0];
    const res = await service.getChapterAudio({
      book_id: book.book_id,
      chap_id: chap.chap_id,
    });
    expect(res).toEqual({ url: book.audio_url, start_sec: chap.start_sec });
  });

  it("getChapterAudio throws for unknown chapter", async () => {
    const book = BOOKS[0];
    await expect(
      service.getChapterAudio({ book_id: book.book_id, chap_id: -1 }),
    ).rejects.toThrow("Chapter not found");
  });

  it("listBooks returns catalog entries with core fields", () => {
    const books = service.listBooks();
    expect(books.length).toBe(BOOKS.length);
    expect(books[0]).toMatchObject({
      book_id: BOOKS[0].book_id,
      title: BOOKS[0].title,
      author: BOOKS[0].author,
      audio_url: BOOKS[0].audio_url,
    });
  });
});
