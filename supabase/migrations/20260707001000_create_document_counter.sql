/*
# Create document_counter table

## Purpose
Tracks the global auto-incrementing counter for Inform Consent document numbers.
Each new document gets a unique number in the format IC-YYYY-NNNN.

## Tables
- `document_counter`
  - `id` (int, primary key, always 1 — single row)
  - `counter` (int, current counter value, starts at 0)
  - `year` (int, current year for the counter)
  - `updated_at` (timestamp)

## Security
- RLS enabled, anon + authenticated can read and update (single-tenant, no auth).

## Notes
- Single row with id=1 is upserted on first use.
- Counter resets to 1 each new year.
*/

CREATE TABLE IF NOT EXISTS document_counter (
  id int PRIMARY KEY DEFAULT 1,
  counter int NOT NULL DEFAULT 0,
  year int NOT NULL DEFAULT EXTRACT(YEAR FROM now())::int,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE document_counter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_counter" ON document_counter;
CREATE POLICY "anon_select_counter" ON document_counter FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_counter" ON document_counter;
CREATE POLICY "anon_insert_counter" ON document_counter FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_counter" ON document_counter;
CREATE POLICY "anon_update_counter" ON document_counter FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO document_counter (id, counter, year)
VALUES (1, 0, EXTRACT(YEAR FROM now())::int)
ON CONFLICT (id) DO NOTHING;
