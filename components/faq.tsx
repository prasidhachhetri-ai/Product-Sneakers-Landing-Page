"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const faqs = [
  ["How does Cash on Delivery work?", "Place your order without paying online. We will call to confirm, then you pay the delivery partner when your order arrives."],
  ["How much is delivery?", "Delivery is Rs 100 inside Kathmandu Valley and Rs 200 outside the Valley."],
  ["How long does delivery take?", "Most Valley orders arrive in 1–3 business days. Outside-Valley orders usually arrive in 3–6 business days, depending on the location."],
  ["How do I choose the right size?", "Choose your usual EU sneaker size. Our team will reconfirm sizing during the order confirmation call."],
  ["Will I receive the exact color shown?", "The selected colorway and size are confirmed by phone before dispatch. Product photos show the available collection."],
  ["Can I exchange the size?", "Please contact us as soon as possible. Exchange eligibility depends on the pair being unused and returned in its original packaging; delivery charges may apply."],
  ["How will I know my order was received?", "You will see a confirmation page and receive an order-received email after the order is recorded successfully."],
] as const;

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-white/15 border-y border-white/15">
      {faqs.map(([question, answer], index) => (
        <div key={question}>
          <button type="button" onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={open === index}>
            <span className="text-lg font-bold sm:text-xl">{question}</span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20">{open === index ? <Minus size={17} /> : <Plus size={17} />}</span>
          </button>
          {open === index && <p className="max-w-3xl pb-6 pr-12 leading-7 text-white/60">{answer}</p>}
        </div>
      ))}
    </div>
  );
}
