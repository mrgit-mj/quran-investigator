import { MigrationInterface, QueryRunner } from 'typeorm';

export class SwapLemmatizedAndRootWord1729294543318
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, create a temporary column to help with the swap
    await queryRunner.query(`
            ALTER TABLE "word" 
            ADD COLUMN "temp_column" VARCHAR;
        `);

    // Copy rootWord to temp
    await queryRunner.query(`
            UPDATE "word"
            SET "temp_column" = "rootWord";
        `);

    // Copy lemmatized to rootWord (with NULL handling)
    await queryRunner.query(`
            UPDATE "word"
            SET "rootWord" = COALESCE("lemmatized", "rootWord");
        `);

    // Copy temp to lemmatized (with NULL handling)
    await queryRunner.query(`
            UPDATE "word"
            SET "lemmatized" = COALESCE("temp_column", "lemmatized");
        `);

    // Drop the temporary column
    await queryRunner.query(`
            ALTER TABLE "word"
            DROP COLUMN "temp_column";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Repeat the same process in reverse if you need to rollback
    await queryRunner.query(`
            ALTER TABLE "word" 
            ADD COLUMN "temp_column" VARCHAR;
        `);

    await queryRunner.query(`
            UPDATE "word"
            SET "temp_column" = "rootWord";
        `);

    await queryRunner.query(`
            UPDATE "word"
            SET "rootWord" = "lemmatized";
        `);

    await queryRunner.query(`
            UPDATE "word"
            SET "lemmatized" = "temp_column";
        `);

    await queryRunner.query(`
            ALTER TABLE "word"
            DROP COLUMN "temp_column";
        `);
  }
}
