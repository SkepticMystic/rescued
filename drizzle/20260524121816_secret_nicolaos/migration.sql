CREATE TYPE "animal_sex" AS ENUM('male', 'female', 'unknown');--> statement-breakpoint
CREATE TYPE "animal_species" AS ENUM('dog', 'cat', 'other');--> statement-breakpoint
CREATE TYPE "animal_status" AS ENUM('intake', 'available', 'fostered', 'adopted', 'medical_hold', 'archived');--> statement-breakpoint
ALTER TYPE "image_resource_kind" ADD VALUE 'animal';--> statement-breakpoint
ALTER TYPE "image_resource_kind" ADD VALUE 'shelter';--> statement-breakpoint
CREATE TABLE "animal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"short_id" varchar(8) NOT NULL,
	"org_id" uuid NOT NULL,
	"shelter_id" uuid NOT NULL,
	"name" varchar(255),
	"species" "animal_species" NOT NULL,
	"sex" "animal_sex" DEFAULT 'unknown'::"animal_sex" NOT NULL,
	"date_of_birth" timestamp,
	"status" "animal_status" DEFAULT 'intake'::"animal_status" NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spatial_ref_sys" (
	"srid" integer PRIMARY KEY,
	"auth_name" varchar(256),
	"auth_srid" integer,
	"srtext" varchar(2048),
	"proj4text" varchar(2048),
	CONSTRAINT "spatial_ref_sys_srid_check" CHECK (((srid > 0) AND (srid <= 998999)))
);
--> statement-breakpoint
CREATE TABLE "shelter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"short_id" varchar(8) NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" text,
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"address" text NOT NULL,
	"google_place_id" text NOT NULL,
	"location" geometry(point,4326) NOT NULL,
	"street_number" varchar(50),
	"street_name" varchar(255),
	"suburb" varchar(255),
	"city" varchar(255),
	"province" varchar(255),
	"postal_code" varchar(20),
	"country" varchar(2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_animal_org_id" ON "animal" ("org_id");--> statement-breakpoint
CREATE INDEX "idx_animal_shelter_id" ON "animal" ("shelter_id");--> statement-breakpoint
CREATE INDEX "idx_animal_short_id" ON "animal" ("short_id");--> statement-breakpoint
CREATE INDEX "idx_shelter_org_id" ON "shelter" ("org_id");--> statement-breakpoint
CREATE INDEX "idx_shelter_slug" ON "shelter" ("slug");--> statement-breakpoint
CREATE INDEX "idx_shelter_short_id" ON "shelter" ("short_id");--> statement-breakpoint
CREATE INDEX "idx_shelter_location_gist" ON "shelter" USING gist ("location");--> statement-breakpoint
ALTER TABLE "animal" ADD CONSTRAINT "animal_org_id_organization_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "animal" ADD CONSTRAINT "animal_shelter_id_shelter_id_fkey" FOREIGN KEY ("shelter_id") REFERENCES "shelter"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shelter" ADD CONSTRAINT "shelter_org_id_organization_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
CREATE VIEW "geography_columns" AS (SELECT current_database() AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geography_column, postgis_typmod_dims(a.atttypmod) AS coord_dimension, postgis_typmod_srid(a.atttypmod) AS srid, postgis_typmod_type(a.atttypmod) AS type FROM pg_class c, pg_attribute a, pg_type t, pg_namespace n WHERE t.typname = 'geography'::name AND a.attisdropped = false AND a.atttypid = t.oid AND a.attrelid = c.oid AND c.relnamespace = n.oid AND (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text));--> statement-breakpoint
CREATE VIEW "geometry_columns" AS (SELECT current_database()::character varying(256) AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geometry_column, COALESCE(postgis_typmod_dims(a.atttypmod), 2) AS coord_dimension, COALESCE(NULLIF(postgis_typmod_srid(a.atttypmod), 0), 0) AS srid, replace(replace(COALESCE(NULLIF(upper(postgis_typmod_type(a.atttypmod)), 'GEOMETRY'::text), 'GEOMETRY'::text), 'ZM'::text, ''::text), 'Z'::text, ''::text)::character varying(30) AS type FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid AND NOT a.attisdropped JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_type t ON a.atttypid = t.oid WHERE (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT c.relname = 'raster_columns'::name AND t.typname = 'geometry'::name AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text));