import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { QuranService } from './quran.service';
import { ProccessorService } from './proccessor.service';
import { initialQuran } from './types/quran';
import { Chapter } from './entities/chapter.entity';
import { Verse } from './entities/verse.entity';
import { Word } from './entities/word.entity';
import { RelatedWordWithContext } from './quran.service';
import { AdminProtected } from './decorators/admin-protected.decorator';

@Controller('quran')
export class QuranController {
  constructor(
    private readonly quranService: QuranService,
    private readonly processorService: ProccessorService,
  ) {}

  // Public READ endpoints
  @Get('chapters')
  getAllChapters(): Promise<Chapter[]> {
    return this.quranService.getAllChapters();
  }

  @Get('chapters/:id')
  getChapter(@Param('id') id: string): Promise<Chapter> {
    return this.quranService.getChapter(id);
  }

  @Get('verses')
  getAllVerses(): Promise<Verse[]> {
    return this.quranService.getAllVerses();
  }

  @Get('verses/:id')
  getVerse(@Param('id') id: string): Promise<Verse> {
    return this.quranService.getVerse(id);
  }

  @Get('words')
  getAllWords(): Promise<Word[]> {
    return this.quranService.getAllWords();
  }

  @Get('words/:id')
  getWord(@Param('id') id: string): Promise<Word> {
    return this.quranService.getWord(id);
  }

  // Protected WRITE endpoints
  @AdminProtected()
  @Post('process')
  async processQuran(): Promise<string> {
    const quranData: initialQuran[] =
      await this.processorService.loadLocalQuranData(); // Assuming this loads local data
    await this.processorService.processChapters(quranData);
    return 'Quran data processed and stored successfully';
  }

  @AdminProtected()
  @Post('process-words')
  async processWords(
    @Query('size') size: string,
    @Query('batch') batch: string,
  ): Promise<string> {
    return await this.processorService.processWordsInBatches(
      parseInt(batch),
      size,
    );
  }

  @AdminProtected()
  @Post('clean-words')
  async cleanLemmatized(): Promise<void> {
    return await this.processorService.cleanLemmatizedWords();
  }

  @AdminProtected()
  @Post('process-related-words')
  async processRelatedWords(
    @Query('size') size: string,
    @Query('batch') batch: string,
  ): Promise<string> {
    return await this.processorService.processRelatedWords(
      parseInt(batch),
      size,
    );
  }

  @AdminProtected()
  @Post('chapters')
  createChapter(@Body() chapter: Partial<Chapter>): Promise<Chapter> {
    return this.quranService.createChapter(chapter);
  }

  @AdminProtected()
  @Put('chapters/:id')
  updateChapter(
    @Param('id') id: string,
    @Body() chapter: Partial<Chapter>,
  ): Promise<Chapter> {
    return this.quranService.updateChapter(id, chapter);
  }

  @AdminProtected()
  @Delete('chapters/:id')
  deleteChapter(@Param('id') id: string): Promise<void> {
    return this.quranService.deleteChapter(id);
  }

  @Get('chapters/:id/verses')
  getVersesForChapter(@Param('id') chapterId: string): Promise<Verse[]> {
    return this.quranService.getVersesForChapter(chapterId);
  }

  @AdminProtected()
  @Post('verses')
  createVerse(@Body() verse: Partial<Verse>): Promise<Verse> {
    return this.quranService.createVerse(verse);
  }

  @AdminProtected()
  @Put('verses/:id')
  updateVerse(
    @Param('id') id: string,
    @Body() verse: Partial<Verse>,
  ): Promise<Verse> {
    return this.quranService.updateVerse(id, verse);
  }

  @AdminProtected()
  @Delete('verses/:id')
  deleteVerse(@Param('id') id: string): Promise<void> {
    return this.quranService.deleteVerse(id);
  }

  @Get('verses/:id/words')
  getWordsForVerse(@Param('id') verseId: string): Promise<Word[]> {
    return this.quranService.getWordsForVerse(verseId);
  }

  @AdminProtected()
  @Post('words')
  createWord(@Body() word: Partial<Word>): Promise<Word> {
    return this.quranService.createWord(word);
  }

  @AdminProtected()
  @Put('words/:id')
  updateWord(
    @Param('id') id: string,
    @Body() word: Partial<Word>,
  ): Promise<Word> {
    return this.quranService.updateWord(id, word);
  }

  @AdminProtected()
  @Delete('words/:id')
  deleteWord(@Param('id') id: string): Promise<void> {
    return this.quranService.deleteWord(id);
  }

  @Post('words/related')
  async getRelatedWords(
    @Body() params: { wordId: string; limit?: number },
  ): Promise<RelatedWordWithContext[]> {
    const limitNumber = params.limit || 50;
    return this.quranService.findTopRelatedWordsForWord(
      params.wordId,
      limitNumber,
    );
  }
}
