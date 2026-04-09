-- Notes: team members can leave notes on listings, contacts, or the general archive.
-- A note with both listing_id and contact_id NULL is a general/archive note.
-- Public notes (is_public = true) on listings are displayed on the public listing page.

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common lookups
CREATE INDEX idx_notes_listing ON notes (listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX idx_notes_contact ON notes (contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_notes_author ON notes (author_id);
CREATE INDEX idx_notes_assigned ON notes (assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_notes_public_listing ON notes (listing_id) WHERE is_public = true AND listing_id IS NOT NULL;

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all notes
CREATE POLICY "Authenticated users can view notes"
  ON notes FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can view public notes (for the listing page widget)
CREATE POLICY "Anyone can view public notes"
  ON notes FOR SELECT
  TO anon
  USING (is_public = true);

-- Authenticated users can create notes
CREATE POLICY "Authenticated users can create notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Authors can update their own notes
CREATE POLICY "Authors can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Authors can delete their own notes
CREATE POLICY "Authors can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());
