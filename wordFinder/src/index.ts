import { WordManager, Farasa, Word } from "./classes";
import * as fs from "fs";
import path from "path";
import { Chapter } from "./classes/chapter";
import { Verse } from "./classes/verse";
import { initialQuran } from "./classes/wordManager";

// use this function to run the scripts you want to run
async function main() {
  const manager = initializeManager();
  console.log("done");
}

function initializeManager() {
  const wordManager = new WordManager();
  wordManager.loadFromFile();

  return wordManager;
}

// use this function to process the quran files if you dont have an already processed data
async function processData() {
  // const wordManager = initializeManager();
  const wordManager = new WordManager();
  const quran: initialQuran[] = readQuranFiles();
  await wordManager.processChapters(quran);
  // wordManager.saveDataToFile();
}

function readQuranFiles() {
  const quranFiles = fs.readdirSync(path.join(__dirname, "../quran"));
  const quran: initialQuran[] = [];
  quranFiles.forEach((file) => {
    const quranFile = fs.readFileSync(
      path.join(__dirname, "../quran", file),
      "utf-8"
    );
    quran.push(JSON.parse(quranFile));
  });

  return quran;
}

main()
  .then((lemmatized) => {
    console.log("the lemma: ", lemmatized);
  })
  .catch((err) => {
    console.log("error: ", err);
  });
