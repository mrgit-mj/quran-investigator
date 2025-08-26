import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Word } from './word.entity';

@Entity()
export class RelatedWord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The word this is related to
  @Column()
  wordId: string;

  @Column()
  word: string;

  // How close is this word to the parent word (percentage)
  @Column('float')
  closeness: number;

  // Reference to the parent word
  @ManyToOne(() => Word, (word) => word.relatedTo)
  parentWord: Word;
}
