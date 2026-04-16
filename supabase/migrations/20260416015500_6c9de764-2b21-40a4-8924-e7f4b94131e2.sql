
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'umeshvalvala2004@gmail.com' THEN 'approved'::approval_status ELSE 'pending'::approval_status END
  );
  -- Assign role: admin for default super-admin email, user for everyone else
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN NEW.email = 'umeshvalvala2004@gmail.com' THEN 'admin'::app_role ELSE 'user'::app_role END
  );
  RETURN NEW;
END;
$$;
