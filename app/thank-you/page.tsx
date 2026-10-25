import { Suspense } from "react";
import { ThankYouContent } from "@/components/thank-you-content";

export default function ThankYouPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-ink font-bold text-white">Loading your order…</div>}><ThankYouContent /></Suspense>;
}
