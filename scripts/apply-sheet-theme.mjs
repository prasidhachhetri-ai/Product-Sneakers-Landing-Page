import { google } from "googleapis";

const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const tabName = process.env.GOOGLE_SHEET_TAB_NAME || "Orders";
const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
if (!spreadsheetId || !keyFile) throw new Error("Google Sheets environment is incomplete.");

const toColor = (hex) => {
  const value = hex.replace("#", "");
  return {
    red: parseInt(value.slice(0, 2), 16) / 255,
    green: parseInt(value.slice(2, 4), 16) / 255,
    blue: parseInt(value.slice(4, 6), 16) / 255,
  };
};

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });
const metadata = await sheets.spreadsheets.get({
  spreadsheetId,
  fields: "sheets(properties,bandedRanges)",
});
const sheet = metadata.data.sheets?.find((item) => item.properties?.title === tabName);
const sheetId = sheet?.properties?.sheetId;
if (sheetId === undefined || sheetId === null) throw new Error(`Sheet tab "${tabName}" was not found.`);

const requests = [
  {
    updateSheetProperties: {
      properties: { sheetId, tabColor: toColor("#5E8F83"), gridProperties: { hideGridlines: true } },
      fields: "tabColor,gridProperties.hideGridlines",
    },
  },
  {
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 19 },
      cell: {
        userEnteredFormat: {
          backgroundColor: toColor("#245C57"),
          textFormat: { foregroundColor: toColor("#FFFFFF"), bold: true, fontFamily: "Arial", fontSize: 10 },
          horizontalAlignment: "CENTER",
          verticalAlignment: "MIDDLE",
          wrapStrategy: "WRAP",
          borders: {
            left: { style: "SOLID", color: toColor("#DCE9E5") },
            right: { style: "SOLID", color: toColor("#DCE9E5") },
            bottom: { style: "SOLID_THICK", color: toColor("#D6A44A") },
          },
        },
      },
      fields: "userEnteredFormat",
    },
  },
  {
    repeatCell: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 5000, startColumnIndex: 0, endColumnIndex: 19 },
      cell: { userEnteredFormat: { textFormat: { foregroundColor: toColor("#243634"), fontFamily: "Arial", fontSize: 10 } } },
      fields: "userEnteredFormat.textFormat",
    },
  },
];

const bandedRange = sheet.bandedRanges?.[0];
if (bandedRange?.bandedRangeId !== undefined && bandedRange?.bandedRangeId !== null) {
  requests.push({
    updateBanding: {
      bandedRange: {
        bandedRangeId: bandedRange.bandedRangeId,
        rowProperties: {
          headerColor: toColor("#245C57"),
          firstBandColor: toColor("#FBFCFA"),
          secondBandColor: toColor("#EAF3EF"),
        },
      },
      fields: "rowProperties",
    },
  });
}

await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
const verification = await sheets.spreadsheets.get({
  spreadsheetId,
  includeGridData: true,
  ranges: [`'${tabName.replaceAll("'", "''")}'!A1:S3`],
  fields: "sheets(properties(gridProperties(hideGridlines),tabColor),bandedRanges(rowProperties),data(rowData(values(effectiveFormat(backgroundColor,textFormat)))))",
});
const verifiedSheet = verification.data.sheets?.[0];
const headerFormat = verifiedSheet?.data?.[0]?.rowData?.[0]?.values?.[0]?.effectiveFormat;
console.log(JSON.stringify({
  themed: true,
  tab: tabName,
  palette: "deep teal and soft sage",
  gridlinesHidden: verifiedSheet?.properties?.gridProperties?.hideGridlines === true,
  whiteHeaderText: Boolean(headerFormat?.textFormat?.foregroundColor),
  bandedRowsPresent: Boolean(verifiedSheet?.bandedRanges?.length),
}));
