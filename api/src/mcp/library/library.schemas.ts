import { z } from "zod";

const id = (name: string) =>
  z.number().describe(`The unique ID of the ${name}`);

export const ListChaptersParams = z.object({ book_id: id("book") });

export const GetChapterAudioParams = z.object({
  book_id: id("book"),
  chap_id: id("chapter"),
});

export const ListBooksParams = z.object({});
