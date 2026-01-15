import { Migration } from '@mikro-orm/migrations';

export class Migration20260108113634 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "users" add column "refresh_token" text null, add column "refresh_token_expires_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop column "refresh_token", drop column "refresh_token_expires_at";`);
  }

}
