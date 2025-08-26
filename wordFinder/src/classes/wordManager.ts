import { Chapter } from "./chapter";
import { Logger } from "./logger";
import { Farasa } from "./farasa";
import { Verse } from "./verse";
import { Word, WordId } from "./word";
import * as fs from "fs";
import path from "path";

export type initialQuran = {
  verses: {
    verseNumber: number;
    verseString: string;
    verseStringB: string;
  }[];
  nameEnglish: string;
  nameTrans: string;
  nameArabic: string;
  chapterNumber: number;
  nVerses: number;
};

export class WordManager {
  chapters: Chapter[] = [];
  fileLocation: string;
  farasa = new Farasa();
  logger = Logger;

  constructor() {
    this.fileLocation = path.join(__dirname, "../../data/words.json");
  }

  insertChapter(chapter: Chapter) {
    this.chapters.push(chapter);
  }

  insertChapters(chapters: Chapter[]) {
    this.chapters = [...this.chapters, ...chapters];
  }

  getChapters() {
    return this.chapters;
  }

  getChapterById(id: string) {
    return this.chapters.find((chapter) => chapter.id === id);
  }

  getChapterByNumber(chapterNumber: number) {
    return this.chapters.find(
      (chapter) => chapter.chapterNumber === chapterNumber
    );
  }

  async processChapter(chapter: initialQuran) {
    const newChapter = new Chapter({
      chapterNumber: chapter.chapterNumber,
      chapterName: chapter.nameArabic,
      chapterNameEnglish: chapter.nameEnglish,
      verses: [],
    });

    const versesPromises: Promise<{
      original: string;
      lemmatized: string;
    }>[] = [];

    const combinedVerses = chapter.verses.reduce((acc, verse, i) => {
      if (i === chapter.verses.length - 1) {
        return acc + verse.verseString;
      }
      return acc + verse.verseString + "\n";
    }, "");

    const lemmatizedString = await this.farasa.lemmatize(combinedVerses);
    const verses = lemmatizedString.original.split("\n");
    const lemmatizedVerses = lemmatizedString.lemmatized.split("\n");
    // must remove last empty string from splitLemmatizedVerses
    lemmatizedVerses.pop();

    try {
      verses.forEach((verse, i) => {
        this.logger.logVerseProgress(
          i + 1,
          chapter.verses.length,
          newChapter.chapterName
        );
        const newVerse = new Verse({
          chapterId: newChapter.id,
          chapterName: newChapter.chapterName,
          chapterNameEnglish: newChapter.chapterNameEnglish,
          chapterNumber: newChapter.chapterNumber,
          verseNumber: i + 1,
          verseString: verse,
        });

        const originalWords = this.splitIntoWords(verse);
        const lemmaWords = this.splitIntoWords(lemmatizedVerses[i]);

        originalWords.forEach((word, i) => {
          const newWord: Word = new Word({
            word: word,
            rootWord: lemmaWords[i],
            definition: "",
            location: {
              chapter: newChapter.chapterNumber,
              verse: newVerse.verseNumber,
            },
          });
          newVerse.addWord(newWord);
        });

        newChapter.addVerse(newVerse);
      });
    } catch (error) {
      console.log("error: ", error);
    }

    this.insertChapter(newChapter);
  }

  async processChapters(quran: initialQuran[]) {
    this.logger.logStatic("Processing Chapters");

    for (const chapter of quran) {
      this.logger.logChapterProgress(
        chapter.chapterNumber,
        quran.length,
        chapter.nameArabic
      );
      await this.processChapter(chapter);
    }
  }

  toJson() {
    return this.chapters.map((chapter) => chapter.getChapter());
  }

  saveDataToFile() {
    const json = this.toJson();
    fs.writeFileSync(this.fileLocation, JSON.stringify(json));
  }

  loadFromFile() {
    try {
      if (!fs.existsSync(this.fileLocation)) {
        console.log(`File '${this.fileLocation}' Doesn't exists.`);
        return;
      }
      const data = fs.readFileSync(this.fileLocation, "utf-8");

      if (!data.length || data.length === 0) {
        console.error("error: File is empty.");
        return;
      }

      this.instanciateChapters(JSON.parse(data));
    } catch (error) {
      console.log("error: Failed to Load DB: ", error);
    }
  }

  instanciateChapters(data: Chapter[]) {
    const words: Word[] = [];
    const verses: Verse[] = [];
    const chapters: Chapter[] = [];

    data.forEach((chapter) => {
      const newChapter = new Chapter({
        chapterName: chapter.chapterName,
        chapterNumber: chapter.chapterNumber,
        chapterNameEnglish: chapter.chapterNameEnglish,
        verses: [],
      });

      newChapter.instanciateVerses(chapter.verses);
      chapters.push(newChapter);
    });

    this.chapters = chapters;
  }

  splitIntoWords(verse: string) {
    return verse.replace("\n", "").trim().split(" ");
  }
}
