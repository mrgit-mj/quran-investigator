import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Chapter } from './chapter.entity';
import { Word } from './word.entity';

@Entity()
export class Verse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chapterNumber: number;

  @Column()
  verseNumber: number;

  @Column()
  chapterName: string;

  @ManyToOne(() => Chapter, (chapter) => chapter.verses)
  @JoinColumn({ name: 'chapterId' })
  chapter: Chapter;

  @Column()
  chapterNameEnglish: string;

  @Column()
  verseString: string;

  @OneToMany(() => Word, (word) => word.verse)
  words: Word[];

  // Constructor to initialize the entity
  constructor(i?: Partial<Verse>) {
    if (i) {
      this.id = i.id as string;
      this.chapterNumber = i.chapterNumber as number;
      this.verseNumber = i.verseNumber as number;
      this.chapterName = i.chapterName as string;
      this.chapter = i.chapter as Chapter;
      this.chapterNameEnglish = i.chapterNameEnglish as string;
      this.verseString = i.verseString as string;
      this.words = i.words || [];
    }
  }
}
