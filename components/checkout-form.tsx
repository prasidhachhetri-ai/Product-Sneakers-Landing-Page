"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { calculateOrderTotal, DeliveryArea, formatNpr, product } from "@/lib/product";

type Fields = { fullName: string; phone: string; email: string; location: string };
const initialFields: Fields = { fullName: "", phone: "", email: "", location: "" };

export function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const parsedQty = Number(params.get("qty") || 1);
  const parsedSize = Number(params.get("size") || 41);
  const parsedImageIndex = Number(params.get("image") || 0);
  const quantity = Number.isInteger(parsedQty) && parsedQty >= 1 && parsedQty <= 10 ? parsedQty : 1;
  const size = product.sizes.includes(parsedSize as never) ? parsedSize : 41;
  const initialImageIndex = Number.isInteger(parsedImageIndex) && parsedImageIndex >= 0 && parsedImageIndex < product.images.length ? parsedImageIndex : 0;
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialImageIndex);
  const selectedImage = product.images[selectedImageIndex];
  const [fields, setFields] = useState(initialFields);
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>("inside");
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "error"; message?: string }>({ type: "idle" });
  const requestId = useRef("");
  const pricing = useMemo(() => calculateOrderTotal(quantity, deliveryArea), [quantity, deliveryArea]);

  useEffect(() => {
    router.prefetch("/thank-you");
    fetch("/api/order", { method: "GET", cache: "no-store" }).catch(() => undefined);
  }, [router]);

  const update = (key: keyof Fields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (fields.fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (!/^(?:\+977[- ]?)?9[678]\d{8}$/.test(fields.phone.trim())) next.phone = "Enter a valid Nepali mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = "Enter a valid email address.";
    if (fields.location.trim().length < 5) next.location = "Kindly share your exact location.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.type === "loading" || !validate()) return;
    if (!requestId.current) requestId.current = crypto.randomUUID();
    setStatus({ type: "loading" });
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: requestId.current, ...fields, deliveryArea, productName: product.name, imageIndex: selectedImageIndex, quantity, size }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "We could not submit your order. Please try again.");
      const query = new URLSearchParams({ orderId: result.order.orderId, product: product.name, qty: String(quantity), total: String(result.order.totalPrice) });
      router.push(`/thank-you?${query.toString()}`);
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Something went wrong. Please try again." });
    }
  }

  return (
    <main className="min-h-screen bg-bone">
      <div className="shell flex flex-col items-start gap-4 pb-2 pt-6 sm:pt-8">
        <Link href="/" aria-label="Sneakers Nepal home" className="block w-44 sm:w-52">
          <Image
            src="/brand/sneakers-nepal-logo-new.png"
            alt="Sneakers Nepal"
            width={2172}
            height={724}
            sizes="(max-width: 639px) 176px, 208px"
            className="h-auto w-full"
            priority
            unoptimized
          />
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-black/55 hover:text-ink"><ArrowLeft size={16} /> Back to product</Link>
      </div>
      <div className="shell grid gap-6 pb-16 pt-4 sm:gap-8 sm:pb-20 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
        <section className="rounded-4xl bg-white p-5 shadow-lift sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-cobalt">SECURE CHECKOUT</p><h1 className="display-font mt-2 text-4xl uppercase min-[390px]:text-5xl sm:text-6xl">Where should<br />we deliver?</h1></div><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-volt"><LockKeyhole size={20} /></div></div>
          <p className="mt-5 max-w-xl leading-7 text-black/50">No payment is required now. We’ll call to confirm your order before dispatch.</p>

          <form onSubmit={submit} noValidate className="mt-9 space-y-5">
            <Field label="Full Name" error={errors.fullName} icon={<UserRound size={17} />}><input className="field" value={fields.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" autoComplete="name" /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone Number" error={errors.phone} icon={<Phone size={17} />}><input className="field" value={fields.phone} onChange={(e) => update("phone", e.target.value)} placeholder="98XXXXXXXX" inputMode="tel" autoComplete="tel" /></Field>
              <Field label="Email Address" error={errors.email} icon={<Mail size={17} />}><input className="field" value={fields.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" /></Field>
            </div>
            <Field label="Exact Location" error={errors.location} icon={<MapPin size={17} />}><textarea className="field min-h-28 resize-y" value={fields.location} onChange={(e) => update("location", e.target.value)} placeholder="Kindly share your exact location" autoComplete="street-address" /></Field>
            <div><label className="label">Delivery Area</label><div className="mt-2 grid gap-3 sm:grid-cols-2">{(["inside", "outside"] as DeliveryArea[]).map((area) => <button key={area} type="button" onClick={() => setDeliveryArea(area)} className={`min-h-20 rounded-2xl border p-4 text-left transition ${deliveryArea === area ? "border-cobalt bg-cobalt/5 ring-4 ring-cobalt/10" : "border-black/10 hover:border-black/30"}`}><span className="block text-base font-black">{area === "inside" ? "Inside Kathmandu Valley" : "Outside Kathmandu Valley"}</span><span className="mt-1 block text-sm text-black/45">Delivery {formatNpr(area === "inside" ? 100 : 200)}</span></button>)}</div></div>

            {status.type === "error" && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{status.message}</div>}
            <button type="submit" disabled={status.type === "loading"} aria-live="polite" className="btn-primary w-full transition-all duration-300 disabled:cursor-wait disabled:opacity-80">{status.type === "loading" ? <><Loader2 className="animate-spin" size={18} /> Securing your order...</> : <>Order Now — {formatNpr(pricing.total)}</>}</button>
            <div className={`grid transition-all duration-300 ${status.type === "loading" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-hidden={status.type !== "loading"}>
              <div className="overflow-hidden"><p className="order-saving-message flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-center text-sm font-semibold"><CheckCircle2 size={17} className="shrink-0" /> Saving your order securely. Your confirmation page is next.</p></div>
            </div>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-black/40"><ShieldCheck size={14} /> Your details are used only to process this order.</p>
          </form>
        </section>

        <aside className="rounded-4xl bg-ink p-5 text-white sm:p-8 lg:sticky lg:top-6">
          <p className="eyebrow text-volt">YOUR ORDER</p>
          <div className="mt-5 flex gap-5"><div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg"><Image src={selectedImage} alt={`${product.name} ${product.colorways[selectedImageIndex]}`} fill unoptimized sizes="128px" className="object-contain" priority /></div><div className="pt-2"><h2 className="text-xl font-black">{product.name}</h2><p className="mt-1 text-sm font-semibold text-volt">{product.colorways[selectedImageIndex]}</p><p className="mt-2 text-sm text-white/50">EU Size {size} · Qty {quantity}</p><p className="mt-4 text-sm font-bold">{formatNpr(product.price)} / pair</p></div></div>
          <div className="mt-6">
            <div className="flex items-center justify-between gap-4"><p className="text-sm font-black uppercase tracking-wider">Choose colorway</p><p className="text-xs text-white/45">{selectedImageIndex + 1} of {product.images.length}</p></div>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`Select ${product.colorways[index]} colorway`}
                  aria-pressed={selectedImageIndex === index}
                  title={product.colorways[index]}
                  className={`group relative aspect-square overflow-hidden rounded-xl bg-white transition focus:outline-none focus:ring-4 focus:ring-volt/30 ${selectedImageIndex === index ? "ring-2 ring-volt" : "opacity-75 ring-1 ring-white/15 hover:opacity-100"}`}
                >
                  <Image src={image} alt="" fill unoptimized sizes="72px" className="object-contain p-1 transition-transform group-hover:scale-105" />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-7 space-y-3 border-y border-white/10 py-6 text-sm"><div className="flex justify-between text-white/60"><span>Subtotal</span><span>{formatNpr(pricing.subtotal)}</span></div><div className="flex justify-between text-white/60"><span>Delivery</span><span>{formatNpr(pricing.deliveryFee)}</span></div><div className="flex justify-between pt-2 text-xl font-black"><span>Total</span><span className="text-volt">{formatNpr(pricing.total)}</span></div></div>
          <div className="mt-6 space-y-3 text-sm text-white/60"><p className="flex gap-3"><CheckCircle2 className="shrink-0 text-volt" size={18} /> Cash on Delivery</p><p className="flex gap-3"><CheckCircle2 className="shrink-0 text-volt" size={18} /> Confirmation call before dispatch</p><p className="flex gap-3"><CheckCircle2 className="shrink-0 text-volt" size={18} /> Order confirmation by email</p></div>
        </aside>
      </div>
    </main>
  );
}

function Field({ label, error, icon, children }: { label: string; error?: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div><label className="label flex items-center gap-2">{icon}{label}</label>{children}{error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}</div>;
}
