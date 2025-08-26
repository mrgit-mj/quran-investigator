export type WordId = {
  chapter: number;
  verse: number;
};

export class Word {
  word: string;
  rootWord: string;
  definition: string;
  location: WordId;
  similarWords: WordId[];
  constructor(i: Partial<Word>) {
    this.word = i.word as string;
    this.rootWord = i.rootWord as string;
    this.definition = i.definition as string;
    this.location = i.location as WordId;
    this.similarWords = i.similarWords as WordId[];
  }

  getWord() {
    return {
      word: this.word,
      rootWord: this.rootWord,
      definition: this.definition,
      location: this.location,
      similarWords: this.similarWords,
    };
  }

  getDefinition() {
    return this.definition;
  }

  getSimilarWords() {
    return this.similarWords;
  }

  getLocation() {
    return this.location;
  }
}
