CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_admin_email boolean;
BEGIN
  is_admin_email := NEW.email IN (
    'umeshvalvala2004@gmail.com',
    'umeshvalavala2004@gmail.com',
    'musiccanvas5@gmail.com'
  );

  INSERT INTO public.profiles (user_id, email, display_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN is_admin_email THEN 'approved'::approval_status ELSE 'pending'::approval_status END
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN is_admin_email THEN 'admin'::app_role ELSE 'user'::app_role END
  );

  RETURN NEW;
END;
$function$;

-- Backfill: promote any existing accounts matching admin emails
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role
FROM public.profiles p
WHERE p.email IN ('umeshvalvala2004@gmail.com', 'umeshvalavala2004@gmail.com', 'musiccanvas5@gmail.com')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'admin'::app_role
  );

UPDATE public.profiles
SET status = 'approved'::approval_status
WHERE email IN ('umeshvalvala2004@gmail.com', 'umeshvalavala2004@gmail.com', 'musiccanvas5@gmail.com')
  AND status <> 'approved'::approval_status;