import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { dirname } from "path";
import productVariant from "../models/productVariant.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración para impresora térmica (80mm)
const THERMAL_PRINTER_WIDTH = 80; // mm
const MM_TO_POINTS = 2.83465; // Factor de conversión

// Formatear dinero en pesos colombianos
const formatCOP = (value) => {
  return Number(value).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};

export const generateCashRegisterSummary = async (
  cashRegister,
  productSummary,
  comboSummary = []
) => {
  const doc = new PDFDocument({
    margin: 10,
    size: [THERMAL_PRINTER_WIDTH * MM_TO_POINTS, 1000],
    font: "Helvetica",
  });

  const folderPath = path.join(__dirname, "../invoices/");
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const fileName = `cierre_caja_${cashRegister.id}_${Date.now()}.pdf`;
  const filePath = path.join(folderPath, fileName);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Utilidades visuales
  const centered = (text) => doc.text(text, { align: "center" });
  const divider = () => {
  doc.moveDown(0.5);
  doc.text("-".repeat(32), { align: "center" });
  doc.moveDown(0.5);
};
  const sectionTitle = (title) => {
    doc.font("Helvetica-Bold").fontSize(9);
    centered(title);
    doc.font("Helvetica").fontSize(8);
    doc.moveDown(0.3);
  };

  // ENCABEZADO
  doc.font("Helvetica-Bold").fontSize(10);
  centered("RESUMEN DE CIERRE");
  doc.font("Helvetica").fontSize(8);
  centered(`Caja #${cashRegister.id}`);
  divider();

  // INFORMACIÓN DEL TURNO
  sectionTitle("INFORMACIÓN DEL TURNO");
  doc.text(`Usuario:  ${cashRegister.User?.name || "N/A"}`);
  doc.text(
    `Apertura: ${new Date(cashRegister.openedAt).toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`
  );
  doc.text(
    `Cierre:   ${new Date(cashRegister.closedAt).toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`
  );
  divider();

  // RESUMEN FINANCIERO
  sectionTitle("RESUMEN FINANCIERO");
  doc.text(`Apertura:    ${formatCOP(cashRegister.openingAmount)}`);
  doc.text(`Ventas:      ${formatCOP(cashRegister.totalSales)}`);
  doc.text(`Ingresos:    ${formatCOP(cashRegister.totalIncome)}`);
  doc.text(`Retiros:     ${formatCOP(cashRegister.totalWithdrawals)}`);
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold")
    .text(`Cierre:      ${formatCOP(cashRegister.closingAmount)}`)
    .font("Helvetica");
  divider();

  // INVENTARIO FINAL
  sectionTitle("INVENTARIO FINAL");

  for (const p of productSummary) {
    const variant = await productVariant.findByPk(p.variantId, {
      include: ["Product"],
    });

    const productName = variant?.Product?.name || "Producto";
    const variantName = variant?.vatiantName || "Variante";

    doc.font("Helvetica-Bold").fontSize(8).text(`${productName} - ${variantName}`);
    doc.font("Helvetica").fontSize(7)
      .text(`Inicial:   ${p.initialQuantity}`)
      .text(`Recibido:  ${p.receivedQuantity}`)
      .text(`Vendido:   ${p.soldQuantity}`)
      .text(`Dañado:    ${p.damagedQuantity}`)
      .text(`Final:     ${p.finalQuantity}`);

    doc.moveDown(0.3);
   doc.text("---------------------------------------------------------");


    doc.moveDown(0.3);
  }

  // RESUMEN DE COMBOS
  if (comboSummary && comboSummary.length > 0) {
    divider();
    sectionTitle("VENTAS:");

    for (const combo of comboSummary) {
      doc.font("Helvetica-Bold").fontSize(8).text(`${combo.combo.name}`);
      doc.font("Helvetica").fontSize(7)
        .text(`Cantidad: ${combo.totalSold}`)
        .text(`Total:    ${formatCOP(combo.totalRevenue)}`);
        

      doc.moveDown(0.3);
      doc.text("--------------------------------------------------");
      doc.moveDown(0.3);
    }
  }

  // PIE DE PÁGINA
  divider();
  doc.font("Helvetica-Bold").fontSize(8);
  centered("SISTEMA POS - MAGNUS CONTROL");
  doc.font("Helvetica").fontSize(6);
  centered(new Date().toLocaleDateString("es-CO"));

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return filePath;
};




