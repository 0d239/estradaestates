-- Add username column to profiles
ALTER TABLE profiles ADD COLUMN username text UNIQUE;

-- Set usernames for existing accounts
UPDATE profiles SET username = 'henry' WHERE email = 'EstradaSold@MyHillTopRealty.com';
UPDATE profiles SET username = '3fra' WHERE email ILIKE '%3fra%' OR name ILIKE '%3fra%';

-- Make username required going forward
-- (not adding NOT NULL yet since sophia/laura accounts don't exist — set after creating them)

-- Function to look up email by username (bypasses RLS)
CREATE OR REPLACE FUNCTION get_email_by_username(lookup_username text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM profiles WHERE username = lower(lookup_username) LIMIT 1;
$$;

-- Allow anon to call this function
GRANT EXECUTE ON FUNCTION get_email_by_username(text) TO anon;
GRANT EXECUTE ON FUNCTION get_email_by_username(text) TO authenticated;
