import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { Verse } from './entities/verse.entity';
import { Word } from './entities/word.entity';
import { FarasaService } from './farasa/farasa.service'; // Assuming FarasaService handles the lemmatization
import { LoggerService } from './logger.service'; // Assuming you have a logger module
import { initialQuran } from './types/quran';
import * as path from 'path';
import * as fs from 'fs';
import { OpenAIService } from './openAi/openAi.service';
import { OllamaService } from './ollama/ollama.service';
import { RelatedWord } from './entities/related-word.entity';
import { distance } from 'fastest-levenshtein';

@Injectable()
export class ProccessorService {
  constructor(
    @InjectRepository(Chapter) private chapterRepository: Repository<Chapter>,
    @InjectRepository(Verse) private verseRepository: Repository<Verse>,
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(RelatedWord)
    private relatedWordRepository: Repository<RelatedWord>,
    private readonly farasaService: FarasaService,
    private readonly openAIService: OpenAIService,
    private readonly ollamaService: OllamaService,
    private readonly loggerService: LoggerService,
  ) {}

  async processWordsInBatches(
    batchSize: number = 50,
    maxRoots: string = '50',
  ): Promise<string> {
    let max: number | null = null; // Max will be null if "all", otherwise a number
    let numberOfProcessedWords = 0;
    let rootWordsFound = 0;

    // Parse the maxRoots value
    if (maxRoots === 'all') {
      max = null; // Process all entries in the database
    } else if (!isNaN(parseInt(maxRoots, 10))) {
      max = parseInt(maxRoots, 10); // Parse the string to a number
    } else {
      max = 50; // Default to 50 if maxRoots is undefined or invalid
    }

    let offset = 0;
    let hasMoreWords = true;
    let totalProcessed = 0;

    while (hasMoreWords && (max === null || totalProcessed < max)) {
      // Adjust batch size if approaching the maxRoots limit
      const remainingRoots = max !== null ? max - totalProcessed : batchSize;
      const currentBatchSize = Math.min(batchSize, remainingRoots);

      // Read the words in batches, only where lemmatized is null
      // const words = await this.wordRepository.find({
      //   where: { lemmatized: IsNull(), word: Not('') },
      //   skip: offset,
      //   take: currentBatchSize,
      // });

      const words = await this.wordRepository
        .createQueryBuilder('word')
        .where('word.lemmatized IS NULL')
        .andWhere("word.word != ''")
        .andWhere(
          "LENGTH(regexp_replace(word.word, '[\\u064B-\\u0652]', '', 'g')) > 3",
        ) // Ensures words longer than 3 characters
        .skip(offset)
        .take(currentBatchSize)
        .getMany();

      if (words.length === 0) {
        hasMoreWords = false;
        break;
      }

      // Extract the rootWord fields from the words for OpenAI processing
      const wordTexts = words.map((word) => word.word);

      // Call OpenAI to find root words
      const rootWordsResponse =
        await this.openAIService.findRootWords(wordTexts);

      // Process the OpenAI response and map it to word-root pairs
      const rootWordsMap = this.parseOpenAIResponse(rootWordsResponse);

      // Update each word with its lemmatized root found by OpenAI via matching
      const processedWords = words.map((word) => {
        const root = rootWordsMap[word.word];
        if (root) {
          rootWordsFound += 1;
        }

        word.lemmatized = root || null;
        return word;
      });

      // Save all words in the batch at once for better performance
      await this.wordRepository.save(processedWords);

      numberOfProcessedWords += processedWords.length;
      // Update counters
      offset += currentBatchSize;
      totalProcessed += currentBatchSize;
      console.log(
        `Words processed: ${totalProcessed} - roots found: ${rootWordsFound}`,
      );
    }

    return `Processed words: ${numberOfProcessedWords}, rootsFound: ${rootWordsFound}`;
  }

  async cleanLemmatizedWords(): Promise<void> {
    console.log('Starting the clean-up process...');

    // Step 1: Find words with spaces or dashes in the lemmatized field
    const wordsToClean = await this.wordRepository
      .createQueryBuilder('word')
      .where("word.lemmatized LIKE '% %' OR word.lemmatized LIKE '%-%'")
      .getMany();

    console.log(`Found ${wordsToClean.length} words to clean`);

    if (wordsToClean.length === 0) {
      console.log('No words to clean.');
      return;
    }

    // Step 2: Clean and update each word
    for (let i = 0; i < wordsToClean.length; i++) {
      const word = wordsToClean[i];

      // Clean the lemmatized field by removing spaces and dashes
      const cleanedLemmatized = word.lemmatized.replace(/[\s-]/g, '');

      // Log progress
      console.log(
        `Cleaning word ${i + 1}/${wordsToClean.length}: '${word.lemmatized}' -> '${cleanedLemmatized}'`,
      );

      // Update the word in the database
      try {
        await this.wordRepository
          .createQueryBuilder()
          .update('word')
          .set({ lemmatized: cleanedLemmatized })
          .where('id = :id', { id: word.id })
          .execute();
      } catch (error) {
        console.error(
          `Error updating word with id ${word.id}: ${error.message}`,
        );
      }
    }

    console.log('Clean-up process completed.');
  }
  /**
   * Parse the OpenAI response into a map of word -> root word.
   * @param response The raw response from OpenAI
   * @returns A map of words to their root words
   */
  private parseOpenAIResponse(response: string[]): Record<string, string> {
    const wordRootMap: Record<string, string> = {};

    response.forEach((line) => {
      const [word, root] = line.split(',');
      if (word && root) {
        wordRootMap[word.trim()] = root.trim(); // Trim any extra spaces
      }
    });

    return wordRootMap;
  }

