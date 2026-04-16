
-- 1. Restrict profiles SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. Restrict user_roles SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;
CREATE POLICY "Authenticated users can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- 3. Tighten telltale_images DELETE to creator or admin
DROP POLICY IF EXISTS "Approved users can delete telltale_images" ON public.telltale_images;
CREATE POLICY "Creator or admin can delete telltale_images"
  ON public.telltale_images FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.telltales t
      WHERE t.id = telltale_id AND t.created_by = auth.uid()
    )
  );

-- 4. Restrict storage object listing to authenticated users
DROP POLICY IF EXISTS "Anyone can view telltale images" ON storage.objects;
CREATE POLICY "Authenticated users can view telltale images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'telltale-images');
