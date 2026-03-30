// app/patient/find-doctor/page.jsx
"use client";
import { Suspense } from "react";
import FindDoctorClient from "./Finddoctorclient";

// FindDoctorClient uses useSearchParams() which requires a Suspense boundary
// in Next.js 14 App Router to avoid hydration mismatches.
export default function FindDoctorPage() {
  return (
    <Suspense fallback={null}>
      <FindDoctorClient />
    </Suspense>
  );
}
