ALTER TABLE "items" ALTER COLUMN "mime_type" SET DEFAULT 'application/octet-stream';--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "mime_type" SET NOT NULL;