  // Load local Quran data from file
  async loadLocalQuranData(): Promise<initialQuran[]> {
    const filePath = path.join(__dirname, '..', 'data', 'quran.json'); // Adjust the path to your data
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData) as initialQuran[];
  }

  // Process all chapters synchronously
  async processChapters(quran: initialQuran[]): Promise<void> {
    console.log('Processing Chapters');

    // Synchronous processing of each chapter
    for (const chapter of quran) {
      console.log('Processing Chapter', chapter.nameArabic);
      await this.processChapter(chapter);
    }
  }

  // Process a single chapter synchronously
  private async processChapter(chapterData: initialQuran): Promise<void> {
    try {
      const newChapter = await this.createAndSaveChapter(chapterData);
      const { originalVerses, lemmatizedVerses } =
        await this.processAndLemmatizeVerses(chapterData);

      // Process each verse
      for (let i = 0; i < originalVerses.length; i++) {
        const verseString = originalVerses[i];
        const lemmatizedVerseString = lemmatizedVerses[i];

        console.log('Processing Verses for ', newChapter.chapterName);
        // Process and save verse and words immediately
        await this.processVerse(
          newChapter,
          verseString,
          lemmatizedVerseString,
          i + 1,
        );
      }
    } catch (error) {
      console.error(
        `Error processing chapter ${chapterData.nameArabic}: ${error.message}`,
      );
    }
  }

  // Save verse and words immediately to free memory
  private async processVerse(
    newChapter: Chapter,
    verseString: string,
    lemmatizedVerseString: string,
    verseNumber: number,
  ): Promise<void> {
    const newVerse = await this.createAndSaveVerse(
      newChapter,
      verseNumber,
      verseString,
    );

    await this.createAndSaveWords(
      newVerse.id,
      verseString,
      lemmatizedVerseString,
    );

    // Save the verse and immediately release memory
    await this.verseRepository.save(newVerse);
  }

  // Create and save a chapter synchronously
  private async createAndSaveChapter(
    chapterData: initialQuran,
  ): Promise<Chapter> {
    const newChapter = this.chapterRepository.create({
      chapterNumber: chapterData.chapterNumber,
      chapterName: chapterData.nameArabic,
      chapterNameEnglish: chapterData.nameEnglish,
      verses: [],
    });

    return this.chapterRepository.save(newChapter);
  }

  // Process and lemmatize verses synchronously
  private async processAndLemmatizeVerses(
    chapterData: initialQuran,
  ): Promise<{ originalVerses: string[]; lemmatizedVerses: string[] }> {
    const combinedVerses = chapterData.verses.reduce((acc, verse, i) => {
      return (
        acc +
        (i === chapterData.verses.length - 1
          ? verse.verseString
          : verse.verseString + '\n')
      );
    }, '');

    // Perform lemmatization synchronously
    const lemmatizedString = await this.farasaService.lemmatize(combinedVerses);
    const originalVerses = lemmatizedString.original.split('\n');
    const lemmatizedVerses = lemmatizedString.lemmatized.split('\n');
    lemmatizedVerses.pop(); // Remove last empty string if any

    return { originalVerses, lemmatizedVerses };
  }

  // Create and save a verse synchronously
  private async createAndSaveVerse(
    newChapter: Chapter,
    verseNumber: number,
    verseString: string,
  ): Promise<Verse> {
    const newVerse = this.verseRepository.create({
      chapter: { id: newChapter.id },
      chapterName: newChapter.chapterName,
      chapterNameEnglish: newChapter.chapterNameEnglish,
      chapterNumber: newChapter.chapterNumber,
      verseNumber,
      verseString,
    });

    return this.verseRepository.save(newVerse);
  }

  private async createAndSaveWords(
    verseId: string,
    verseString: string,
    lemmatizedVerseString: string,
  ): Promise<void> {
    const originalWords = this.splitIntoWords(verseString);
    const lemmaWords = this.splitIntoWords(lemmatizedVerseString);

    for (let j = 0; j < originalWords.length; j++) {
      const newWord = this.wordRepository.create({
        word: originalWords[j],
        rootWord: lemmaWords[j],
        definition: '',
        verse: { id: verseId },
        lemmatized: null,
      });

      await this.wordRepository.save(newWord);
    }
  }

  // Convert the data to JSON format (for exporting or other use)
  async toJson(): Promise<any[]> {
    const chapters = await this.chapterRepository.find({
      relations: ['verses', 'verses.words'],
    });

    return chapters.map((chapter) => ({
      id: chapter.id,
      chapterNumber: chapter.chapterNumber,
      chapterName: chapter.chapterName,
      chapterNameEnglish: chapter.chapterNameEnglish,
      verses: chapter.verses.map((verse) => ({
        id: verse.id,
        verseNumber: verse.verseNumber,
        verseString: verse.verseString,
        words: verse.words.map((word) => ({
          id: word.id,
          word: word.word,
          rootWord: word.rootWord,
          definition: word.definition,
        })),
      })),
    }));
  }

  // Split a verse into individual words
  splitIntoWords(verse: string): string[] {
    return verse.replace('\n', '').trim().split(' ');
  }

  async processRelatedWords(
    batchSize: number = 50,
    maxWords: string = '50',
  ): Promise<string> {
    let max: number | null = null;
    let numberOfProcessedWords = 0;
    let relationsFound = 0;

    // Parse the maxWords value
    if (maxWords === 'all') {
      max = null; // Process all entries in the database
    } else if (!isNaN(parseInt(maxWords, 10))) {
      max = parseInt(maxWords, 10);
    } else {
      max = 50; // Default to 50 if maxWords is undefined or invalid
    }

    let offset = 0;
    let hasMoreWords = true;
    let totalProcessed = 0;

    while (hasMoreWords && (max === null || totalProcessed < max)) {
      // Adjust batch size if approaching the maxWords limit
      const remainingWords = max !== null ? max - totalProcessed : batchSize;
      const currentBatchSize = Math.min(batchSize, remainingWords);

      const words = await this.wordRepository
        .createQueryBuilder('word')
        .where("word.word != ''")
        .skip(offset)
        .take(currentBatchSize)
        .getMany();

      if (words.length === 0) {
        hasMoreWords = false;
        break;
      }

      for (const word of words) {
        const relatedWords = await this.findRelatedWords(word);
        const significantRelations = relatedWords
          .filter((rel) => rel.closeness > 30)
          .sort((a, b) => b.closeness - a.closeness) // Sort by closeness in descending order
          .slice(0, 100); // Take only top 100 relations

        console.log(
          `Processing word: ${word.word} - Found ${significantRelations.length} relations`,
        );

        for (const relation of significantRelations) {
          const relatedWord = new RelatedWord();
          relatedWord.wordId = relation.wordId;
          relatedWord.word = relation.word;
          relatedWord.closeness = relation.closeness;
          relatedWord.parentWord = word;
          await this.relatedWordRepository.save(relatedWord);
          relationsFound++;
        }
      }

      numberOfProcessedWords += words.length;
      offset += currentBatchSize;
      totalProcessed += currentBatchSize;
      console.log(
        `Words processed: ${totalProcessed} - relations found: ${relationsFound}`,
      );
    }

    return `Processed words: ${numberOfProcessedWords}, relations found: ${relationsFound}`;
  }

  private async findRelatedWords(
    word: Word,
  ): Promise<Array<{ wordId: string; closeness: number; word: string }>> {
    const similarWords = await this.wordRepository
      .createQueryBuilder('word')
      .where('word.id != :wordId', { wordId: word.id })
      .andWhere("word.word != ''")
      .andWhere('SIMILARITY(word.word, :wordText) > 0.6', {
        wordText: word.word,
      })
      .take(1000) // Get 1000 candidates for better sorting
      .getMany();

    // Calculate closeness for all candidates and sort them
    const withCloseness = similarWords
      .map((similarWord) => ({
        wordId: similarWord.id,
        word: similarWord.word,
        closeness:
          this.calculateArabicSimilarity(word.word, similarWord.word) * 100,
      }))
      .sort((a, b) => b.closeness - a.closeness) // Sort by closeness
      .slice(0, 100); // Take top 100

    this.loggerService.log(
      `Found ${withCloseness.length} similar words for: ${word.word}`,
    );
    return withCloseness;
  }

  private calculateArabicSimilarity(str1: string, str2: string): number {
    // Remove Arabic diacritics and normalize text
    const clean1 = this.normalizeArabicText(str1);
    const clean2 = this.normalizeArabicText(str2);

    // Use fastest-levenshtein to calculate distance
    const levenshteinDist = distance(clean1, clean2);
    const maxLength = Math.max(clean1.length, clean2.length);

    // Convert distance to similarity score (0 to 1)
    return 1 - levenshteinDist / maxLength;
  }

  private normalizeArabicText(text: string): string {
    return (
      text
        // Remove diacritics (tashkeel)
        .replace(/[\u064B-\u065F\u0670]/g, '')
        // Normalize alef variations to simple alef
        .replace(/[\u0622\u0623\u0625]/g, 'ا')
        // Normalize teh marbuta to heh
        .replace(/ة/g, 'ه')
        // Normalize ya variations
        .replace(/[ىي]/g, 'ي')
        // Remove tatweel (elongation character)
        .replace(/\u0640/g, '')
    );
  }
}
