import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 border-b border-white/10 text-white">
      <div className="shell flex h-20 items-center justify-between">
        <Link href="/" className="shrink-0" aria-label="Sneakers Nepal home">
          <span className="block w-40 min-[390px]:w-48 sm:w-52">
            <Image
              src="/brand/sneakers-nepal-logo-new.png"
              alt="Sneakers Nepal"
              width={2172}
              height={724}
              priority
              unoptimized
              sizes="(max-width: 389px) 160px, (max-width: 639px) 192px, 208px"
              className="h-auto w-full"
            />
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-bold uppercase tracking-[0.12em] md:flex" aria-label="Main navigation">
          <Link href="#shop" className="hover:text-volt">Shop</Link>
          <Link href="#benefits" className="hover:text-volt">Why AJ4</Link>
          <Link href="#faq" className="hover:text-volt">FAQ</Link>
        </nav>
        <Link href="/checkout" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-black uppercase tracking-wider backdrop-blur hover:bg-white hover:text-ink">
          <ShoppingBag size={15} /> Order
        </Link>
      </div>
    </header>
  );
}
