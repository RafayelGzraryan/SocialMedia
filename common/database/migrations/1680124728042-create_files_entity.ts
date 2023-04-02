import { MigrationInterface, QueryRunner } from "typeorm";

export class createFilesEntity1680124728042 implements MigrationInterface {
    name = 'createFilesEntity1680124728042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "files_entity" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "url" character varying NOT NULL, "postId" integer, CONSTRAINT "REL_575c65d1fed3766054775263b3" UNIQUE ("postId"), CONSTRAINT "PK_8d1655a1893f7d4e2585d9c43f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_entity" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "description" character varying, "imageKey" character varying, "published" boolean NOT NULL DEFAULT false, "userId" integer, CONSTRAINT "PK_58a149c4e88bf49036bc4c8c79f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "files_entity" ADD CONSTRAINT "FK_575c65d1fed3766054775263b3f" FOREIGN KEY ("postId") REFERENCES "post_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_entity" ADD CONSTRAINT "FK_5e32998d7ac08f573cde04fbfa5" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_entity" DROP CONSTRAINT "FK_5e32998d7ac08f573cde04fbfa5"`);
        await queryRunner.query(`ALTER TABLE "files_entity" DROP CONSTRAINT "FK_575c65d1fed3766054775263b3f"`);
        await queryRunner.query(`DROP TABLE "post_entity"`);
        await queryRunner.query(`DROP TABLE "files_entity"`);
    }

}
