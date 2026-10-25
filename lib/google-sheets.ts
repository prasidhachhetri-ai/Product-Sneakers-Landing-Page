import { google, sheets_v4 } from "googleapis";
import type { StoredOrder } from "@/lib/order-schema";
const BASE_HEADERS = [
  "Order ID", "Date & Time", "Customer Name", "Phone Number", "Email Address",
  "Exact Location", "Product Name", "Quantity", "Price Per Piece", "Total Price",
  "Payment Method", "Order Status", "Notes",
];

const DETAIL_HEADERS = [
  "Size (EU)", "Delivery Area", "Delivery Fee", "Owner Email", "Customer Email", "Request Reference",
];

const HEADERS = [...BASE_HEADERS, ...DETAIL_HEADERS];
const STATUS_VALUES = ["New Order", "Order Confirmed", "Order Ongoing", "Delivered", "Cancelled"];

type NotificationState = { ownerEmailSent: boolean; customerEmailSent: boolean };
export type SheetOrder = { row: number; order: StoredOrder; notifications: NotificationState };
let sheetStructurePromise: Promise<void> | null = null;
let sheetsClientPromise: Promise<sheets_v4.Sheets> | null = null;

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

function parseNotificationState(ownerState: string, customerState: string, legacyNotes: string): NotificationState {
  return {
    ownerEmailSent: ownerState === "Sent" || /ownerEmail=sent/.test(legacyNotes),
    customerEmailSent: customerState === "Sent" || /customerEmail=sent/.test(legacyNotes),
  };
}

function color(hex: string) {
  const value = hex.replace("#", "");
  return {
    red: parseInt(value.slice(0, 2), 16) / 255,
    green: parseInt(value.slice(2, 4), 16) / 255,
    blue: parseInt(value.slice(4, 6), 16) / 255,
  };
}

function columnWidth(sheetId: number, startIndex: number, endIndex: number, pixelSize: number): sheets_v4.Schema$Request {
  return {
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex, endIndex },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  };
}

async function client() {
  if (!sheetsClientPromise) {
    sheetsClientPromise = Promise.resolve().then(() => {
      const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
      const credentialFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE?.trim();
      const auth = credentialFile
        ? new google.auth.GoogleAuth({ keyFile: credentialFile, scopes })
        : new google.auth.JWT({
            email: required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
            key: required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
            scopes,
          });
      return google.sheets({ version: "v4", auth });
    }).catch((error) => {
      sheetsClientPromise = null;
      throw error;
    });
  }
  return sheetsClientPromise;
}

