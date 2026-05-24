import { sql } from "drizzle-orm";
import { check, customType, integer, pgTable, pgView, text, varchar } from "drizzle-orm/pg-core";

export const spatialRefSys = pgTable(
  "spatial_ref_sys",
  {
    srid: integer().primaryKey(),
    authName: varchar("auth_name", { length: 256 }),
    authSrid: integer("auth_srid"),
    srtext: varchar({ length: 2048 }),
    proj4text: varchar({ length: 2048 }),
  },
  () => [check("spatial_ref_sys_srid_check", sql`((srid > 0) AND (srid <= 998999))`)],
);

export const geographyColumns = pgView("geography_columns", {
  fTableCatalog: customType({ dataType: () => "name" })("f_table_catalog"),
  fTableSchema: customType({ dataType: () => "name" })("f_table_schema"),
  fTableName: customType({ dataType: () => "name" })("f_table_name"),
  fGeographyColumn: customType({ dataType: () => "name" })("f_geography_column"),
  coordDimension: integer("coord_dimension"),
  srid: integer(),
  type: text(),
}).as(
  sql`SELECT current_database() AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geography_column, postgis_typmod_dims(a.atttypmod) AS coord_dimension, postgis_typmod_srid(a.atttypmod) AS srid, postgis_typmod_type(a.atttypmod) AS type FROM pg_class c, pg_attribute a, pg_type t, pg_namespace n WHERE t.typname = 'geography'::name AND a.attisdropped = false AND a.atttypid = t.oid AND a.attrelid = c.oid AND c.relnamespace = n.oid AND (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text)`,
);

export const geometryColumns = pgView("geometry_columns", {
  fTableCatalog: varchar("f_table_catalog", { length: 256 }),
  fTableSchema: customType({ dataType: () => "name" })("f_table_schema"),
  fTableName: customType({ dataType: () => "name" })("f_table_name"),
  fGeometryColumn: customType({ dataType: () => "name" })("f_geometry_column"),
  coordDimension: integer("coord_dimension"),
  srid: integer(),
  type: varchar({ length: 30 }),
}).as(
  sql`SELECT current_database()::character varying(256) AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geometry_column, COALESCE(postgis_typmod_dims(a.atttypmod), 2) AS coord_dimension, COALESCE(NULLIF(postgis_typmod_srid(a.atttypmod), 0), 0) AS srid, replace(replace(COALESCE(NULLIF(upper(postgis_typmod_type(a.atttypmod)), 'GEOMETRY'::text), 'GEOMETRY'::text), 'ZM'::text, ''::text), 'Z'::text, ''::text)::character varying(30) AS type FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid AND NOT a.attisdropped JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_type t ON a.atttypid = t.oid WHERE (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT c.relname = 'raster_columns'::name AND t.typname = 'geometry'::name AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text)`,
);
