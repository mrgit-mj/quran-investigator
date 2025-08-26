import { Verse } from "./Verse";

export interface Chapter {
  id: string;
  chapterNumber: number;
  chapterName: string;
  chapterNameEnglish: string;
  verses: Verse[];
}
