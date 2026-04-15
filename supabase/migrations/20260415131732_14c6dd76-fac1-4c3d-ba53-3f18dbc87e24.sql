
-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'team_member', 'user');

-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  status public.approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create standards table
CREATE TABLE public.standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.standards ENABLE ROW LEVEL SECURITY;

-- Create telltale_standards junction table
CREATE TABLE public.telltale_standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telltale_id UUID NOT NULL REFERENCES public.telltales(id) ON DELETE CASCADE,
  standard_id UUID NOT NULL REFERENCES public.standards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (telltale_id, standard_id)
);

ALTER TABLE public.telltale_standards ENABLE ROW LEVEL SECURITY;

-- Add category and created_by to telltales
ALTER TABLE public.telltales ADD COLUMN category TEXT;
ALTER TABLE public.telltales ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Security definer function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function: is_approved
CREATE OR REPLACE FUNCTION public.is_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND status = 'approved'
  )
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Standards policies
CREATE POLICY "Anyone can view standards" ON public.standards FOR SELECT USING (true);
CREATE POLICY "Admins can insert standards" ON public.standards FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update standards" ON public.standards FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete standards" ON public.standards FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Telltale_standards policies
CREATE POLICY "Anyone can view telltale_standards" ON public.telltale_standards FOR SELECT USING (true);
CREATE POLICY "Approved users can insert telltale_standards" ON public.telltale_standards FOR INSERT WITH CHECK (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can delete telltale_standards" ON public.telltale_standards FOR DELETE USING (public.is_approved(auth.uid()));

-- Update telltales RLS: replace public policies with auth-based ones
DROP POLICY IF EXISTS "Anyone can insert telltales" ON public.telltales;
DROP POLICY IF EXISTS "Anyone can update telltales" ON public.telltales;
DROP POLICY IF EXISTS "Anyone can delete telltales" ON public.telltales;

CREATE POLICY "Approved users can insert telltales" ON public.telltales FOR INSERT WITH CHECK (public.is_approved(auth.uid()));
CREATE POLICY "Approved users or admins can update telltales" ON public.telltales FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR (public.is_approved(auth.uid()) AND created_by = auth.uid())
);
CREATE POLICY "Admins or creators can delete telltales" ON public.telltales FOR DELETE USING (
  public.has_role(auth.uid(), 'admin') OR created_by = auth.uid()
);

-- Update telltale_images RLS
DROP POLICY IF EXISTS "Anyone can insert telltale_images" ON public.telltale_images;
DROP POLICY IF EXISTS "Anyone can delete telltale_images" ON public.telltale_images;

CREATE POLICY "Approved users can insert telltale_images" ON public.telltale_images FOR INSERT WITH CHECK (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can delete telltale_images" ON public.telltale_images FOR DELETE USING (public.is_approved(auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_standards_updated_at BEFORE UPDATE ON public.standards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.standards;

-- Seed initial standards
INSERT INTO public.standards (name, description) VALUES
  ('FMVSS', 'Federal Motor Vehicle Safety Standards'),
  ('ISO', 'International Organization for Standardization'),
  ('SAE', 'Society of Automotive Engineers'),
  ('ECE', 'Economic Commission for Europe Regulations'),
  ('GB', 'Chinese National Standards');
