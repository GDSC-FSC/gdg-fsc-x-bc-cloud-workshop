#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${CONTAINER:-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
TABLE="${TABLE:-nyc_restaurant_inspections}"
API="https://data.cityofnewyork.us/resource/43nn-pn8j.geojson"
PAGE_SIZE="${PAGE_SIZE:-50000}"
ORDER="${ORDER:-camis,inspection_date,violation_code}"

docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" <<'SQL'
CREATE TABLE IF NOT EXISTS nyc_restaurant_inspections (
  camis               text,
  dba                 text,
  boro                text,
  building            text,
  street              text,
  zipcode             text,
  phone               text,
  cuisine_description text,
  inspection_date     timestamp,
  action              text,
  violation_code      text,
  violation_description text,
  critical_flag       text,
  score               numeric,
  grade               text,
  grade_date          timestamp,
  record_date         timestamp,
  inspection_type     text,
  latitude            numeric,
  longitude           numeric,
  community_board     text,
  council_district    text,
  census_tract        text,
  bin                 text,
  bbl                 text,
  nta                 text,
  location_point1     jsonb
);
CREATE INDEX IF NOT EXISTS nyc_rest_inspections_cam_ins_date_idx
  ON nyc_restaurant_inspections (camis, inspection_date);
SQL

TMP_CSV="$(mktemp)"; trap 'rm -f "$TMP_CSV"' EXIT
cat > "$TMP_CSV" <<'CSV'
camis,dba,boro,building,street,zipcode,phone,cuisine_description,inspection_date,action,violation_code,violation_description,critical_flag,score,grade,grade_date,record_date,inspection_type,latitude,longitude,community_board,council_district,census_tract,bin,bbl,nta,location_point1
CSV

offset=0
while : ; do
  echo "Fetching $API  limit=$PAGE_SIZE  offset=$offset ..."
  data="$(curl -fsSL --get "$API" \
    --data-urlencode "\$limit=$PAGE_SIZE" \
    --data-urlencode "\$offset=$offset" \
    --data-urlencode "\$order=$ORDER")"

  count=$(jq '.features | length' <<<"$data")
  [[ "$count" -eq 0 ]] && break

  # NOTE: use null (not "") so empty cells become real NULLs in COPY
  jq -r '
    .features[]
    | .properties as $p
    | [
        ($p.camis // null),
        ($p.dba // null),
        ($p.boro // null),
        ($p.building // null),
        ($p.street // null),
        ($p.zipcode // null),
        ($p.phone // null),
        ($p.cuisine_description // null),
        ($p.inspection_date // null),
        ($p.action // null),
        ($p.violation_code // null),
        ($p.violation_description // null),
        ($p.critical_flag // null),
        ($p.score // null),
        ($p.grade // null),
        ($p.grade_date // null),
        ($p.record_date // null),
        ($p.inspection_type // null),
        ($p.latitude // null),
        ($p.longitude // null),
        ($p.community_board // null),
        ($p.council_district // null),
        ($p.census_tract // null),
        ($p.bin // null),
        ($p.bbl // null),
        ($p.nta // null),
        (if .geometry? then .geometry else null end)
      ]
      | @csv
  ' <<<"$data" >> "$TMP_CSV"

  offset=$(( offset + PAGE_SIZE ))
done

echo "Loading CSV into $TABLE ..."
# Treat empty cells as NULLs; and coerce quoted-empties to NULL for these columns
cat "$TMP_CSV" | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
  -c "\copy $TABLE FROM STDIN WITH (FORMAT csv, HEADER true, NULL '', FORCE_NULL (inspection_date, grade_date, record_date, score, latitude, longitude, location_point1))"

echo "Done. Row count:"
docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM $TABLE;"
