
-- Remove open storage policies
DROP POLICY IF EXISTS "Anyone can upload telltale images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete telltale images" ON storage.objects;

-- Restrict upload to approved users
CREATE POLICY "Approved users can upload telltale images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'telltale-images' AND public.is_approved(auth.uid())
  );

-- Restrict delete to approved users
CREATE POLICY "Approved users can delete telltale images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'telltale-images' AND public.is_approved(auth.uid())
  );
