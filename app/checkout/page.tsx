import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-bone font-bold">Loading checkout…</div>}><CheckoutForm /></Suspense>;
}
