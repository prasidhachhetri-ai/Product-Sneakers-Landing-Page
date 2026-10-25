"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Minus, Plus } from "lucide-react";
import { formatNpr, product } from "@/lib/product";

export function ProductPurchase({ selectedImageIndex }: { selectedImageIndex: number }) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<number>(41);
  const checkoutUrl = useMemo(() => `/checkout?qty=${quantity}&size=${size}&image=${selectedImageIndex}`, [quantity, size, selectedImageIndex]);

  return (
    <div className="flex h-full flex-col justify-center rounded-4xl border border-ink/5 bg-white p-6 shadow-lift sm:p-8 lg:p-10">
      <p className="eyebrow text-cobalt">THE ICON, REWORKED</p>
      <h2 className="display-font mt-3 text-5xl uppercase leading-none sm:text-7xl">Air Jordan 4</h2>
      <p className="mt-5 max-w-xl text-base leading-7 text-black/60 sm:text-lg sm:leading-8">{product.description}</p>

      <div className="mt-7 flex items-end gap-3 border-y border-black/10 py-5">
        <span className="text-4xl font-black">{formatNpr(product.price)}</span>
        <span className="pb-1 text-base text-black/40 line-through">{formatNpr(product.compareAtPrice)}</span>
        <span className="mb-1 rounded-full bg-volt px-2.5 py-1 text-[11px] font-black uppercase">Launch offer</span>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between"><span className="text-base font-bold">Select size</span><span className="text-sm text-black/45">EU sizing</span></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((item) => <button key={item} onClick={() => setSize(item)} type="button" className={`h-12 min-w-12 rounded-xl border text-base font-bold transition ${size === item ? "border-ink bg-ink text-white shadow-md" : "border-ink/10 hover:border-cobalt hover:text-cobalt"}`}>{item}</button>)}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-bone p-4">
        <div><p className="text-sm font-bold uppercase tracking-widest text-black/40">Quantity</p><p className="mt-1 text-base font-bold">Total: {formatNpr(product.price * quantity)}</p></div>
        <div className="flex items-center gap-4 rounded-full bg-white p-1.5">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-bone"><Minus size={16} /></button>
          <span className="w-5 text-center font-black">{quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(Math.min(10, quantity + 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-bone"><Plus size={16} /></button>
        </div>
      </div>

      <Link href={checkoutUrl} className="btn-primary mt-6 w-full">Buy now <ArrowUpRight size={18} /></Link>
      <div className="mt-5 grid gap-2 text-xs text-black/55 sm:grid-cols-2">
        <span className="flex items-center gap-2"><Check size={14} className="text-cobalt" /> Cash on delivery</span>
        <span className="flex items-center gap-2"><Check size={14} className="text-cobalt" /> Phone confirmation</span>
      </div>
    </div>
  );
}
