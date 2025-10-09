# Database Guide

## Overview
The demo loads NYC DOHMH Restaurant Inspection Results into Postgres from the Socrata (NYC Open Data) GeoJSON endpoint:  
`https://data.cityofnewyork.us/resource/43nn-pn8j.geojson`  
SODA endpoints are paged; use `$limit` and `$offset` (max ~50,000 rows per page).

The GeoJSON contains `features` with `properties` (all the tabular fields) and a `geometry` object (Point with `[longitude, latitude]`).

## Table
The loader script creates `public.nyc_restaurant_inspections`:

- Keys & descriptors: `camis`, `dba`, `boro`, address fields, `cuisine_description`
- Inspection fields: `inspection_date`, `action`, `violation_code`, `violation_description`, `critical_flag`, `score`, `grade`, `grade_date`, `record_date`, `inspection_type`
- Location & districts: `latitude`, `longitude`, `community_board`, `council_district`, `census_tract`, `bin`, `bbl`, `nta`
- Raw geometry: `location_point1 text` (full GeoJSON geometry stored as text)
- Index: `(camis, inspection_date)` for common lookups

> GeoJSON uses **longitude, latitude** order per RFC 7946.
> 
> **Note:** The `location_point1` column is stored as `text` instead of `jsonb` to ensure compatibility with JPA/Hibernate queries. PostgreSQL's `jsonb` type doesn't support the `UPPER()` function, which is used by Hibernate for case-insensitive string comparisons in JPQL queries.

## Load the data
Run from the project root:
```bash
./scripts/db-seed.sh
````

What it does:

1. Ensures the table and index exist.
2. Pages through the API using `$limit`, `$offset` and a stable `$order` for deterministic pagination. ([Socrata Developers][2])
3. Transforms GeoJSON → CSV with `jq`, emitting `null` for missing values.
4. Bulk loads with:

   ```
   \copy ... WITH (FORMAT csv, HEADER true, NULL '', FORCE_NULL (...))
   ```

   `FORCE_NULL` converts quoted empty strings (`""`) to SQL `NULL` for the listed columns during `COPY`. ([PostgreSQL][3])

## Exploring the data (psql)

Enter the shell:

```bash
docker exec -it postgres psql -U postgres -d postgres
```

Handy commands:

```sql
\x on                         -- expanded output
\d+ public.nyc_restaurant_inspections
SELECT COUNT(*) FROM public.nyc_restaurant_inspections;
SELECT min(inspection_date), max(inspection_date)
  FROM public.nyc_restaurant_inspections;

-- Top cuisines
SELECT cuisine_description, COUNT(*) AS inspections
FROM public.nyc_restaurant_inspections
GROUP BY cuisine_description
ORDER BY inspections DESC
LIMIT 20;

-- Latest grade per restaurant (one row per CAMIS)
SELECT DISTINCT ON (camis) camis, dba, boro, grade, grade_date
FROM public.nyc_restaurant_inspections
WHERE grade IS NOT NULL
ORDER BY camis, grade_date DESC;
```

`\d` / `\dt` / `\d+` are psql meta-commands for inspecting schema objects. ([PostgreSQL][1])

## Schema Changes

### location_point1 Column Type

The `location_point1` column was changed from `jsonb` to `text` to resolve compatibility issues with JPA/Hibernate:

**Problem:** Hibernate's query translation applies the `UPPER()` function to all string columns in JPQL queries for case-insensitive comparisons. PostgreSQL's `jsonb` type doesn't support `UPPER()`, causing queries to fail with:
```
ERROR: function upper(bytea) does not exist
```

**Solution:** Store the GeoJSON geometry as `text` instead of `jsonb`. The migration is handled automatically by the `db-seed.sh` script:

```sql
-- Convert location_point1 from jsonb to text if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nyc_restaurant_inspections' 
    AND column_name = 'location_point1' 
    AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE nyc_restaurant_inspections ALTER COLUMN location_point1 TYPE text;
  END IF;
END$$;
```

**Impact:** If you need to query the geometry data, you can:
- Cast back to `jsonb`: `location_point1::jsonb`
- Parse as JSON in your application code
- Use PostGIS for spatial queries (see below)

## Notes

* **Security:** Avoid exporting `PGPASSWORD`; prefer a `.pgpass` file (or Docker secrets). ([PostgreSQL][4])
* **Spatial option:** If you need spatial queries, switch `location_point1` to a PostGIS `geometry(Point, 4326)` built from `longitude/latitude`, and add a GIST index.

[1]: https://www.postgresql.org/docs/current/app-psql.html?utm_source=chatgpt.com "PostgreSQL: Documentation: 18: psql"
[2]: https://dev.socrata.com/docs/queries/limit.html?utm_source=chatgpt.com "The LIMIT Clause - Socrata - Data & Insights"
[3]: https://www.postgresql.org/docs/current/sql-copy.html?utm_source=chatgpt.com "Documentation: 18: COPY"
[4]: https://www.postgresql.org/docs/current/libpq-envars.html?utm_source=chatgpt.com "Documentation: 18: 32.15. Environment Variables"
