CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"file_url" text,
	"size" bigint,
	"key" text NOT NULL,
	"mime_type" text,
	"parent_id" integer,
	"path" text NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "upload" CASCADE;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_parent_id_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "items_path_user_idx" ON "items" USING btree ("user_id","path");--> statement-breakpoint
CREATE INDEX "items_folder_file_sort_idx" ON "items" USING btree ("parent_id","mime_type","name","id");--> statement-breakpoint
CREATE INDEX "items_parent_id_idx" ON "items" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "items_name_idx" ON "items" USING btree ("name");