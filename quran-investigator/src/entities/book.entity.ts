import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BookWord } from './book-word.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  author: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => BookWord, (bookWord) => bookWord.book, { cascade: true })
  words: BookWord[];
}
