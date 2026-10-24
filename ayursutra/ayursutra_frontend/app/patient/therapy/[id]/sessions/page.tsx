import { Suspense } from "react";
import PatientSessionsClient from "./PatientSessionsClient";

// Required for Next.js static HTML export (output: "export")
export const dynamicParams = false;

export function generateStaticParams() {
  // Pre-generate dynamic routes for therapies 1 to 50 and fallback placeholder
  return [
    { id: "1" },
    ...Array.from({ length: 49 }, (_, i) => ({ id: String(i + 2) })),
  ];
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ayur-muted">Loading therapy sessions...</div>}>
      <PatientSessionsClient />
    </Suspense>
  );
}
