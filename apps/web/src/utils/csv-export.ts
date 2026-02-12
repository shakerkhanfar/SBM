import ExcelJS from 'exceljs';

interface ExportOptions {
  columnWidths?: number[];
}

export async function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  options?: ExportOptions,
) {
  if (!data.length) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  const keys = Object.keys(data[0]);
  worksheet.columns = keys.map((key, i) => ({
    header: key,
    key,
    width: options?.columnWidths?.[i] ?? 20,
  }));

  worksheet.getRow(1).font = { bold: true };

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
