"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Home, PhoneCall } from "lucide-react";
import { formatNpr, product as configuredProduct } from "@/lib/product";

export function ThankYouContent() {
  const params = useSearchParams();
  const product = params.get("product") || configuredProduct.name;
  const quantity = Math.max(1, Number(params.get("qty") || 1));
  const total = Math.max(0, Number(params.get("total") || configuredProduct.price));
  const orderId = params.get("orderId");
  return (
    <main className="noise grid min-h-screen place-items-center bg-ink px-5 py-16 text-white">
      <section className="w-full max-w-2xl rounded-[2.5rem] border border-white/10 bg-white/[.06] p-7 text-center shadow-2xl backdrop-blur sm:p-12">
        <Link href="/" aria-label="Sneakers Nepal home" className="mx-auto block w-48 sm:w-56">
          <Image src="/brand/sneakers-nepal-logo-new.png" alt="Sneakers Nepal" width={2172} height={724} sizes="(max-width: 639px) 192px, 224px" className="h-auto w-full" priority unoptimized />
        </Link>
        <div className="mx-auto mt-8 grid h-20 w-20 place-items-center rounded-full bg-volt text-ink"><Check size={38} strokeWidth={3} /></div>
        <p className="eyebrow mt-8 text-volt">ORDER RECEIVED</p>
        <h1 className="display-font mt-3 text-[clamp(3.5rem,13vw,6rem)] uppercase leading-[.9]">Thank you<br />for your order!</h1>
        <p className="mx-auto mt-6 max-w-lg leading-7 text-white/60">Our sales representative will call you soon to confirm your order.</p>
        <div className="mt-9 rounded-3xl bg-white p-6 text-left text-ink">
          {orderId && <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-5"><span className="text-xs font-bold uppercase tracking-widest text-black/40">Order ID</span><span className="font-black">{orderId}</span></div>}
          <div className="space-y-4 text-sm"><Row label="Product ordered" value={product} /><Row label="Quantity" value={String(quantity)} /><Row label="Total price" value={formatNpr(total)} strong /><Row label="Payment method" value="Cash On Delivery" /></div>
        </div>
        <div className="mt-7 flex items-center justify-center gap-2 text-sm text-white/55"><PhoneCall size={17} className="text-volt" /> Keep your phone nearby for confirmation.</div>
        <Link href="/" className="btn-volt mt-8"><Home size={17} /> Back to Home</Link>
      </section>
    </main>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-5"><span className="text-black/45">{label}</span><span className={strong ? "text-lg font-black" : "font-bold"} style={strong ? { color: "#15803d" } : undefined}>{value}</span></div>;
}
