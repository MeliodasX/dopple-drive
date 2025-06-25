DROP INDEX "items_name_parent_user_file_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_name_in_folder_idx" ON "items" USING btree ("user_id","parent_id","name") WHERE "items"."parent_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_name_in_root_idx" ON "items" USING btree ("user_id","name") WHERE "items"."parent_id" IS NULL;