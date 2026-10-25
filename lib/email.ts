import nodemailer, { type Transporter } from "nodemailer";
import type { StoredOrder } from "@/lib/order-schema";
import { formatNpr } from "@/lib/product";

let cachedTransporter: Transporter | null = null;

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function escapeHtml(value: string | number) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

function transporter() {
  if (cachedTransporter) return cachedTransporter;
  const port = Number(required("SMTP_PORT"));
  cachedTransporter = nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port,
    secure: port === 465,
    pool: true,
    maxConnections: 2,
    maxMessages: 100,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    auth: { user: required("SMTP_USER"), pass: required("SMTP_PASS") },
  });
  return cachedTransporter;
}

const row = (label: string, value: string) => `<tr><td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #ececec">${escapeHtml(label)}</td><td align="right" style="padding:10px 0;color:#201a17;font-size:14px;font-weight:700;border-bottom:1px solid #ececec">${escapeHtml(value)}</td></tr>`;

function itemRows(order: StoredOrder) {
  return order.items.map((item, index) => row(
    `Pair ${index + 1}`,
    `${item.colorway} · EU ${item.size} · Qty ${item.quantity} · ${formatNpr(item.lineTotal)}`,
  )).join("");
}

function frame(brand: string, preheader: string, content: string) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>${escapeHtml(preheader)}</title></head><body style="margin:0;background:#f7f2e9;font-family:Arial,sans-serif;color:#201a17"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2e9"><tr><td align="center" style="padding:30px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:24px;overflow:hidden"><tr><td style="padding:24px 30px;background:#201a17;color:#fff"><table role="presentation" width="100%"><tr><td style="font-size:16px;font-weight:900;letter-spacing:2px">${escapeHtml(brand)}</td><td align="right"><span style="display:inline-block;background:#e5b95c;color:#201a17;border-radius:999px;padding:8px 12px;font-size:10px;font-weight:900;letter-spacing:1px">CASH ON DELIVERY</span></td></tr></table></td></tr><tr><td style="padding:34px 30px">${content}</td></tr><tr><td style="padding:20px 30px;background:#f7f2e9;color:#777;font-size:12px;line-height:18px">This transactional email was sent by ${escapeHtml(brand)} regarding a Cash on Delivery order.</td></tr></table></td></tr></table></body></html>`;
}

export async function sendBusinessOrderEmail(order: StoredOrder) {
  const brand = process.env.BRAND_NAME?.trim() || "SNEAKERS NEPAL";
  const html = frame(brand, `New order ${order.orderId}`, `
    <p style="margin:0 0 8px;color:#a45438;font-size:11px;font-weight:900;letter-spacing:2px">NEW ORDER</p>
    <h1 style="margin:0;font-size:30px;line-height:38px">A new product order has arrived.</h1>
    <p style="margin:12px 0 26px;color:#6b7280;line-height:24px">Order <strong style="color:#201a17">${escapeHtml(order.orderId)}</strong> · ${escapeHtml(order.createdAt)}</p>
    <div style="margin:0 0 24px;padding:18px;background:#faf1e4;border-left:4px solid #a45438;border-radius:12px;font-weight:700;line-height:22px">Please call the customer soon to confirm this order.</div>
    <h2 style="margin:26px 0 8px;font-size:16px">Customer details</h2><table role="presentation" width="100%">${row("Customer Name", order.fullName)}${row("Phone Number", order.phone)}${row("Email Address", order.email)}${row("Exact Location", order.location)}</table>
    <h2 style="margin:30px 0 8px;font-size:16px">Product details</h2><table role="presentation" width="100%">${row("Product Name", order.productName)}${itemRows(order)}${row("Total Pairs", String(order.quantity))}${row("Price Per Pair", formatNpr(order.pricePerPiece))}${row("Delivery Fee", formatNpr(order.deliveryFee))}${row("Total Price", formatNpr(order.totalPrice))}</table>
    <h2 style="margin:30px 0 8px;font-size:16px">Payment details</h2><table role="presentation" width="100%">${row("Payment Method", order.paymentMethod)}${row("Order Status", order.orderStatus)}</table>
    <div style="margin-top:22px"><span style="display:inline-block;background:#e5b95c;border-radius:999px;padding:9px 13px;font-size:11px;font-weight:900">NEW ORDER</span></div>`);
  await transporter().sendMail({
    from: `${brand} <${required("EMAIL_FROM")}>`,
    replyTo: order.email,
    to: required("BUSINESS_EMAIL"),
    subject: `New Product Order Received - ${order.orderId}`,
    html,
  });
}

export async function sendCustomerOrderEmail(order: StoredOrder) {
  const brand = process.env.BRAND_NAME?.trim() || "SNEAKERS NEPAL";
  const support = required("EMAIL_FROM");
  const html = frame(brand, `We received your order ${order.orderId}`, `
    <p style="margin:0 0 8px;color:#a45438;font-size:11px;font-weight:900;letter-spacing:2px">ORDER RECEIVED</p>
    <h1 style="margin:0;font-size:30px;line-height:38px">Thank you, ${escapeHtml(order.fullName)}!</h1>
    <p style="margin:14px 0 26px;color:#6b7280;line-height:24px">We have received your order successfully. Our sales representative will call you soon to confirm your order.</p>
    <div style="padding:20px;background:#f7f7f4;border-radius:16px"><table role="presentation" width="100%">${row("Order ID", order.orderId)}${row("Product", order.productName)}${itemRows(order)}${row("Total Pairs", String(order.quantity))}${row("Total Price", formatNpr(order.totalPrice))}${row("Payment Method", order.paymentMethod)}</table></div>
    <p style="margin:26px 0 0;color:#6b7280;line-height:24px">Need help? Reply to this email or contact <a href="mailto:${escapeHtml(support)}" style="color:#a45438;font-weight:700">${escapeHtml(support)}</a>.</p>
    <p style="margin:20px 0 0;line-height:24px">Thank you,<br><strong>${escapeHtml(brand)}</strong></p>`);
  await transporter().sendMail({
    from: `${brand} <${support}>`,
    replyTo: support,
    to: order.email,
    subject: `Your Order Has Been Received - ${brand}`,
    html,
  });
}
