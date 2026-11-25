"""
Real-world HTTP Response Timing & Network Latency Benchmark Suite.
Tests actual live HTTP traffic over real network sockets against FastAPI/Uvicorn,
measuring cold-start overheads, warm query latencies, Supabase cloud DB transit,
P90/P95 percentiles, and concurrency throughput.
"""

import os
import sys
import time
import socket
import statistics
import subprocess
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Any
import requests

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.models.user import User, UserRole

SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8765
BASE_URL = f"http://{SERVER_HOST}:{SERVER_PORT}"

def run_real_http_benchmarks(iterations: int = 10):
    print("=" * 80)
    print("AYURSUTRA REAL HTTP LATENCY & NETWORK PERFORMANCE BENCHMARK")
    print(f"Target: Real HTTP Server ({BASE_URL}) -> Supabase Cloud DB")
    print(f"Iterations per Endpoint: {iterations}")
    print("=" * 80)

    # 1. Start Uvicorn in a clean subprocess
    print("Starting Uvicorn server on port", SERVER_PORT, "...")
    server_process = subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            SERVER_HOST,
            "--port",
            str(SERVER_PORT),
            "--log-level",
            "warning",
        ],
        cwd=backend_dir,
    )

    try:
        # Wait for server to bind and respond to HTTP
        server_ready = False
        for _ in range(60):
            try:
                r = requests.get(f"{BASE_URL}/", timeout=1.0)
                if r.status_code == 200:
                    server_ready = True
                    break
            except Exception:
                time.sleep(0.2)

        if not server_ready:
            raise RuntimeError(f"Server failed to start on {BASE_URL} after 12 seconds")

        print("Server is UP and verified ready on", BASE_URL)

        # 2. Measure Direct Supabase Cloud Network Ping
        db_host = "aws-0-ap-south-1.pooler.supabase.com"
        db_port = 5432
        print(f"\n[1] Measuring Cloud Database Network Transit ({db_host}:{db_port})...")
        
        t0 = time.perf_counter()
        db_ip = socket.gethostbyname(db_host)
        dns_time_ms = (time.perf_counter() - t0) * 1000

        tcp_times = []
        for _ in range(5):
            t0 = time.perf_counter()
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(3.0)
            s.connect((db_ip, db_port))
            s.close()
            tcp_times.append((time.perf_counter() - t0) * 1000)
        
        avg_tcp_ms = statistics.mean(tcp_times)
        print(f"  * DNS Resolution: {dns_time_ms:.2f} ms")
        print(f"  * TCP Handshake to Supabase (Mumbai AWS ap-south-1): {avg_tcp_ms:.2f} ms (Min: {min(tcp_times):.2f} ms, Max: {max(tcp_times):.2f} ms)")

        # 3. Obtain Real Auth Tokens
        db = SessionLocal()
        patient_user = db.query(User).filter(User.role == UserRole.PATIENT).first()
        practitioner_user = db.query(User).filter(User.role == UserRole.PRACTITIONER).first()
        patient_token = create_access_token(patient_user.id, "patient") if patient_user else ""
        practitioner_token = create_access_token(practitioner_user.id, "practitioner") if practitioner_user else ""
        db.close()

        endpoints = [
            {
                "name": "Health Check (Root Gateway)",
                "method": "GET",
                "url": "/",
                "headers": {},
                "category": "Basic Gateway"
            },
            {
                "name": "Practitioners Directory (3-Way Join)",
                "method": "GET",
                "url": "/practitioners",
                "headers": {},
                "category": "Discovery & DB Read"
            },
            {
                "name": "Practitioner City Search (Indexed)",
                "method": "GET",
                "url": "/practitioners?city=Delhi",
                "headers": {},
                "category": "Spatial / Search"
            },
            {
                "name": "Therapy Protocols (Classical 5)",
                "method": "GET",
                "url": "/therapy/templates",
                "headers": {},
                "category": "Template Engine"
            },
            {
                "name": "Academic Research Benchmarks",
                "method": "GET",
                "url": "/analytics/research-benchmarks",
                "headers": {},
                "category": "Research Aggregation"
            },
            {
                "name": "App Evaluation Survey Stats (SUS)",
                "method": "GET",
                "url": "/feedback/app-evaluation/stats",
                "headers": {},
                "category": "Survey Computation"
            },
            {
                "name": "Patient Profile (/patients/me)",
                "method": "GET",
                "url": "/patients/me",
                "headers": {"Authorization": f"Bearer {patient_token}"},
                "category": "JWT Auth & Profile"
            },
            {
                "name": "Active Therapy Plans",
                "method": "GET",
                "url": "/therapy/plans",
                "headers": {"Authorization": f"Bearer {patient_token}"},
                "category": "Relational Multi-Join"
            },
            {
                "name": "Therapy Sessions & Precautions",
                "method": "GET",
                "url": "/therapy/sessions",
                "headers": {"Authorization": f"Bearer {patient_token}"},
                "category": "Relational Multi-Join"
            },
            {
                "name": "Practitioner Analytics Aggregation",
                "method": "GET",
                "url": "/analytics/practitioner",
                "headers": {"Authorization": f"Bearer {practitioner_token}"},
                "category": "Analytical Computation"
            }
        ]

        print("\n[2] Executing Real HTTP Latency Tests (Real Sockets over HTTP/1.1)...")
        results = []

        session = requests.Session()

        for ep in endpoints:
            durations = []
            status_code = None

            full_url = f"{BASE_URL}{ep['url']}"

            for i in range(iterations):
                t0 = time.perf_counter()
                r = session.get(full_url, headers=ep["headers"], timeout=30)
                elapsed_ms = (time.perf_counter() - t0) * 1000.0
                durations.append(elapsed_ms)
                status_code = r.status_code

            cold_ms = durations[0]
            warm_durations = durations[1:] if len(durations) > 1 else durations
            avg_ms = statistics.mean(warm_durations)
            median_ms = statistics.median(warm_durations)
            p90_ms = sorted(warm_durations)[int(len(warm_durations) * 0.9)]
            p95_ms = sorted(warm_durations)[int(len(warm_durations) * 0.95)]
            min_ms = min(warm_durations)
            max_ms = max(warm_durations)
            stdev_ms = statistics.stdev(warm_durations) if len(warm_durations) > 1 else 0.0

            row = {
                "name": ep["name"],
                "category": ep["category"],
                "url": ep["url"],
                "status": status_code,
                "cold_ms": round(cold_ms, 2),
                "warm_avg_ms": round(avg_ms, 2),
                "median_ms": round(median_ms, 2),
                "p90_ms": round(p90_ms, 2),
                "p95_ms": round(p95_ms, 2),
                "min_ms": round(min_ms, 2),
                "max_ms": round(max_ms, 2),
                "stdev_ms": round(stdev_ms, 2)
            }
            results.append(row)
            print(f"  [{row['status']}] {row['name']:<36} | Warm Avg: {row['warm_avg_ms']:>6.1f} ms | Median: {row['median_ms']:>6.1f} ms | P95: {row['p95_ms']:>6.1f} ms | Cold: {row['cold_ms']:>6.1f} ms")

        # 4. Concurrency Load Test (1, 5, 10 Concurrent Workers)
        print("\n[3] Executing Real Concurrency Load Testing...")
        concurrency_levels = [1, 5, 10]
        concurrency_results = {}

        target_url = f"{BASE_URL}/therapy/templates"
        for c in concurrency_levels:
            total_requests = 30
            latencies = []

            def worker_req():
                t0 = time.perf_counter()
                r = requests.get(target_url, timeout=10)
                return (time.perf_counter() - t0) * 1000.0

            t_start = time.perf_counter()
            with ThreadPoolExecutor(max_workers=c) as executor:
                latencies = list(executor.map(lambda _: worker_req(), range(total_requests)))
            total_wall_time = time.perf_counter() - t_start

            rps = round(total_requests / total_wall_time, 1)
            avg_lat = round(statistics.mean(latencies), 1)
            p95_lat = round(sorted(latencies)[int(len(latencies) * 0.95)], 1)

            concurrency_results[c] = {
                "concurrency": c,
                "total_requests": total_requests,
                "throughput_rps": rps,
                "avg_latency_ms": avg_lat,
                "p95_latency_ms": p95_lat
            }
            print(f"  * Concurrency {c:>2} workers: Throughput = {rps:>5.1f} req/s | Avg Latency = {avg_lat:>6.1f} ms | P95 Latency = {p95_lat:>6.1f} ms")

        print("\n" + "=" * 80)
        print("ALL REAL HTTP BENCHMARKS COMPLETED SUCCESSFULLY")
        print("=" * 80)

        return {
            "db_network": {
                "dns_ms": dns_time_ms,
                "tcp_handshake_ms": avg_tcp_ms
            },
            "endpoints": results,
            "concurrency": concurrency_results
        }

    finally:
        print("Stopping Uvicorn server process...")
        server_process.terminate()
        try:
            server_process.wait(timeout=3)
        except Exception:
            server_process.kill()

if __name__ == "__main__":
    run_real_http_benchmarks(10)
