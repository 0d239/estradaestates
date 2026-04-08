-- Add source tracking columns for IDX integration
-- Source determines lifecycle: 'idx' listings are managed by sync, 'manual' by agents

-- Create listing source enum
CREATE TYPE listing_source AS ENUM ('idx', 'manual');

-- Add source tracking columns
ALTER TABLE listings
  ADD COLUMN source listing_source NOT NULL DEFAULT 'manual',
  ADD COLUMN idx_key TEXT UNIQUE,
  ADD COLUMN idx_synced_at TIMESTAMPTZ,
  ADD COLUMN idx_removed_at TIMESTAMPTZ;

-- Index for sync job lookups
CREATE INDEX idx_listings_idx_key ON listings (idx_key) WHERE idx_key IS NOT NULL;
CREATE INDEX idx_listings_source ON listings (source);

-- Constraint: idx listings must have an idx_key
ALTER TABLE listings
  ADD CONSTRAINT chk_idx_key_required
  CHECK (source = 'manual' OR idx_key IS NOT NULL);
