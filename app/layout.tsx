import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Air Jordan 4 | Sneakers Nepal",
  description: "Order Air Jordan 4 sneakers in Nepal with Cash on Delivery.",
  icons: {
    icon: "/favicon-v4.png",
    apple: "/favicon-v4.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
