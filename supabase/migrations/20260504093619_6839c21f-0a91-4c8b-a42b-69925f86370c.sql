-- Add SEO + spec fields to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS elevation_m integer,
  ADD COLUMN IF NOT EXISTS variety text,
  ADD COLUMN IF NOT EXISTS harvest_year integer,
  ADD COLUMN IF NOT EXISTS seo_description text;

-- Testimonials / "as served in" logos
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'testimonial', -- 'testimonial' | 'logo'
  author text,
  role text,
  quote text,
  logo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read testimonials"
  ON public.testimonials FOR SELECT
  USING (true);

CREATE POLICY "Admins manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));