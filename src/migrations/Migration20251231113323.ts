import { Migration } from '@mikro-orm/migrations';

export class Migration20251231113323 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "users" add column "password" varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop column "password";`);
  }

}
