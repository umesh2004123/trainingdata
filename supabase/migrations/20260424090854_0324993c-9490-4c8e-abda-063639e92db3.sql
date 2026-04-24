-- Allow admins and team_members to insert/update/delete telltales and related rows,
-- in addition to approved users.

-- TELLTALES
DROP POLICY IF EXISTS "Approved users can insert telltales" ON public.telltales;
CREATE POLICY "Approved or staff can insert telltales"
  ON public.telltales FOR INSERT
  WITH CHECK (
    public.is_approved(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'team_member'::public.app_role)
  );

DROP POLICY IF EXISTS "Approved users or admins can update telltales" ON public.telltales;
CREATE POLICY "Staff or owner can update telltales"
  ON public.telltales FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'team_member'::public.app_role)
    OR (public.is_approved(auth.uid()) AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Admins or creators can delete telltales" ON public.telltales;
CREATE POLICY "Staff or creator can delete telltales"
  ON public.telltales FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'team_member'::public.app_role)
    OR created_by = auth.uid()
  );

-- TELLTALE IMAGES
DROP POLICY IF EXISTS "Approved users can insert telltale_images" ON public.telltale_images;
CREATE POLICY "Approved or staff can insert telltale_images"
  ON public.telltale_images FOR INSERT
  WITH CHECK (
    public.is_approved(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'team_member'::public.app_role)
  );

DROP POLICY IF EXISTS "Creator or admin can delete telltale_images" ON public.telltale_images;
CREATE POLICY "Staff or creator can delete telltale_images"
  ON public.telltale_images FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'team_member'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.telltales t
      WHERE t.id = telltale_images.telltale_id AND t.created_by = auth.uid()
    )
  );

-- TELLTALE STANDARDS
DROP POLICY IF EXISTS "Approved users can insert telltale_standards" ON public.telltale_standards;
CREATE POLICY "Approved or staff can insert telltale_standards"
  ON public.telltale_standards FOR INSERT
  WITH CHECK (
    public.is_approved(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'team_member'::public.app_role)
  );

DROP POLICY IF EXISTS "Approved users can delete telltale_standards" ON public.telltale_standards;
CREATE POLICY "Approved or staff can delete telltale_standards"
  ON public.telltale_standards FOR DELETE
  USING (
    public.is_approved(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'team_member'::public.app_role)
  );