import {
  Injectable,
  NotFoundException,
  BadRequestException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { Verse } from './entities/verse.entity';
import { Word } from './entities/word.entity';
import { RelatedWord } from './entities/related-word.entity';
import { distance } from 'fastest-levenshtein';

export interface RelatedWordWithContext {
  relatedWord: {
    id: string;
    word: string;
    closeness: number;
  };
  parentWord: {
    id: string;
    word: string;
  };
  verse: {
    id: string;
    verseNumber: number;
    verseString: string;
    chapterName: string;
    chapterNumber: number;
  };
}

@Injectable()
export class QuranService {
  constructor(
    @InjectRepository(Chapter) private chapterRepository: Repository<Chapter>,
    @InjectRepository(Verse) private verseRepository: Repository<Verse>,
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(RelatedWord)
    private relatedWordRepository: Repository<RelatedWord>,
  ) {}

  // Public READ methods
  async getAllChapters(): Promise<Chapter[]> {
    return this.chapterRepository.find();
  }

  async getChapter(id: string): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { id },
    });
    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }
    return chapter;
  }

  async getAllVerses(): Promise<Verse[]> {
    return this.verseRepository.find({
      relations: ['chapter', 'words'],
      order: {
        chapterNumber: 'ASC',
        verseNumber: 'ASC',
      },
    });
  }

  async getVerse(id: string): Promise<Verse> {
    const verse = await this.verseRepository.findOne({
      where: { id },
      relations: ['chapter', 'words'],
    });
    if (!verse) {
      throw new NotFoundException(`Verse with ID ${id} not found`);
    }
    return verse;
  }

  async getAllWords(): Promise<Word[]> {
    return this.wordRepository.find({
      relations: ['verse'],
    });
  }

  async getWord(id: string): Promise<Word> {
    const word = await this.wordRepository.findOne({
      where: { id },
      relations: ['verse'],
    });
    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }
    return word;
  }

  async getVersesForChapter(chapterId: string): Promise<Verse[]> {
    const verses = await this.verseRepository.find({
      where: { chapter: { id: chapterId } },
      relations: ['words'],
      order: { verseNumber: 'ASC' },
    });
    if (!verses.length) {
      throw new NotFoundException(`No verses found for chapter ${chapterId}`);
    }
    return verses;
  }

  async getWordsForVerse(verseId: string): Promise<Word[]> {
    const words = await this.wordRepository.find({
      where: { verse: { id: verseId } },
    });
    if (!words.length) {
      throw new NotFoundException(`No words found for verse ${verseId}`);
    }
    return words;
  }

  // Protected WRITE methods
  async processQuran(): Promise<string> {
    // Implementation depends on your processing logic
    throw new NotImplementedException('Method not implemented');
  }

  async processWords(batch: string, size: string): Promise<string> {
    // Implementation depends on your processing logic
    throw new NotImplementedException('Method not implemented');
  }

  async createChapter(chapter: Partial<Chapter>): Promise<Chapter> {
    try {
      const newChapter = this.chapterRepository.create(chapter);
      return await this.chapterRepository.save(newChapter);
    } catch (error) {
      throw new BadRequestException('Failed to create chapter');
    }
  }

  async updateChapter(id: string, chapter: Partial<Chapter>): Promise<Chapter> {
    const existingChapter = await this.getChapter(id);
    try {
      await this.chapterRepository.update(id, chapter);
      return await this.getChapter(id);
    } catch (error) {
      throw new BadRequestException('Failed to update chapter');
    }
  }

  async deleteChapter(id: string): Promise<void> {
    const result = await this.chapterRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }
  }

  async createVerse(verse: Partial<Verse>): Promise<Verse> {
    try {
      const newVerse = this.verseRepository.create(verse);
      return await this.verseRepository.save(newVerse);
    } catch (error) {
      throw new BadRequestException('Failed to create verse');
    }
  }

  async updateVerse(id: string, verse: Partial<Verse>): Promise<Verse> {
    const existingVerse = await this.getVerse(id);
    try {
      await this.verseRepository.update(id, verse);
      return await this.getVerse(id);
    } catch (error) {
      throw new BadRequestException('Failed to update verse');
    }
  }

  async deleteVerse(id: string): Promise<void> {
    const result = await this.verseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Verse with ID ${id} not found`);
    }
  }

  async createWord(word: Partial<Word>): Promise<Word> {
    try {
      const newWord = this.wordRepository.create(word);
      return await this.wordRepository.save(newWord);
    } catch (error) {
      throw new BadRequestException('Failed to create word');
    }
  }

  async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    const existingWord = await this.getWord(id);
    try {
      await this.wordRepository.update(id, word);
      return await this.getWord(id);
    } catch (error) {
      throw new BadRequestException('Failed to update word');
    }
  }

  async deleteWord(id: string): Promise<void> {
    const result = await this.wordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }
  }

  async getRelatedWordsWithContext(
    wordId: string,
  ): Promise<RelatedWordWithContext[]> {
    const relatedWords = await this.relatedWordRepository
      .createQueryBuilder('relatedWord')
      .leftJoinAndSelect('relatedWord.parentWord', 'parentWord')
      .leftJoinAndSelect('parentWord.verse', 'verse')
      .where('relatedWord.wordId = :wordId', { wordId })
      // Order by closeness descending (most similar first)
      .orderBy('relatedWord.closeness', 'DESC')
      .getMany();

    return relatedWords.map((relation) => ({
      relatedWord: {
        id: relation.wordId,
        word: relation.word,
        closeness: relation.closeness,
      },
      parentWord: {
        id: relation.parentWord.id,
        word: relation.parentWord.word,
      },
      verse: {
        id: relation.parentWord.verse.id,
        verseNumber: relation.parentWord.verse.verseNumber,
        verseString: relation.parentWord.verse.verseString,
        chapterName: relation.parentWord.verse.chapterName,
        chapterNumber: relation.parentWord.verse.chapterNumber,
      },
    }));
  }

  async findTopRelatedWordsForWord(
    wordId: string,
    limit: number = 50,
  ): Promise<RelatedWordWithContext[]> {
    // First get the source word
    const sourceWord = await this.wordRepository.findOne({
      where: { id: wordId },
      relations: ['verse'],
    });

    if (!sourceWord) {
      throw new Error('Word not found');
    }

    // Get candidate words using similarity
    const similarWords = await this.wordRepository
      .createQueryBuilder('word')
      .leftJoinAndSelect('word.verse', 'verse')
      .where('word.id != :wordId', { wordId })
      .andWhere("word.word != ''")
      .andWhere('SIMILARITY(word.word, :wordText) > 0.6', {
        wordText: sourceWord.word,
      })
      .take(1000) // Get enough candidates for good sorting
      .getMany();

    // Calculate closeness for all candidates
    const withCloseness = similarWords
      .map((similarWord) => ({
        relatedWord: {
          id: similarWord.id,
          word: similarWord.word,
          closeness:
            this.calculateArabicSimilarity(sourceWord.word, similarWord.word) *
            100,
        },
        parentWord: {
          id: sourceWord.id,
          word: sourceWord.word,
        },
        verse: {
          id: similarWord.verse.id,
          verseNumber: similarWord.verse.verseNumber,
          verseString: similarWord.verse.verseString,
          chapterName: similarWord.verse.chapterName,
          chapterNumber: similarWord.verse.chapterNumber,
        },
      }))
      .sort((a, b) => b.relatedWord.closeness - a.relatedWord.closeness)
      .slice(0, limit);

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
