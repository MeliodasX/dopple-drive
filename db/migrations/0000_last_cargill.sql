CREATE TABLE "users"
(
    "id"         serial PRIMARY KEY NOT NULL,
    "clerk_id"   text               NOT NULL,
    "first_name" text               NOT NULL,
    "last_name"  text               NOT NULL,
    "email"      varchar(255)       NOT NULL,
    "deleted_at" timestamp,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "users_clerk_id_unique" UNIQUE ("clerk_id"),
    CONSTRAINT "users_email_unique" UNIQUE ("email")
);
