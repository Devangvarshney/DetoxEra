-- =========================================================================
-- AyurSutra: Multiple Doctor Clinics/Addresses & Practitioner Feedback/Reviews
-- Run this in Supabase Dashboard -> SQL Editor
-- =========================================================================

-- 1. Table for Doctors' Multiple Clinic Addresses
CREATE TABLE IF NOT EXISTS public.practitioner_clinics (
    id SERIAL PRIMARY KEY,
    practitioner_id INTEGER REFERENCES public.practitioners(id) ON DELETE CASCADE,
    clinic_name VARCHAR(255) NOT NULL,
    clinic_address VARCHAR(500) NOT NULL,
    city VARCHAR(255),
    timing VARCHAR(255),
    phone VARCHAR(50),
    consultation_fee VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table for Practitioner Feedback with Stars (1-5) and Reviews
CREATE TABLE IF NOT EXISTS public.practitioner_reviews (
    id SERIAL PRIMARY KEY,
    practitioner_id INTEGER REFERENCES public.practitioners(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES public.patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review TEXT,
    clinic_name VARCHAR(255),
    clinic_address VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Grants for Supabase roles (anon, authenticated, service_role)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.practitioner_clinics TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.practitioner_reviews TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.practitioner_clinics_id_seq TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.practitioner_reviews_id_seq TO postgres, anon, authenticated, service_role;

-- 4. Disable RLS for seamless app access
ALTER TABLE public.practitioner_clinics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_reviews DISABLE ROW LEVEL SECURITY;
