import { google } from "googleapis";
import { env } from "../config/env";
import type { Lead } from "../types";

const SHEET_NAME = "Leads";
const HEADER_ROW = ["Nome", "Telefone", "Mensagem", "Recebido em", "Status"];

function getAuth() {
  return new google.auth.JWT({
    email: env.google.serviceAccountEmail,
    key: env.google.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function ensureSheet(sheets: ReturnType<typeof google.sheets>): Promise<void> {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: env.google.sheetId });
  const exists = spreadsheet.data.sheets?.some(s => s.properties?.title === SHEET_NAME);

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.google.sheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: env.google.sheetId,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADER_ROW] },
    });
  }
}

export async function appendLead(lead: Lead): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  await ensureSheet(sheets);

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.google.sheetId,
    range: `${SHEET_NAME}!A:E`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[lead.name, lead.phone, lead.message, lead.receivedAt, "Novo"]],
    },
  });
}
