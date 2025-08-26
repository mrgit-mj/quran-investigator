import { v4 as uuidv4 } from "uuid";
import { uuid } from "../helper/types";
import { Word } from "./word";

export type VerseInit = Partial<Verse>;

export class Verse {
  id: uuid;
  chapterNumber: number;
  verseNumber: number;
  chapterName: string;
  chapterId: uuid;
  chapterNameEnglish: string;
  verseString: string;
  words: Word[] = [];

  constructor(i: Partial<Verse>) {
    this.id = uuidv4();
    this.chapterNumber = i.chapterNumber as number;
    this.verseNumber = i.verseNumber as number;
    this.chapterName = i.chapterName as string;
    this.chapterId = i.chapterId as uuid;
    this.chapterNameEnglish = i.chapterNameEnglish as string;
    this.verseString = i.verseString as string;
  }

  addWord(word: Word) {
    this.words.push(word);
  }

  addWords(word: Word[]) {
    this.words = [...this.words, ...word];
  }

  getVerse() {
    return {
      id: this.id,
      chapterNumber: this.chapterNumber,
      verseNumber: this.verseNumber,
      chapterName: this.chapterName,
      chapterId: this.chapterId,
      chapterNameEnglish: this.chapterNameEnglish,
      verseString: this.verseString,
      words: this.words.map((word) => word.getWord()),
    };
  }

  getVerseString() {
    return this.verseString;
  }

  instanciateWords(data: Word[]) {
    data.forEach((word) => {
      const newWord = new Word(word);
      this.addWord(newWord);
    });
  }
}
