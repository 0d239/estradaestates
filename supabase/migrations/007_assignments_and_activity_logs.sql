-- Listing assignments: many-to-many between listings and agent profiles
-- An agent can be assigned to multiple listings; a listing can have multiple agents

CREATE TABLE listing_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (listing_id, profile_id)
);

CREATE INDEX idx_listing_assignments_listing ON listing_assignments (listing_id);
CREATE INDEX idx_listing_assignments_profile ON listing_assignments (profile_id);

ALTER TABLE listing_assignments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all assignments
CREATE POLICY "Authenticated users can view assignments"
  ON listing_assignments FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage assignments
CREATE POLICY "Authenticated users can manage assignments"
  ON listing_assignments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- Activity logs: unified audit trail for all system events
-- Covers listings, contacts, leads, assignments, notes, and future entity types

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  note TEXT
);

-- Indexes for common queries
CREATE INDEX idx_activity_logs_entity ON activity_logs (entity_type, entity_id);
CREATE INDEX idx_activity_logs_actor ON activity_logs (actor_id);
CREATE INDEX idx_activity_logs_created ON activity_logs (created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs (action);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all logs
CREATE POLICY "Authenticated users can view logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert logs
CREATE POLICY "Authenticated users can insert logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Logs are append-only; no update/delete policies


-- Backfill: create a listing_created log entry for every existing IDX listing
INSERT INTO activity_logs (created_at, actor_id, action, entity_type, entity_id, metadata)
SELECT
  l.created_at,
  NULL,
  'listing_created',
  'listing',
  l.id,
  jsonb_build_object(
    'source', l.source::text,
    'address', l.address,
    'status', l.status::text,
    'idx_key', l.idx_key,
    'backfilled', true
  )
FROM listings l
WHERE l.source = 'idx';

-- Also backfill manual listings
INSERT INTO activity_logs (created_at, actor_id, action, entity_type, entity_id, metadata)
SELECT
  l.created_at,
  l.listed_by,
  'listing_created',
  'listing',
  l.id,
  jsonb_build_object(
    'source', l.source::text,
    'address', l.address,
    'status', l.status::text,
    'backfilled', true
  )
FROM listings l
WHERE l.source = 'manual';
