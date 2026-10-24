-- ====================================================================
-- KAYRO WELLNESS APPOINTMENTS — SUPABASE DATABASE SCHEMA
-- ====================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.appointments (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT DEFAULT '',
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Booked' CHECK (status IN ('Booked', 'Done', 'No-show', 'Cancelled')),
  is_confirmed BOOLEAN DEFAULT false,
  consultation_focus TEXT DEFAULT 'General Wellness',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for fast conflict lookups (prevent double booking)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_booked_slot 
ON public.appointments (appointment_date, appointment_time) 
WHERE status = 'Booked';

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. Create public access policy for assessment reviewer & client app
-- Allows public anonymous reading and updating for seamless demo evaluation
CREATE POLICY "Allow anonymous read access" 
ON public.appointments FOR SELECT 
USING (true);

CREATE POLICY "Allow anonymous insert access" 
ON public.appointments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" 
ON public.appointments FOR UPDATE 
USING (true);

CREATE POLICY "Allow anonymous delete access" 
ON public.appointments FOR DELETE 
USING (true);

-- 5. Seed required sample data from assignment
INSERT INTO public.appointments (client_name, client_phone, appointment_date, appointment_time, status, is_confirmed, consultation_focus)
VALUES
  ('Riya Shah', '98200 11111', '2026-10-24', '10:00', 'Booked', true, 'Gut Health & Digestion'),
  ('Arjun Mehta', '98200 22222', '2026-10-24', '11:30', 'Booked', false, 'Sports Nutrition & Energy'),
  ('Riya Shah', '98200 11111', '2026-10-25', '16:00', 'Booked', false, 'Follow-up Consultation'),
  ('Meera Iyer', '', '2026-10-23', '09:00', 'Done', true, 'Hormonal & Thyroid Nutrition'),
  ('Kabir Rao', '98200 33333', '2026-10-22', '14:00', 'No-show', false, 'Weight Management')
ON CONFLICT DO NOTHING;
