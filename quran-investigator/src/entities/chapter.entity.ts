import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Verse } from './verse.entity';

@Entity()
@Unique(['chapterNumber'])
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  chapterNumber: number;

  @Column()
  chapterName: string;

  @Column()
  chapterNameEnglish: string;

  @OneToMany(() => Verse, (verse) => verse.chapter, { cascade: true })
  verses: Verse[];

  // Constructor to initialize the entity
  constructor(i?: Partial<Chapter>) {
    if (i) {
      this.id = i.id as string;
      this.chapterNumber = i.chapterNumber as number;
      this.chapterName = i.chapterName as string;
      this.chapterNameEnglish = i.chapterNameEnglish as string;
      this.verses = i.verses || [];
    }
  }
}
