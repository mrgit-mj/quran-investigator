import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Word } from './word.entity';
import { Book } from './book.entity';

@Entity()
export class BookWord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  word: string;

  @Column('text', { array: true }) // Store definitions as an array of text
  definitions: string[];

  @ManyToOne(() => Book, (book) => book.words)
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @ManyToMany(() => Word, (word) => word.bookWords)
  words: Word[];
}
