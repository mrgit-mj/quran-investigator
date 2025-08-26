import { Verse } from "./Verse"; // Assuming Verse type exists in the same folder

export interface Word {
  id: string;
  word: string;
  rootWord: string;
  definition: string;
  lemmatized?: string; // Nullable lemmatized field
  verse: Verse; // Reference to the Verse type
  similarWords: Word[]; // Array of similar words
}
