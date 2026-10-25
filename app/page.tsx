import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BadgeCheck, Headphones, PackageCheck, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { Faq } from "@/components/faq";
import { ProductShop } from "@/components/product-shop";
import { SiteHeader } from "@/components/site-header";
import { formatNpr, product } from "@/lib/product";

const trust = [
  { icon: PackageCheck, title: "Cash on delivery", copy: "Pay only when your pair arrives." },
  { icon: Truck, title: "Fast Nepal delivery", copy: "Valley and nationwide delivery." },
  { icon: Headphones, title: "Human confirmation", copy: "We call before dispatching." },
  { icon: ShieldCheck, title: "Simple ordering", copy: "Secure, quick and transparent." },
];

const sampleReviews = [
  { name: "Aayush K.", city: "Kathmandu", image: "/testimonials/aayush.png", quote: "The shape looks sharp and the cushioning feels comfortable for long days." },
  { name: "Sujal T.", city: "Pokhara", image: "/testimonials/sujal.png", quote: "Clean colorway, easy to style, and the phone confirmation made ordering simple." },
  { name: "Nisha G.", city: "Lalitpur", image: "/testimonials/nisha.png", quote: "A bold everyday sneaker that works with jeans, cargos and relaxed fits." },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="brand-hero noise relative min-h-screen overflow-hidden text-white">
        <SiteHeader />
        <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-coral/25 blur-[120px]" />
        <div className="absolute bottom-[-180px] left-[10%] h-[460px] w-[460px] rounded-full bg-cobalt/20 blur-[120px]" />
        <div className="shell relative grid min-h-screen items-center gap-8 pb-14 pt-28 sm:gap-10 sm:pb-16 sm:pt-32 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-3"><span className="h-px w-10 bg-volt" /><span className="eyebrow text-volt">1989 ENERGY. TODAY&apos;S ROTATION.</span></div>
            <h1 className="display-font max-w-3xl text-[clamp(4.25rem,12.4vw,9.5rem)] uppercase leading-[.86]"><span className="block">Built to</span><span className="mt-[.06em] block text-volt">stand out.</span></h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/65 sm:text-lg">{product.description} Order now with Cash on Delivery anywhere in Nepal.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/checkout" className="btn-volt">Purchase now <ArrowUpRight size={18} /></Link>
              <Link href="#shop" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-black uppercase tracking-wider hover:bg-white hover:text-ink">Explore the pair <ArrowDown size={17} /></Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-3 text-base sm:gap-4"><span className="text-3xl font-black sm:text-4xl">{formatNpr(product.price)}</span><span className="text-white/35 line-through">{formatNpr(product.compareAtPrice)}</span><span className="rounded-full border border-volt/30 bg-volt/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-volt">Launch offer</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute inset-[12%] rounded-full border border-white/10" />
            <div className="absolute inset-[22%] rounded-full border border-white/10" />
            <div className="relative aspect-square rotate-2 overflow-hidden rounded-[2rem] bg-[#b9b9b7] shadow-2xl ring-1 ring-white/10 sm:rounded-[2.5rem]">
              <Image src="/products/aj4-hero-trio.png" alt="Three Air Jordan 4 colorways on a black background" fill priority unoptimized sizes="(max-width: 1024px) 90vw, 50vw" className="object-cover" />
              <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-ink">Cash on delivery</div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-ink/10 bg-volt py-3 text-ink">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap text-xs font-black uppercase tracking-[.18em]">
          {[...Array(2)].flatMap((_, group) => ["Cash on delivery", "Kathmandu Rs 100", "Outside Valley Rs 200", "Phone confirmation", "Nationwide delivery"].map((item) => <span key={`${group}-${item}`} className="flex items-center gap-8"><Sparkles size={14} />{item}</span>))}
        </div>
      </div>

      <section id="shop" className="brand-cream py-12 sm:py-14 lg:py-16">
        <div className="shell">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow text-cobalt">CHOOSE YOUR PAIR</p><h2 className="display-font mt-2 text-5xl uppercase sm:text-7xl">One icon.<br />Every angle.</h2></div><p className="max-w-md text-base leading-7 text-black/55 sm:text-lg sm:leading-8">Explore available AJ4 colorways, choose your size and quantity, then place your order in under a minute.</p></div>
          <ProductShop />
        </div>
      </section>

      <section id="benefits" className="bg-white py-12 sm:py-14 lg:py-16">
        <div className="shell">
          <div className="grid items-start gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-12">
            <div data-testid="benefits-intro"><p className="eyebrow text-cobalt">WHY IT STAYS ICONIC</p><h2 className="display-font mt-3 text-[clamp(3.8rem,9vw,7rem)] uppercase leading-[.88]">Form meets<br /><span className="text-cobalt">function.</span></h2></div>
            <div data-testid="benefits-grid" className="grid gap-px overflow-hidden rounded-4xl bg-black/10 sm:grid-cols-2">
              {product.benefits.map((benefit, index) => <div key={benefit} className="relative flex min-h-56 flex-col justify-center overflow-hidden bg-bone p-7 sm:p-8"><span className={`absolute inset-x-0 top-0 h-1 ${index % 2 === 0 ? "bg-coral" : "bg-cobalt"}`} /><h3 className="text-2xl font-black leading-tight">{benefit}</h3><p className="mt-3 text-base leading-7 text-ink/60">Purposeful details that keep the classic AJ4 silhouette comfortable and easy to wear.</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="bg-ink py-12 text-white sm:py-14 lg:py-16">
        <div className="shell">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(({ icon: Icon, title, copy }, index) => <article key={title} className="flex min-h-64 flex-col justify-center rounded-3xl border border-white/15 bg-white/[.035] p-7 transition hover:-translate-y-1 hover:border-coral/70 hover:bg-white/[.07] sm:p-8"><Icon className={index % 2 === 0 ? "text-volt" : "text-coral"} size={32} strokeWidth={2.2} /><h3 className="mt-8 text-[1.7rem] font-black leading-tight">{title}</h3><p className="mt-3 text-lg leading-8 text-white/65">{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section id="reviews" className="brand-cream py-12 sm:py-14 lg:py-16">
        <div className="shell">
          <h2 className="display-font text-5xl uppercase sm:text-7xl lg:whitespace-nowrap">What customers say.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {sampleReviews.map((review) => <article key={review.name} className="flex flex-col rounded-4xl border border-ink/5 bg-white p-7 shadow-lift sm:p-8"><div className="flex gap-1 text-volt">{[1,2,3,4,5].map((star) => <Star key={star} size={19} fill="currentColor" />)}</div><blockquote className="mt-8 flex-1 text-2xl font-bold leading-9">“{review.quote}”</blockquote><div className="mt-8 flex items-center justify-between gap-3 border-t border-ink/10 pt-6"><div className="flex min-w-0 items-center gap-3"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-bone"><Image src={review.image} alt={`Fictional portrait of ${review.name}`} fill sizes="64px" className="object-cover" /></div><div className="min-w-0"><p className="truncate text-lg font-black">{review.name}</p><p className="mt-1 text-sm text-ink/55">{review.city}</p></div></div><span className="shrink-0 rounded-full bg-coral/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-ink">Sample</span></div></article>)}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-ink py-12 text-white sm:py-14 lg:py-16">
        <div className="shell grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="eyebrow text-volt">GOOD TO KNOW</p>
            <h2 className="display-font mt-3 text-6xl uppercase sm:text-7xl">Questions,<br />answered.</h2>
            <p className="mt-5 max-w-sm leading-7 text-white/55">Everything you need before placing a Cash on Delivery order.</p>

            <div className="relative mt-10 hidden overflow-hidden rounded-[2rem] border border-white/15 bg-white/[.06] p-5 shadow-2xl lg:block">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-coral/25 blur-2xl" />
              <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-cobalt/25 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-volt px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] text-ink"><Sparkles size={13} /> Street icon</span>
                <span className="rotate-3 rounded-full border border-coral/50 bg-coral/15 px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] text-coral">6 sizes</span>
              </div>

              <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-white">
                <div className="absolute inset-[14%] rounded-full border border-dashed border-white/20" />
                <div className="absolute inset-[25%] rounded-full border border-white/10" />
                <Image src="/products/aj4-faq-pair-original.png" alt="Pair of white and cement Air Jordan 4 sneakers" fill unoptimized sizes="360px" className="object-cover object-center" />
                <span className="absolute bottom-5 left-0 rotate-[-5deg] rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] text-ink shadow-xl">Built for the rotation</span>
                <span className="absolute bottom-10 right-0 rotate-6 rounded-full bg-cobalt px-3 py-3 text-center text-[10px] font-black uppercase leading-tight tracking-[.1em] text-white shadow-xl">AJ4<br />Energy</span>
              </div>

              <div className="relative grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs font-bold">
                <span className="flex items-center gap-2 text-white/70"><Truck size={16} className="text-coral" /> Nationwide delivery</span>
                <span className="flex items-center gap-2 text-white/70"><ShieldCheck size={16} className="text-volt" /> Cash on delivery</span>
              </div>
            </div>
          </div>
          <Faq />
        </div>
      </section>

      <section className="relative overflow-hidden bg-cobalt py-12 text-white sm:py-14 lg:py-16">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-volt/25 blur-3xl" />
        <div className="absolute inset-y-0 right-0 hidden w-1/2 opacity-35 lg:block"><Image src="/products/aj4-cta-blue-pair.png" alt="" fill unoptimized sizes="50vw" className="object-cover object-center mix-blend-luminosity" /></div>
        <div className="shell relative"><BadgeCheck className="text-volt" size={42} /><p className="eyebrow mt-8 text-volt">READY WHEN YOU ARE</p><h2 className="display-font mt-3 max-w-4xl text-6xl uppercase leading-[.86] sm:text-8xl">Your next pair is one click away.</h2><p className="mt-6 max-w-lg text-lg leading-7 text-white/70">No online payment. Place your order now and pay when it reaches your door.</p></div>
      </section>

      <footer className="bg-ink py-8 text-white"><div className="shell flex flex-col gap-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><div className="w-48"><Image src="/brand/sneakers-nepal-logo-new.png" alt="Sneakers Nepal" width={2172} height={724} unoptimized sizes="192px" className="h-auto w-full" /></div><p>© {new Date().getFullYear()} Sneakers Nepal. Cash on Delivery across Nepal.</p><p>Support: prasidhachhetri@gmail.com</p></div></footer>
    </main>
  );
}
