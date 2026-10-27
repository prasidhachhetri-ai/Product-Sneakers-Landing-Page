"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { product } from "@/lib/product";

type ProductGalleryProps = {
  active: number;
  onActiveChange: (index: number) => void;
};

export function ProductGallery({ active, onActiveChange }: ProductGalleryProps) {
  const previous = () => onActiveChange((active - 1 + product.images.length) % product.images.length);
  const next = () => onActiveChange((active + 1) % product.images.length);

  return (
    <div className="min-w-0 max-w-full">
      <div className="relative aspect-square overflow-hidden rounded-4xl border border-ink/10 bg-white shadow-lift">
        <Image
          key={product.images[active]}
          src={product.images[active]}
          alt={`${product.name} product view ${active + 1}`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority={active === 0}
        />
        <div className="absolute inset-x-4 bottom-4 flex justify-between">
          <button type="button" onClick={previous} aria-label="Previous product image" className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white shadow-lg transition hover:scale-105 hover:bg-cobalt"><ChevronLeft /></button>
          <button type="button" onClick={next} aria-label="Next product image" className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white shadow-lg transition hover:scale-105 hover:bg-cobalt"><ChevronRight /></button>
        </div>
      </div>
      <div className="mt-3 flex w-full max-w-full snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {product.images.map((image, index) => (
          <button key={image} type="button" onClick={() => onActiveChange(index)} aria-label={`View product image ${index + 1}`} className={`relative aspect-square w-20 shrink-0 snap-start overflow-hidden rounded-2xl border-2 bg-white transition sm:w-24 ${active === index ? "border-cobalt shadow-md" : "border-ink/5 opacity-70 hover:opacity-100"}`}>
            <Image src={image} alt="" fill unoptimized sizes="120px" className="object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}
