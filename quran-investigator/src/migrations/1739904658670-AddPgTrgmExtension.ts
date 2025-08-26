import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPgTrgmExtension1739904658670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(
      `CREATE INDEX word_trgm_idx ON word USING gin (word gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS word_trgm_idx`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm`);
  }
}
