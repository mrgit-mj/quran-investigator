import { Chapter } from "./Chapter";
import { Word } from "./Word";

export interface Verse {
  id: string;
  chapterNumber: number;
  verseNumber: number;
  chapterName: string;
  chapterNameEnglish: string;
  verseString: string;
  chapter: Chapter;
  words: Word[];
}
