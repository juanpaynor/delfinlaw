-- ============================================================
-- Supabase Storage: Create 'media' bucket + RLS policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Public read access — anyone can view uploaded images
CREATE POLICY "Public read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 3. Authenticated users can upload
CREATE POLICY "Auth upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- 4. Authenticated users can update (overwrite)
CREATE POLICY "Auth update media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- 5. Authenticated users can delete
CREATE POLICY "Auth delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- 6. Add branding settings if not exist
INSERT INTO site_settings (key, value, group_name)
VALUES ('logo_url', '', 'branding')
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_settings (key, value, group_name)
VALUES ('hero_image_url', '', 'branding')
ON CONFLICT (key) DO NOTHING;
