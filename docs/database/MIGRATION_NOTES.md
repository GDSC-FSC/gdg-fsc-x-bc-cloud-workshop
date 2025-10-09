# Database Migration Notes

## location_point1 Column Type Change

**Date:** October 9, 2025  
**Issue:** PostgreSQL `jsonb` incompatibility with JPA/Hibernate queries  
**Solution:** Changed `location_point1` from `jsonb` to `text`

### Problem Description

The NYC Restaurant Inspections table originally stored the GeoJSON geometry in a `location_point1` column with type `jsonb`. This caused runtime errors when Hibernate executed JPQL queries:

```
ERROR: function upper(bytea) does not exist
Hint: No function matches the given name and argument types. You might need to add explicit type casts.
Position: 539
```

**Root Cause:** Hibernate's query engine automatically applies the `UPPER()` function to string columns in SELECT statements for case-insensitive comparisons. PostgreSQL's `jsonb` type doesn't support the `UPPER()` function, causing the query to fail.

### Changes Made

#### 1. Entity Class Update
**File:** `api/src/main/java/com/example/api/entities/RestaurantInspection.java`

```java
// Before
@Column(name = "location_point1", columnDefinition = "jsonb")
private String locationPoint1;

// After
@Column(name = "location_point1", columnDefinition = "TEXT")
private String locationPoint1;
```

#### 2. Database Seed Script Update
**File:** `scripts/db-seed.sh`

- Changed table creation statement from `location_point1 jsonb` to `location_point1 text`
- Added automatic migration logic to convert existing `jsonb` columns:

```sql
-- Convert location_point1 from jsonb to text if it exists as jsonb
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

#### 3. Documentation Updates
**File:** `docs/database/README.md`

- Updated table schema documentation
- Added explanation of the column type change
- Provided migration notes and workarounds

### Migration Steps

For existing databases:

1. **Automatic Migration:** The `db-seed.sh` script now includes automatic migration logic. Simply run:
   ```bash
   ./scripts/db-seed.sh
   ```

2. **Manual Migration:** If needed, run this SQL directly:
   ```sql
   ALTER TABLE nyc_restaurant_inspections ALTER COLUMN location_point1 TYPE text;
   ```

3. **Rebuild Application:** Clean and rebuild the API to clear any cached Hibernate metadata:
   ```bash
   cd api
   ./gradlew clean build
   ```

### Impact Assessment

**Positive:**
- ✅ Fixes runtime query errors
- ✅ No data loss (PostgreSQL automatically converts jsonb to text)
- ✅ Maintains full GeoJSON data integrity
- ✅ Backward compatible (existing data remains queryable)

**Neutral:**
- ⚠️ JSON queries require explicit casting: `location_point1::jsonb`
- ⚠️ If using PostGIS, additional migration would be needed

**Considerations:**
- The geometry data is still stored as valid JSON text
- Applications can parse it as JSON without issues
- For spatial queries, consider migrating to PostGIS `geometry(Point, 4326)`

### Testing

After migration, verify:

1. **Column Type:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'nyc_restaurant_inspections' 
   AND column_name = 'location_point1';
   ```
   Expected: `data_type = 'text'`

2. **Data Integrity:**
   ```sql
   SELECT location_point1::jsonb 
   FROM nyc_restaurant_inspections 
   WHERE location_point1 IS NOT NULL 
   LIMIT 5;
   ```
   Should successfully cast and display GeoJSON

3. **API Queries:**
   ```bash
   curl -X POST http://localhost:8080/api/restaurants/query \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   Should return results without errors

### Rollback Procedure

If you need to rollback to `jsonb`:

```sql
ALTER TABLE nyc_restaurant_inspections ALTER COLUMN location_point1 TYPE jsonb USING location_point1::jsonb;
```

Then revert the Entity class and rebuild:
```java
@Column(name = "location_point1", columnDefinition = "jsonb")
private String locationPoint1;
```

### References

- [PostgreSQL COPY Documentation](https://www.postgresql.org/docs/current/sql-copy.html)
- [Hibernate Type Mapping](https://docs.jboss.org/hibernate/orm/6.6/userguide/html_single/Hibernate_User_Guide.html#basic-types)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [GeoJSON RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946)
