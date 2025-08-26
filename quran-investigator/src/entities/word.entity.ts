import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Verse } from './verse.entity';
import { BookWord } from './book-word.entity';
import { RelatedWord } from './related-word.entity';

@Entity()
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  word: string;

  @Column()
  rootWord: string;

  @Column()
  definition: string;

  @Column({ nullable: true })
  lemmatized: string;

  @ManyToMany(() => BookWord, (bookWord) => bookWord.words)
  @JoinTable({
    name: 'word_book_words', // Intermediate table
    joinColumn: { name: 'wordId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'bookWordId', referencedColumnName: 'id' },
  })
  bookWords: BookWord[];

  @ManyToOne(() => Verse, (verse) => verse.words)
  verse: Verse;

  @OneToMany(() => RelatedWord, (relatedWord) => relatedWord.parentWord)
  relatedTo: RelatedWord[];
}
