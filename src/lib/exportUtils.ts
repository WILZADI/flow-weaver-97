import * as XLSX from 'xlsx';
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

export const exportToExcel = (
  transactions: Transaction[],
  filename: string = 'transacciones'
) => {
  // Prepare data for Excel
  const data = transactions.map((t) => ({
    Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
    Descripción: t.description,
    Categoría: t.category,
    Fecha: formatDate(t.date),
    Estado: t.isPending ? 'Pendiente' : 'Pagado',
    Monto: t.amount,
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 10 }, // Tipo
    { wch: 30 }, // Descripción
    { wch: 15 }, // Categoría
    { wch: 15 }, // Fecha
    { wch: 12 }, // Estado
    { wch: 15 }, // Monto
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');

  // Add summary sheet
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingTotal = transactions
    .filter((t) => t.isPending)
    .reduce((sum, t) => sum + t.amount, 0);

  const summaryData = [
    { Concepto: 'Total Ingresos', Monto: totalIncome },
    { Concepto: 'Total Gastos', Monto: totalExpenses },
    { Concepto: 'Balance Neto', Monto: totalIncome - totalExpenses },
    { Concepto: 'Pendiente por Pagar', Monto: pendingTotal },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

  // Download file
  XLSX.writeFile(wb, `${filename}.xlsx`);
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
