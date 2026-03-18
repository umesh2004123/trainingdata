
-- Create telltales table
CREATE TABLE public.telltales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'ongoing', 'completed')) DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create telltale_images table
CREATE TABLE public.telltale_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telltale_id UUID NOT NULL REFERENCES public.telltales(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telltales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telltale_images ENABLE ROW LEVEL SECURITY;

-- Public access policies for telltales (no auth required)
CREATE POLICY "Anyone can view telltales" ON public.telltales FOR SELECT USING (true);
CREATE POLICY "Anyone can insert telltales" ON public.telltales FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update telltales" ON public.telltales FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete telltales" ON public.telltales FOR DELETE USING (true);

-- Public access policies for telltale_images
CREATE POLICY "Anyone can view telltale_images" ON public.telltale_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert telltale_images" ON public.telltale_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete telltale_images" ON public.telltale_images FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
CREATE TRIGGER update_telltales_updated_at
  BEFORE UPDATE ON public.telltales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for telltale images
INSERT INTO storage.buckets (id, name, public) VALUES ('telltale-images', 'telltale-images', true);

-- Storage policies
CREATE POLICY "Anyone can view telltale images" ON storage.objects FOR SELECT USING (bucket_id = 'telltale-images');
CREATE POLICY "Anyone can upload telltale images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'telltale-images');
CREATE POLICY "Anyone can delete telltale images" ON storage.objects FOR DELETE USING (bucket_id = 'telltale-images');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.telltales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.telltale_images;
