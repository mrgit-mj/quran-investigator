import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Word } from './entities/word.entity';
import { Verse } from './entities/verse.entity';
import { Chapter } from './entities/chapter.entity';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from './logger.service';
import { QuranService } from './quran.service';
import { ProccessorService } from './proccessor.service';
import { FarasaService } from './farasa/farasa.service';
import { QuranController } from './quran.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenAIService } from './openAi/openAi.service';
import { OllamaService } from './ollama/ollama.service';
import { Book } from './entities/book.entity';
import { BookWord } from './entities/book-word.entity';
import { RelatedWord } from './entities/related-word.entity';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ADMIN_API_KEY: Joi.string().required(),
      }),
    }),
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Word, Verse, Chapter, Book, BookWord, RelatedWord],
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      Word,
      Verse,
      Chapter,
      Book,
      BookWord,
      RelatedWord,
    ]),
  ],
  controllers: [QuranController, AppController],
  providers: [
    LoggerService,
    ProccessorService,
    QuranService,
    FarasaService,
    AppService,
    OpenAIService,
    OllamaService,
  ],
})
export class AppModule {}
