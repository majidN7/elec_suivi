import Papa from "papaparse";
import ExcelJS from "exceljs";

export type ParsedRow = Record<string, string>;

export async function parseSpreadsheet(
  file: File,
): Promise<{ rows: ParsedRow[]; error?: string }> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".csv")) {
    const text = buffer.toString("utf-8");
    const result = Papa.parse<ParsedRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
      transform: (v: string) => v.trim(),
    });
    if (result.errors.length > 0) {
      return { rows: [], error: result.errors[0].message };
    }
    return { rows: result.data };
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const workbook = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return { rows: [], error: "Feuille de calcul vide" };
    }

    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[colNumber] = String(cell.value ?? "").trim();
    });

    const rows: ParsedRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowData: ParsedRow = {};
      let hasValue = false;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber];
        if (!header) return;
        const value = cell.value;
        const strValue =
          value === null || value === undefined ? "" : String(value).trim();
        if (strValue) hasValue = true;
        rowData[header] = strValue;
      });
      if (hasValue) rows.push(rowData);
    });

    return { rows };
  }

  return { rows: [], error: "Format de fichier non supporté (utilisez .csv ou .xlsx)" };
}
