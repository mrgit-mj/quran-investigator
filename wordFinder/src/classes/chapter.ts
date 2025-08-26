import { v4 as uuidv4 } from "uuid";
import { Verse } from "./verse";
import { uuid } from "../helper/types";

export type ChapterInit = {
  chapterNumber: number;
  chapterName: string;
  chapterNameEnglish: string;
  verses: Verse[];
};

export class Chapter {
  private _id: uuid;
  chapterNumber: number;
  chapterName: string;
  chapterNameEnglish: string;
  verses: Verse[] = [];

  constructor(init: ChapterInit) {
    this._id = uuidv4();
    this.chapterNumber = init.chapterNumber;
    this.chapterName = init.chapterName;
    this.chapterNameEnglish = init.chapterNameEnglish;
    init.verses.forEach((verse) => this.addVerse(verse));
  }

  set id(id: uuid) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  addVerse(verse: Verse) {
    this.verses.push(verse);
  }

  getVerses() {
    return this.verses;
  }

  addVerses(verses: Verse[]) {
    this.verses = [...this.verses, ...verses];
  }

  getChapter() {
    return {
      id: this.id,
      chapterNumber: this.chapterNumber,
      chapterName: this.chapterName,
      chapterNameEnglish: this.chapterNameEnglish,
      verses: this.verses.map((verse) => verse.getVerse()),
    };
  }

  instanciateVerses(data: Verse[]) {
    data.forEach((verse) => {
      const newVerse = new Verse({
        chapterId: this.id,
        chapterName: this.chapterName,
        chapterNameEnglish: this.chapterNameEnglish,
        chapterNumber: this.chapterNumber,
        verseNumber: verse.verseNumber,
        verseString: verse.verseString,
      });

      newVerse.instanciateWords(verse.words);
      this.addVerse(newVerse);
    });
  }
}
