import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nxyzpcrieucfvckrsayc.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_8mYuYdC0SDTnsolk8Bj1ZQ_-fhqSVNU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface PractitionerReviewRecord {
  id?: number;
  practitioner_id: number;
  patient_id?: number | null;
  patient_name?: string | null;
  rating: number; // 1-5
  review_text?: string | null;
  review?: string | null;
  clinic_name?: string | null;
  clinic_address?: string | null;
  created_at?: string;
}

export interface PractitionerClinicRecord {
  id?: number | string;
  practitioner_id?: number;
  clinic_name: string;
  clinic_address: string;
  city?: string | null;
  timing?: string | null;
  phone?: string | null;
  consultation_fee?: string | null;
  is_primary?: boolean;
}

/**
 * Fetch reviews for a specific practitioner
 */
export async function getPractitionerReviews(practitionerId: number): Promise<PractitionerReviewRecord[]> {
  try {
    const { data, error } = await supabase
      .from("practitioner_reviews")
      .select("*")
      .eq("practitioner_id", practitionerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Notice: Error fetching practitioner_reviews from Supabase:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Exception fetching practitioner_reviews:", err);
    return [];
  }
}

/**
 * Submit feedback / review for a practitioner
 */
export async function addPractitionerReview(review: PractitionerReviewRecord): Promise<PractitionerReviewRecord | null> {
  try {
    const reviewContent = review.review || review.review_text || "";
    const payload = {
      practitioner_id: review.practitioner_id,
      patient_id: review.patient_id ?? null,
      patient_name: review.patient_name || "Verified Patient",
      rating: review.rating,
      review: reviewContent,
      review_text: reviewContent,
      clinic_name: review.clinic_name || null,
      clinic_address: review.clinic_address || null,
    };

    const { data, error } = await supabase
      .from("practitioner_reviews")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn("Notice: Error saving practitioner review to Supabase:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Exception inserting practitioner review:", err);
    return null;
  }
}

export default supabase;

