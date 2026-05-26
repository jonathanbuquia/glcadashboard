import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const totalsWorkbookPath = path.join('data', 'main-excel', 'Sample Dashboard.xlsx');
const paymentsAndBalancesWorkbookPath = path.join('data', 'main-excel', 'Sample Dataset 2.xlsx');
const outputPath = path.join('src', 'data', 'paymentData.json');
const sheets = {
  totals: {
    sheetName: 'Totals',
    workbookPath: totalsWorkbookPath,
  },
  paymentsAndBalances: {
    sheetName: 'Payments & Balances',
    workbookPath: paymentsAndBalancesWorkbookPath,
  },
};

function toCamelCase(value) {
  const parts = String(value ?? '')
    .trim()
    .replace(/[^0-9a-zA-Z]+/g, ' ')
    .split(' ')
    .filter(Boolean);

  if (parts.length === 0) {
    return 'column';
  }

  const [first, ...rest] = parts;
  const key =
    first.charAt(0).toLowerCase() +
    first.slice(1) +
    rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');

  return /^\d/.test(key) ? `field${key.charAt(0).toUpperCase()}${key.slice(1)}` : key;
}

function uniqueHeaders(headers) {
  const seen = new Map();

  return headers.map((header) => {
    const base = toCamelCase(header);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    return count === 0 ? base : `${base}${count + 1}`;
  });
}

function toJsonValue(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return value;
}

function trimEmptyCells(row) {
  const cells = [...row];

  while (cells.length > 0 && cells.at(-1) == null) {
    cells.pop();
  }

  return cells;
}

function isStudentTotalRow(row) {
  const [yearLevel, code, name, scheme] = row;

  return [yearLevel, code, name, scheme].every(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
}

function sheetToRows(sheetKey, sheetName, sheet) {
  const rawRows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  });
  const [headerRow, ...bodyRows] = rawRows.map(trimEmptyCells);
  const headers = headerRow ?? [];
  const keys = uniqueHeaders(headers);
  const rows = bodyRows
    .map((row) => row.slice(0, keys.length))
    .filter((row) => sheetKey !== 'totals' || isStudentTotalRow(row))
    .filter((row) => row.some((cell) => cell != null))
    .map((row) =>
      Object.fromEntries(
        keys
          .map((key, index) => [key, toJsonValue(row[index])])
          .filter(([, value]) => value != null),
      ),
    );

  return {
    sheetName,
    headers: keys.map((key, index) => ({ key, label: headers[index] })),
    rows,
  };
}

for (const { workbookPath } of Object.values(sheets)) {
  if (!fs.existsSync(workbookPath)) {
    console.error(`Workbook not found: ${workbookPath}`);
    process.exit(1);
  }
}

const workbookCache = new Map();

function getWorkbook(workbookPath) {
  if (!workbookCache.has(workbookPath)) {
    workbookCache.set(workbookPath, XLSX.readFile(workbookPath, { cellDates: true }));
  }

  return workbookCache.get(workbookPath);
}

const data = {
  sourceWorkbook: `Totals: ${path.basename(totalsWorkbookPath)}; Payments & Balances: ${path.basename(
    paymentsAndBalancesWorkbookPath,
  )}`,
  sheets: Object.fromEntries(
    Object.entries(sheets).map(([key, { sheetName, workbookPath }]) => {
      const workbook = getWorkbook(workbookPath);
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        throw new Error(`Sheet not found: ${sheetName} in ${workbookPath}`);
      }

      return [key, sheetToRows(key, sheetName, sheet)];
    }),
  ),
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);

console.log(`Exported ${outputPath}`);
