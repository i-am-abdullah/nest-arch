import { Migration } from '@mikro-orm/migrations';

export class Migration20251208120326 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "permissions" ("id" uuid not null, "name" varchar(100) not null, "resource" varchar(50) not null, "action" varchar(50) not null, "description" text null, "created_at" timestamptz not null default 'now()', "updated_at" timestamptz not null default 'now()', constraint "permissions_pkey" primary key ("id"));`);
    this.addSql(`create index "permissions_resource_index" on "permissions" ("resource");`);
    this.addSql(`create index "permissions_action_index" on "permissions" ("action");`);
    this.addSql(`alter table "permissions" add constraint "permissions_resource_action_unique" unique ("resource", "action");`);

    this.addSql(`create table "roles" ("id" uuid not null, "name" varchar(100) not null, "description" text null, "created_at" timestamptz not null default 'now()', "updated_at" timestamptz not null default 'now()', constraint "roles_pkey" primary key ("id"));`);
    this.addSql(`alter table "roles" add constraint "roles_name_unique" unique ("name");`);

    this.addSql(`create table "role_permissions" ("role_id" uuid not null, "permission_id" uuid not null, constraint "role_permissions_pkey" primary key ("role_id", "permission_id"));`);

    this.addSql(`create table "users" ("id" uuid not null, "email" varchar(255) not null, "name" varchar(255) not null, "created_at" timestamptz not null default 'now()', "updated_at" timestamptz not null default 'now()', constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "user_roles" ("user_id" uuid not null, "role_id" uuid not null, constraint "user_roles_pkey" primary key ("user_id", "role_id"));`);

    this.addSql(`create table "posts" ("id" uuid not null, "title" varchar(255) not null, "content" text not null, "author_id" uuid not null, "published" boolean not null default false, "created_at" timestamptz not null default 'now()', "updated_at" timestamptz not null default 'now()', constraint "posts_pkey" primary key ("id"));`);
    this.addSql(`create index "posts_author_id_index" on "posts" ("author_id");`);
    this.addSql(`create index "posts_published_index" on "posts" ("published");`);

    this.addSql(`create table "comments" ("id" uuid not null, "content" text not null, "author_id" uuid not null, "post_id" uuid not null, "created_at" timestamptz not null default 'now()', "updated_at" timestamptz not null default 'now()', constraint "comments_pkey" primary key ("id"));`);
    this.addSql(`create index "comments_author_id_index" on "comments" ("author_id");`);
    this.addSql(`create index "comments_post_id_index" on "comments" ("post_id");`);

    this.addSql(`alter table "role_permissions" add constraint "role_permissions_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "role_permissions" add constraint "role_permissions_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "user_roles" add constraint "user_roles_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "user_roles" add constraint "user_roles_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "posts" add constraint "posts_author_id_foreign" foreign key ("author_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "comments" add constraint "comments_author_id_foreign" foreign key ("author_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "comments" add constraint "comments_post_id_foreign" foreign key ("post_id") references "posts" ("id") on update cascade;`);

    this.addSql(`drop table if exists "test_replication" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "role_permissions" drop constraint "role_permissions_permission_id_foreign";`);

    this.addSql(`alter table "role_permissions" drop constraint "role_permissions_role_id_foreign";`);

    this.addSql(`alter table "user_roles" drop constraint "user_roles_role_id_foreign";`);

    this.addSql(`alter table "user_roles" drop constraint "user_roles_user_id_foreign";`);

    this.addSql(`alter table "posts" drop constraint "posts_author_id_foreign";`);

    this.addSql(`alter table "comments" drop constraint "comments_author_id_foreign";`);

    this.addSql(`alter table "comments" drop constraint "comments_post_id_foreign";`);

    this.addSql(`create table "test_replication" ("id" serial primary key, "name" varchar(100) null);`);

    this.addSql(`drop table if exists "permissions" cascade;`);

    this.addSql(`drop table if exists "roles" cascade;`);

    this.addSql(`drop table if exists "role_permissions" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "user_roles" cascade;`);

    this.addSql(`drop table if exists "posts" cascade;`);

    this.addSql(`drop table if exists "comments" cascade;`);
  }

}
