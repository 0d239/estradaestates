-- Add latitude/longitude columns to listings for map view
ALTER TABLE listings
  ADD COLUMN latitude  double precision,
  ADD COLUMN longitude double precision;

-- Index for spatial queries
CREATE INDEX idx_listings_coordinates ON listings (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
