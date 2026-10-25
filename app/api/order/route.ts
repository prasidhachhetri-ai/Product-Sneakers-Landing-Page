import { after, NextRequest, NextResponse } from "next/server";
import { orderSchema, StoredOrder } from "@/lib/order-schema";
import { calculateOrderTotal, getProductSelection, product } from "@/lib/product";
import { findOrCreateSheetOrder, updateNotificationState, warmOrderSheet } from "@/lib/google-sheets";
import { sendBusinessOrderEmail, sendCustomerOrderEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function allowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configured = [process.env.FRONTEND_URL, process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean).map((url) => {
    try { return new URL(url as string).origin; } catch { return ""; }
  });
  if (configured.length === 0 && process.env.NODE_ENV !== "production") return true;
  return configured.includes(origin);
}

function makeOrderId() {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `SN-${day}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function kathmanduDate() {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kathmandu", dateStyle: "medium", timeStyle: "short" }).format(new Date());
}

async function withRetry(task: () => Promise<void>, attempts = 2) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await task();
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }
  }
  throw lastError;
}

async function deliverOrderNotifications(sheetOrder: Awaited<ReturnType<typeof findOrCreateSheetOrder>>) {
  const state = { ...sheetOrder.notifications };
  const [ownerResult, customerResult] = await Promise.allSettled([
    state.ownerEmailSent ? Promise.resolve() : withRetry(() => sendBusinessOrderEmail(sheetOrder.order)),
    state.customerEmailSent ? Promise.resolve() : withRetry(() => sendCustomerOrderEmail(sheetOrder.order)),
  ]);

  if (ownerResult.status === "fulfilled") state.ownerEmailSent = true;
  if (customerResult.status === "fulfilled") state.customerEmailSent = true;
  await updateNotificationState(sheetOrder.row, sheetOrder.order, state);

  if (ownerResult.status === "rejected" || customerResult.status === "rejected") {
    console.error("Order notification delivery incomplete", {
      orderId: sheetOrder.order.orderId,
      ownerEmailSent: state.ownerEmailSent,
      customerEmailSent: state.customerEmailSent,
    });
  }
}

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request)) return NextResponse.json({ success: false, error: "Request origin is not allowed." }, { status: 403 });
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || "Please check your order details.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const input = parsed.data;
    const items = input.items.map((item) => {
      const selection = getProductSelection(item.imageIndex);
      return { ...item, colorway: selection.colorway, productImage: selection.image, lineTotal: item.quantity * product.price };
    });
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const pricing = calculateOrderTotal(quantity, input.deliveryArea);
    const order: StoredOrder = {
      ...input,
      items,
      orderId: makeOrderId(),
      createdAt: kathmanduDate(),
      quantity,
      pricePerPiece: product.price,
      deliveryFee: pricing.deliveryFee,
      totalPrice: pricing.total,
      paymentMethod: "Cash On Delivery",
      orderStatus: "New Order",
      colorway: items.map((item) => item.colorway).join(", "),
      size: items.map((item) => `EU ${item.size}`).join(", "),
      productImage: items[0].productImage,
    };

    const sheetOrder = await findOrCreateSheetOrder(order);
    after(async () => {
      try {
        await deliverOrderNotifications(sheetOrder);
      } catch (error) {
        console.error("Post-response order notification task failed", { orderId: sheetOrder.order.orderId, error });
      }
    });

    return NextResponse.json({ success: true, order: { orderId: sheetOrder.order.orderId, totalPrice: sheetOrder.order.totalPrice } });
  } catch (error) {
    console.error("Order submission failed", error);
    const message = error instanceof Error ? error.message : "Unknown order error";
    const configurationError = message.startsWith("Missing required environment variable") || message.includes("Sheet tab") || message.includes("unexpected columns");
    return NextResponse.json({ success: false, error: configurationError ? "Ordering is not configured yet. Please contact the store." : "We could not save your order. Please try again; your request reference will prevent a duplicate row." }, { status: configurationError ? 503 : 502 });
  }
}

export async function GET() {
  try {
    await warmOrderSheet();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order service warm-up failed", error);
    return NextResponse.json({ success: false }, { status: 503 });
  }
}
