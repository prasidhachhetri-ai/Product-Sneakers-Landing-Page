"use client";

import { useEffect, useState } from "react";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";

export function ProductShop() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetch("/api/order", { method: "GET", cache: "no-store" }).catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ProductGallery active={selectedImageIndex} onActiveChange={setSelectedImageIndex} />
      <ProductPurchase selectedImageIndex={selectedImageIndex} />
    </div>
  );
}
