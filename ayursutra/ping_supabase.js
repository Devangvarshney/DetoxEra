/**
 * AyurSutra - Team Supabase Live Ping & Verification Script
 * This script sends live ping requests with identifiable headers so teammates
 * can inspect the incoming events in real-time in the Supabase Dashboard!
 */

const https = require("https");
const net = require("net");

const PROJECT_REF = "nxyzpcrieucfvckrsayc";
const BASE_URL = `https://${PROJECT_REF}.supabase.co`;
const PUBLISHABLE_KEY = "sb_publishable_8mYuYdC0SDTnsolk8Bj1ZQ_-fhqSVNU";
const POOLER_HOST = "aws-0-ap-south-1.pooler.supabase.com";

function httpPing(path, name) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: "GET",
      headers: {
        "apikey": PUBLISHABLE_KEY,
        "Authorization": `Bearer ${PUBLISHABLE_KEY}`,
        "User-Agent": "AyurSutra-Team-Ping/1.0",
        "X-Client-Info": "ayursutra-devang-verification"
      }
    };

    const req = https.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        resolve({
          name,
          url: url.href,
          status: res.statusCode,
          requestId: res.headers["sb-request-id"] || res.headers["cf-ray"],
          date: res.headers["date"],
          success: res.statusCode >= 200 && res.statusCode < 500,
          details: body.substring(0, 120)
        });
      });
    });

    req.on("error", (err) => {
      resolve({ name, url: url.href, status: "ERR", success: false, details: err.message });
    });

    req.end();
  });
}

function tcpPing(host, port) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    socket.setTimeout(4000);

    socket.connect(port, host, () => {
      const latency = Date.now() - startTime;
      socket.destroy();
      resolve({ host, port, success: true, latency });
    });

    socket.on("error", (err) => {
      socket.destroy();
      resolve({ host, port, success: false, error: err.message });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ host, port, success: false, error: "Timed out" });
    });
  });
}

async function main() {
  console.log("=================================================================");
  console.log("   📡 AyurSutra -> Supabase Live Ping & Verification           ");
  console.log("=================================================================");
  console.log(`Target Project Ref : ${PROJECT_REF}`);
  console.log(`Base URL           : ${BASE_URL}`);
  console.log(`Local Wi-Fi IP     : 192.168.1.37`);
  console.log(`Public Egress IP   : 103.152.159.180`);
  console.log(`Timestamp (UTC)    : ${new Date().toISOString()}`);
  console.log("-----------------------------------------------------------------");

  console.log("\n[1] Pinging HTTPS Services (Look in Supabase Dashboard > Logs):");
  const endpoints = [
    ["/auth/v1/health", "Auth Service Health"],
    ["/storage/v1/status", "Storage Service Status"],
    ["/rest/v1/practitioners?select=id&limit=1", "Database PostgREST API"],
    ["/auth/v1/settings", "Auth Configuration Settings"]
  ];

  for (const [path, name] of endpoints) {
    const res = await httpPing(path, name);
    const icon = res.success ? "✅" : "❌";
    console.log(`  ${icon} ${name.padEnd(28)} | HTTP ${res.status} | Req-ID: ${res.requestId || 'N/A'}`);
  }

  console.log("\n[2] Testing Direct Database TCP Network Connection (PostgreSQL):");
  const pooler5432 = await tcpPing(POOLER_HOST, 5432);
  const pooler6543 = await tcpPing(POOLER_HOST, 6543);

  console.log(`  ${pooler5432.success ? "✅" : "❌"} ${POOLER_HOST}:5432 (Session Pooler)    | Latency: ${pooler5432.latency}ms`);
  console.log(`  ${pooler6543.success ? "✅" : "❌"} ${POOLER_HOST}:6543 (Transaction Pooler)| Latency: ${pooler6543.latency}ms`);

  console.log("\n=================================================================");
  console.log("  🎉 All pings dispatched! Your teammates can check:");
  console.log("     1. Supabase Dashboard -> Logs -> API Logs (Filter: 'AyurSutra')");
  console.log("     2. Supabase Dashboard -> Logs -> Auth Logs");
  console.log("=================================================================\n");
}

main();
