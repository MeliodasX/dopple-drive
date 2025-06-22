CREATE TABLE "upload"
(
    "id"         serial PRIMARY KEY NOT NULL,
    "user_id"    integer            NOT NULL,
    "file_name"  text               NOT NULL,
    "file_url"   text               NOT NULL,
    "size"       bigint,
    "deleted_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "upload"
    ADD CONSTRAINT "upload_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;