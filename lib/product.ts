export const product = {
  name: "Air Jordan 4",
  slug: "air-jordan-4",
  price: 6499,
  compareAtPrice: 7500,
  currency: "NPR",
  description:
    "The unmistakable AJ4 silhouette—bold panels, breathable mesh and cushioned everyday comfort for a street-ready finish.",
  sizes: [39, 40, 41, 42, 43, 44],
  images: [
    "/products/aj4-white-cement-hq.png",
    "/products/aj4-triple-black-hq.png",
    "/products/aj4-tour-yellow-hq.png",
    "/products/aj4-black-red-hq.png",
    "/products/aj4-midnight-navy-hq.png",
    "/products/aj4-red-metallic-hq.png",
    "/products/aj4-sail-cream-hq.png",
    "/products/aj4-white-black-hq.png",
    "/products/aj4-metallic-green-hq.png",
    "/products/aj4-industrial-blue-hq.png",
    "/products/aj4-ice-blue-hq.png",
    "/products/aj4-pure-white-hq.png",
    "/products/aj4-pink-cream-hq.png",
  ],
  colorways: [
    "White Cement",
    "Triple Black",
    "Tour Yellow",
    "Black Red",
    "Midnight Navy",
    "Red Metallic",
    "Sail Cream",
    "White Black",
    "Metallic Green",
    "Industrial Blue",
    "Ice Blue",
    "Pure White",
    "Pink Cream",
  ],
  benefits: [
    "Cushioned sole for all-day comfort",
    "Breathable mesh panels",
    "Supportive lace-wing construction",
    "Durable, grippy rubber outsole",
  ],
} as const;

export function getProductSelection(imageIndex: number) {
  const safeIndex = Number.isInteger(imageIndex) && imageIndex >= 0 && imageIndex < product.images.length ? imageIndex : 0;
  return {
    imageIndex: safeIndex,
    image: product.images[safeIndex],
    colorway: product.colorways[safeIndex],
  };
}

export const deliveryFees = {
  inside: 100,
  outside: 200,
} as const;

export type DeliveryArea = keyof typeof deliveryFees;

export function formatNpr(amount: number) {
  return `Rs ${new Intl.NumberFormat("en-IN").format(amount)}`;
}

export function calculateOrderTotal(quantity: number, area: DeliveryArea) {
  const subtotal = product.price * quantity;
  const deliveryFee = deliveryFees[area];
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
