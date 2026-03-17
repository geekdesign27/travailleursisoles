// Google Sheets API v4 service — uses fetch, no gapi dependency

import type { Analysis } from "@/types/analysis.schema";
import {
  getHeaderRow,
  analysisToSheetRow,
  sheetRowToAnalysis,
} from "./sheetsMapper";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

const TAB_NAMES = [
  "Analyses",
  "Config",
  "Taxonomies",
  "Zones_Textes",
  "Travailleurs_Reg",
] as const;

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function sheetsRequest<T>(
  url: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erreur Google Sheets (${response.status}) : ${body}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Creates the 5-tab structure in the spreadsheet.
 * Safe to call multiple times — checks existing tabs first.
 */
export async function createSpreadsheetStructure(
  token: string,
  spreadsheetId: string,
): Promise<void> {
  // Get existing sheets
  const metadata = await sheetsRequest<{
    sheets: Array<{ properties: { title: string } }>;
  }>(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties.title`, token);

  const existingTabs = new Set(metadata.sheets.map((s) => s.properties.title));

  const requests: Array<Record<string, unknown>> = [];

  for (const tabName of TAB_NAMES) {
    if (!existingTabs.has(tabName)) {
      requests.push({
        addSheet: {
          properties: { title: tabName },
        },
      });
    }
  }

  if (requests.length > 0) {
    await sheetsRequest(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, token, {
      method: "POST",
      body: JSON.stringify({ requests }),
    });
  }

  // Ensure header row exists in Analyses tab
  const headerRange = "Analyses!A1:AY1";
  const headerData = await sheetsRequest<{
    values?: string[][];
  }>(`${SHEETS_API}/${spreadsheetId}/values/${headerRange}`, token);

  if (!headerData.values || headerData.values.length === 0) {
    await sheetsRequest(
      `${SHEETS_API}/${spreadsheetId}/values/${headerRange}?valueInputOption=RAW`,
      token,
      {
        method: "PUT",
        body: JSON.stringify({
          range: headerRange,
          majorDimension: "ROWS",
          values: [getHeaderRow()],
        }),
      },
    );
  }
}

/**
 * Writes or updates a single analysis row in the Analyses sheet.
 */
export async function syncAnalysis(
  token: string,
  spreadsheetId: string,
  analysis: Analysis,
): Promise<void> {
  // Find existing row by ID
  const existingData = await sheetsRequest<{
    values?: string[][];
  }>(`${SHEETS_API}/${spreadsheetId}/values/Analyses!A:A`, token);

  const rows = existingData.values ?? [];
  let rowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i]?.[0] === analysis.id) {
      rowIndex = i + 1; // 1-based
      break;
    }
  }

  const rowData = analysisToSheetRow(analysis);

  if (rowIndex > 0) {
    // Update existing row
    const range = `Analyses!A${rowIndex}:AY${rowIndex}`;
    await sheetsRequest(
      `${SHEETS_API}/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
      token,
      {
        method: "PUT",
        body: JSON.stringify({
          range,
          majorDimension: "ROWS",
          values: [rowData],
        }),
      },
    );
  } else {
    // Append new row
    await sheetsRequest(
      `${SHEETS_API}/${spreadsheetId}/values/Analyses!A:AY:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      token,
      {
        method: "POST",
        body: JSON.stringify({
          majorDimension: "ROWS",
          values: [rowData],
        }),
      },
    );
  }
}

/**
 * Reads all analyses from the Analyses sheet.
 */
export async function fetchAnalyses(
  token: string,
  spreadsheetId: string,
): Promise<Analysis[]> {
  const data = await sheetsRequest<{
    values?: string[][];
  }>(`${SHEETS_API}/${spreadsheetId}/values/Analyses!A2:AY`, token);

  if (!data.values || data.values.length === 0) return [];

  return data.values
    .filter((row) => row[0]) // Skip empty rows
    .map(sheetRowToAnalysis);
}

/**
 * Extracts a spreadsheet ID from a URL or returns the input if already an ID.
 */
export function parseSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();

  // Already an ID (alphanumeric + hyphens + underscores, ~44 chars)
  if (/^[\w-]{20,}$/.test(trimmed)) return trimmed;

  // Extract from URL
  const match = trimmed.match(/\/spreadsheets\/d\/([\w-]+)/);
  return match?.[1] ?? null;
}