async function ensureSheetStructure(sheets: sheets_v4.Sheets, spreadsheetId: string, tabName: string) {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties,basicFilter,bandedRanges,conditionalFormats)",
  });
  let sheet = metadata.data.sheets?.find((item) => item.properties?.title === tabName);
  let sheetId = sheet?.properties?.sheetId;

  if (sheetId === undefined || sheetId === null) {
    const created = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tabName, gridProperties: { frozenRowCount: 1, rowCount: 5000, columnCount: HEADERS.length } } } }] },
    });
    sheetId = created.data.replies?.[0]?.addSheet?.properties?.sheetId;
    if (sheetId === undefined || sheetId === null) throw new Error(`Google Sheet tab "${tabName}" could not be created.`);
    sheet = { properties: { sheetId, title: tabName } };
  }

  const tab = quoteSheetName(tabName);
  const headerResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tab}!A1:S1` });
  const current = headerResponse.data.values?.[0] || [];
  if (current.length > 0 && current.some((header, index) => header !== HEADERS[index])) {
    throw new Error(`Sheet tab "${tabName}" has unexpected columns. Use the headers documented in README.md.`);
  }
  if (current.length < HEADERS.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab}!A1:S1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }

  const alreadyConfigured =
    current.length === HEADERS.length &&
    sheet?.properties?.gridProperties?.frozenRowCount === 1 &&
    sheet?.properties?.gridProperties?.hideGridlines === true &&
    (sheet?.properties?.gridProperties?.rowCount || 0) >= 5000 &&
    Boolean(sheet?.basicFilter) &&
    Boolean(sheet?.bandedRanges?.length) &&
    Boolean(sheet?.conditionalFormats?.some((rule) => rule.ranges?.some((range) => range.startColumnIndex === 11 && range.endColumnIndex === 12)));
  if (alreadyConfigured) return;

  const fullRange = { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: HEADERS.length };
  const rowCount = Math.max(sheet?.properties?.gridProperties?.rowCount || 1000, 5000);
  const requests: sheets_v4.Schema$Request[] = [
    { updateSheetProperties: { properties: { sheetId, tabColor: color("#5E8F83"), gridProperties: { frozenRowCount: 1, rowCount, hideGridlines: true } }, fields: "tabColor,gridProperties.frozenRowCount,gridProperties.rowCount,gridProperties.hideGridlines" } },
    { repeatCell: { range: { ...fullRange, endRowIndex: 1 }, cell: { userEnteredFormat: { backgroundColor: color("#245C57"), textFormat: { foregroundColor: color("#FFFFFF"), bold: true, fontFamily: "Arial", fontSize: 10 }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", wrapStrategy: "WRAP", borders: { left: { style: "SOLID", color: color("#DCE9E5") }, right: { style: "SOLID", color: color("#DCE9E5") }, bottom: { style: "SOLID_THICK", color: color("#D6A44A") } } } }, fields: "userEnteredFormat" } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: 0, endColumnIndex: HEADERS.length }, cell: { userEnteredFormat: { textFormat: { foregroundColor: color("#243634"), fontFamily: "Arial", fontSize: 10 }, verticalAlignment: "MIDDLE" } }, fields: "userEnteredFormat.textFormat,userEnteredFormat.verticalAlignment" } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: 3, endColumnIndex: 4 }, cell: { userEnteredFormat: { numberFormat: { type: "TEXT", pattern: "@" } } }, fields: "userEnteredFormat.numberFormat" } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: 8, endColumnIndex: 10 }, cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "[$Rs] #,##0" }, horizontalAlignment: "RIGHT" } }, fields: "userEnteredFormat.numberFormat,userEnteredFormat.horizontalAlignment" } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: 15, endColumnIndex: 16 }, cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: "[$Rs] #,##0" }, horizontalAlignment: "RIGHT" } }, fields: "userEnteredFormat.numberFormat,userEnteredFormat.horizontalAlignment" } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: 5, endColumnIndex: 7 }, cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "MIDDLE" } }, fields: "userEnteredFormat.wrapStrategy,userEnteredFormat.verticalAlignment" } },
    { repeatCell: { range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: 12, endColumnIndex: 13 }, cell: { userEnteredFormat: { wrapStrategy: "WRAP" } }, fields: "userEnteredFormat.wrapStrategy" } },
    { setDataValidation: { range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: 11, endColumnIndex: 12 }, rule: { condition: { type: "ONE_OF_LIST", values: STATUS_VALUES.map((userEnteredValue) => ({ userEnteredValue })) }, strict: true, showCustomUi: true } } },
    { updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 }, properties: { pixelSize: 42 }, fields: "pixelSize" } },
    { updateDimensionProperties: { range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: 5000 }, properties: { pixelSize: 34 }, fields: "pixelSize" } },
    columnWidth(sheetId, 0, 1, 190), columnWidth(sheetId, 1, 2, 170), columnWidth(sheetId, 2, 3, 180),
    columnWidth(sheetId, 3, 4, 135), columnWidth(sheetId, 4, 5, 220), columnWidth(sheetId, 5, 6, 260),
    columnWidth(sheetId, 6, 7, 170), columnWidth(sheetId, 7, 8, 85), columnWidth(sheetId, 8, 10, 125),
    columnWidth(sheetId, 10, 11, 145), columnWidth(sheetId, 11, 12, 145), columnWidth(sheetId, 12, 13, 180),
    columnWidth(sheetId, 13, 14, 85), columnWidth(sheetId, 14, 15, 160), columnWidth(sheetId, 15, 16, 115),
    columnWidth(sheetId, 16, 18, 120), columnWidth(sheetId, 18, 19, 250),
  ];

  if (!sheet?.basicFilter) requests.push({ setBasicFilter: { filter: { range: fullRange } } });
  if (!sheet?.bandedRanges?.length) {
    requests.push({ addBanding: { bandedRange: { range: { sheetId, startRowIndex: 0, endRowIndex: 5000, startColumnIndex: 0, endColumnIndex: HEADERS.length }, rowProperties: { headerColor: color("#245C57"), firstBandColor: color("#FBFCFA"), secondBandColor: color("#EAF3EF") } } } });
  } else {
    const bandedRangeId = sheet.bandedRanges[0]?.bandedRangeId;
    if (bandedRangeId !== undefined && bandedRangeId !== null) {
      requests.push({ updateBanding: { bandedRange: { bandedRangeId, rowProperties: { headerColor: color("#245C57"), firstBandColor: color("#FBFCFA"), secondBandColor: color("#EAF3EF") } }, fields: "rowProperties" } });
    }
  }

  const hasStatusFormatting = sheet?.conditionalFormats?.some((rule) => rule.ranges?.some((range) => range.startColumnIndex === 11 && range.endColumnIndex === 12));
  if (!hasStatusFormatting) {
    const statuses = [
      ["New Order", "#FFF2CC", "#7F6000"], ["Order Confirmed", "#D9EAF7", "#0B5394"],
      ["Order Ongoing", "#FCE5CD", "#B45F06"], ["Delivered", "#D9EAD3", "#276221"],
      ["Cancelled", "#F4CCCC", "#990000"],
    ];
    const baseIndex = sheet?.conditionalFormats?.length || 0;
    statuses.forEach(([status, background, foreground], index) => requests.push({ addConditionalFormatRule: { index: baseIndex + index, rule: { ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: 11, endColumnIndex: 12 }], booleanRule: { condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: `=$L2="${status}"` }] }, format: { backgroundColor: color(background), textFormat: { foregroundColor: color(foreground), bold: true } } } } } }));
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

function ensureSheetStructureOnce(sheets: sheets_v4.Sheets, spreadsheetId: string, tabName: string) {
  if (!sheetStructurePromise) {
    sheetStructurePromise = ensureSheetStructure(sheets, spreadsheetId, tabName).catch((error) => {
      sheetStructurePromise = null;
      throw error;
    });
  }
  return sheetStructurePromise;
}

export async function warmOrderSheet() {
  const sheets = await client();
  const spreadsheetId = required("GOOGLE_SHEET_ID");
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME?.trim() || "Orders";
  await ensureSheetStructureOnce(sheets, spreadsheetId, tabName);
}

export async function findOrCreateSheetOrder(order: StoredOrder): Promise<SheetOrder> {
  const sheets = await client();
  const spreadsheetId = required("GOOGLE_SHEET_ID");
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME?.trim() || "Orders";
  const tab = quoteSheetName(tabName);
  await ensureSheetStructureOnce(sheets, spreadsheetId, tabName);

  const referenceResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tab}!S2:S` });
  let existingIndex = (referenceResponse.data.values || []).findIndex((row) => String(row[0] || "") === order.requestId);
  if (existingIndex < 0) {
    const notesResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tab}!M2:M` });
    existingIndex = (notesResponse.data.values || []).findIndex((row) => String(row[0] || "").includes(`ref=${order.requestId}`));
  }
  if (existingIndex >= 0) {
    const rowNumber = existingIndex + 2;
    const rowResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tab}!A${rowNumber}:S${rowNumber}` });
    const row = rowResponse.data.values?.[0] || [];
    const existingOrder = { ...order, orderId: String(row[0]), createdAt: String(row[1]) };
    return { row: rowNumber, order: existingOrder, notifications: parseNotificationState(String(row[16] || ""), String(row[17] || ""), String(row[12] || "")) };
  }

  const notifications = { ownerEmailSent: false, customerEmailSent: false };
  const append = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:S`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [[
      order.orderId, order.createdAt, order.fullName, order.phone, order.email, order.location,
      `${order.productName} — ${order.colorway}`, order.quantity, order.pricePerPiece, order.totalPrice,
      order.paymentMethod, order.orderStatus, "",
      order.size, order.deliveryArea === "inside" ? "Inside Kathmandu Valley" : "Outside Kathmandu Valley",
      order.deliveryFee, "Pending", "Pending", order.requestId,
    ]] },
  });
  const updatedRange = append.data.updates?.updatedRange || "";
  const match = updatedRange.match(/!A(\d+):/);
  if (!match) throw new Error("Order was appended, but its sheet row could not be determined.");
  return { row: Number(match[1]), order, notifications };
}

export async function updateNotificationState(row: number, order: StoredOrder, state: NotificationState) {
  const sheets = await client();
  const spreadsheetId = required("GOOGLE_SHEET_ID");
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME?.trim() || "Orders";
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quoteSheetName(tabName)}!Q${row}:S${row}`,
    valueInputOption: "RAW",
    requestBody: { values: [[state.ownerEmailSent ? "Sent" : "Pending", state.customerEmailSent ? "Sent" : "Pending", order.requestId]] },
  });
}
