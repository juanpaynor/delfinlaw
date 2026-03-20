-- Hero Slides Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Public read access
CREATE POLICY "Public read hero slides" ON hero_slides
FOR SELECT USING (true);

-- Authenticated full access
CREATE POLICY "Auth manage hero slides" ON hero_slides
FOR ALL USING (auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
