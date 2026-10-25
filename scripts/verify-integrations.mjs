import { google } from "googleapis";

const orderId = process.argv[2];
if (!orderId) throw new Error("Pass the test order ID as the first argument.");

const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const tabName = process.env.GOOGLE_SHEET_TAB_NAME || "Orders";
const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
if (!spreadsheetId || !keyFile) throw new Error("Google Sheets environment is incomplete.");

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = google.sheets({ version: "v4", auth });
const quotedTab = `'${tabName.replaceAll("'", "''")}'`;

const [valuesResponse, metadataResponse] = await Promise.all([
  sheets.spreadsheets.values.get({ spreadsheetId, range: `${quotedTab}!A:S` }),
  sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties,basicFilter,bandedRanges,conditionalFormats)",
  }),
]);

const rows = valuesResponse.data.values || [];
const matchingRows = rows.filter((row) => row[0] === orderId);
const row = matchingRows[0] || [];
const sheet = metadataResponse.data.sheets?.find((item) => item.properties?.title === tabName);

console.log(JSON.stringify({
  headerColumns: rows[0]?.length || 0,
  matchingRows: matchingRows.length,
  colorwayRecorded: String(row[6] || "").includes("Metallic Green"),
  ownerEmailStatus: row[16] || "",
  customerEmailStatus: row[17] || "",
  requestReferencePresent: Boolean(row[18]),
  frozenHeaderRows: sheet?.properties?.gridProperties?.frozenRowCount || 0,
  filterEnabled: Boolean(sheet?.basicFilter),
  bandedRanges: sheet?.bandedRanges?.length || 0,
  statusFormatRules: sheet?.conditionalFormats?.length || 0,
}, null, 2));
