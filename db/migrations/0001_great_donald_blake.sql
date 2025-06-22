ALTER TABLE "users"
    ADD COLUMN "user_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "users"
    ADD CONSTRAINT "users_user_name_unique" UNIQUE ("user_name");