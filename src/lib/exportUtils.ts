import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types/finance';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const exportToExcel = async (
  transactions: Transaction[],
  filename: string = 'transacciones'
) => {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FinanceFlow';
  workbook.created = new Date();

  // Transactions sheet
  const worksheet = workbook.addWorksheet('Transacciones');

  // Define columns
  worksheet.columns = [
    { header: 'Tipo', key: 'tipo', width: 12 },
    { header: 'Descripción', key: 'descripcion', width: 35 },
    { header: 'Categoría', key: 'categoria', width: 18 },
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Estado', key: 'estado', width: 12 },
    { header: 'Monto', key: 'monto', width: 18 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF7C3AED' }, // Purple primary
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add data rows
  transactions.forEach((t) => {
    const row = worksheet.addRow({
      tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
      descripcion: t.description,
      categoria: t.category,
      fecha: formatDate(t.date),
      estado: t.isPending ? 'Pendiente' : 'Pagado',
      monto: t.amount,
    });

    // Color the type and amount cells based on transaction type
    const tipoCell = row.getCell('tipo');
    const montoCell = row.getCell('monto');
    
    if (t.type === 'income') {
      tipoCell.font = { color: { argb: 'FF22C55E' } }; // Green
      montoCell.font = { color: { argb: 'FF22C55E' } };
    } else {
      tipoCell.font = { color: { argb: 'FFEF4444' } }; // Red
      montoCell.font = { color: { argb: 'FFEF4444' } };
    }

    // Format amount as currency
    montoCell.numFmt = '"$"#,##0';
  });

  // Add summary sheet
  const summarySheet = workbook.addWorksheet('Resumen');
  
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingTotal = transactions
    .filter((t) => t.isPending)
    .reduce((sum, t) => sum + t.amount, 0);

  summarySheet.columns = [
    { header: 'Concepto', key: 'concepto', width: 25 },
    { header: 'Monto', key: 'monto', width: 20 },
  ];

  // Style summary header
  const summaryHeaderRow = summarySheet.getRow(1);
  summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summaryHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF7C3AED' },
  };

  // Add summary data
  const incomeRow = summarySheet.addRow({ concepto: 'Total Ingresos', monto: totalIncome });
  incomeRow.getCell('monto').font = { color: { argb: 'FF22C55E' } };
  incomeRow.getCell('monto').numFmt = '"$"#,##0';

  const expenseRow = summarySheet.addRow({ concepto: 'Total Gastos', monto: totalExpenses });
  expenseRow.getCell('monto').font = { color: { argb: 'FFEF4444' } };
  expenseRow.getCell('monto').numFmt = '"$"#,##0';

  const balanceRow = summarySheet.addRow({ concepto: 'Balance Neto', monto: totalIncome - totalExpenses });
  balanceRow.getCell('monto').font = { bold: true };
  balanceRow.getCell('monto').numFmt = '"$"#,##0';

  const pendingRow = summarySheet.addRow({ concepto: 'Pendiente por Pagar', monto: pendingTotal });
  pendingRow.getCell('monto').font = { color: { argb: 'FFF59E0B' } };
  pendingRow.getCell('monto').numFmt = '"$"#,##0';

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (
  transactions: Transaction[],
  filename: string = 'transacciones',
  title: string = 'Reporte de Transacciones'
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 20);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, 14, 28);

  // Summary section
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingTotal = transactions
    .filter((t) => t.isPending)
    .reduce((sum, t) => sum + t.amount, 0);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Resumen:', 14, 40);
  
  doc.setFontSize(10);
  doc.setTextColor(34, 139, 34); // Green for income
  doc.text(`Ingresos: ${formatCurrency(totalIncome)}`, 14, 48);
  
  doc.setTextColor(220, 53, 69); // Red for expenses
  doc.text(`Gastos: ${formatCurrency(totalExpenses)}`, 14, 54);
  
  doc.setTextColor(40, 40, 40);
  doc.text(`Balance: ${formatCurrency(totalIncome - totalExpenses)}`, 14, 60);
  
  doc.setTextColor(255, 165, 0); // Orange for pending
  doc.text(`Pendiente: ${formatCurrency(pendingTotal)}`, 14, 66);

  // Transactions table
  const tableData = transactions.map((t) => [
    t.type === 'income' ? 'Ingreso' : 'Gasto',
    t.description.length > 25 ? t.description.substring(0, 25) + '...' : t.description,
    t.category,
    formatDate(t.date),
    t.isPending ? 'Pendiente' : 'Pagado',
    formatCurrency(t.amount),
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Tipo', 'Descripción', 'Categoría', 'Fecha', 'Estado', 'Monto']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [124, 58, 237], // Purple primary color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 45 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 22 },
      5: { cellWidth: 30, halign: 'right' },
    },
    didParseCell: (data) => {
      // Color the amount based on type
      if (data.column.index === 5 && data.section === 'body') {
        const row = transactions[data.row.index];
        if (row) {
          data.cell.styles.textColor = row.type === 'income' 
            ? [34, 139, 34] 
            : [220, 53, 69];
        }
      }
      // Color the type column
      if (data.column.index === 0 && data.section === 'body') {
        const row = transactions[data.row.index];
        if (row) {
          data.cell.styles.textColor = row.type === 'income' 
            ? [34, 139, 34] 
            : [220, 53, 69];
        }
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  doc.save(`${filename}.pdf`);
};
