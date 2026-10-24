/**
 * AyurSutra - Supabase Database & Auth Connection Test Script
 * Tests both Publishable Key (anon) and Secret Key (service_role)
 * Run with: node ayursutra/test_supabase.js
 */

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nxyzpcrieucfvckrsayc.supabase.co";

const PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_8mYuYdC0SDTnsolk8Bj1ZQ_-fhqSVNU";

const SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  "your_supabase_secret_key";

const tables = [
  "practitioners",
  "patients",
  "users",
  "therapy_plans",
  "therapy_sessions",
  "therapy_templates",
  "feedback",
  "notifications",
  "practitioner_clinics",
  "practitioner_reviews",
];

async function testRole(name, key) {
  console.log(`\n--- Testing ${name} (${key.substring(0, 15)}...) ---`);
  const client = createClient(SUPABASE_URL, key);

  for (const table of tables) {
    const { data, error, status } = await client.from(table).select("*").limit(1);
    if (error) {
      if (error.code === "42501" || status === 401 || status === 403) {
        console.log(`  🔒 Table '${table}': Permission Denied (Code: ${error.code})`);
        console.log(`     Hint: ${error.hint || error.message}`);
      } else if (error.code === "PGRST205" || status === 404) {
        console.log(`  ❓ Table '${table}': Not found in schema cache`);
      } else {
        console.log(`  ⚠️  Table '${table}': Error ${status} (${error.code}) - ${error.message}`);
      }
    } else {
      console.log(`  ✅ Table '${table}': SUCCESS! Accessible (Rows: ${data.length})`);
    }
  }
}

async function verifyConnection() {
  console.log("==========================================");
  console.log("   AyurSutra - Supabase Connection Test   ");
  console.log("==========================================");
  console.log(`Endpoint URL: ${SUPABASE_URL}`);

  // 1. Test Auth Service
  const pubClient = createClient(SUPABASE_URL, PUBLISHABLE_KEY);
  const { data: authData, error: authError } = await pubClient.auth.getSession();
  if (authError) {
    console.error("\n❌ Auth service error:", authError.message);
  } else {
    console.log("\n✅ Auth Service reachable (Session state checked).");
  }

  // 2. Test Publishable Key (Frontend / anon)
  await testRole("1. Publishable Key (Frontend / anon)", PUBLISHABLE_KEY);

  // 3. Test Secret Key (Backend / service_role)
  await testRole("2. Secret Key (Backend / service_role)", SECRET_KEY);

  console.log("\n==========================================");
  console.log("   Test Finished                          ");
  console.log("==========================================\n");
}

verifyConnection();
