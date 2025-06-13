import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateInvoicePDF = async (sale, saleDetails) => {
  const doc = new PDFDocument({ margin: 50 });

  const invoicesDir = path.join(__dirname, '../invoices');
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

  const fileName = `factura_${sale.reference}.pdf`;
  const filePath = path.join(invoicesDir, fileName);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // 🎯 Formateador para $COP
  const formatCOP = (value) =>
    value?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) || '$0';

  // Encabezado
  doc.fontSize(14).text('Tienda MiNegocio S.A.S.');
  doc.fontSize(10).text('NIT: 900.123.456-7');
  doc.text('Dirección: Calle 123 #45-67, Bogotá');
  doc.text('Tel: (601) 1234567 | Email: contacto@minegocio.com');
  doc.moveDown();

  doc.text('='.repeat(50));
  doc.fontSize(12).text(`FACTURA DE VENTA`, { continued: true }).text(`         No. ${sale.reference}`);
  doc.text('='.repeat(50));
  doc.moveDown();

  // Fecha
  const fecha = new Date(sale.createdAt);
  const fechaStr = fecha.toLocaleDateString('es-CO') + '  -  ' + fecha.toLocaleTimeString('es-CO');
  doc.text(`Fecha de emisión: ${fechaStr}`);
  doc.moveDown();

  // Cliente
  const customer = sale.Customer || {};
  doc.text(`Cliente: ${customer.name || 'Consumidor Final'}`);
  doc.text(`Documento: ${customer.document || 'N/A'}`);
  doc.text(`Teléfono: ${customer.phone || 'N/A'}`);
  doc.text(`Correo: ${customer.email || 'N/A'}`);
  doc.moveDown();

  // Tabla productos
  doc.text('-'.repeat(50));
  doc.text('Producto                  Cant  Precio     Total');
  doc.text('-'.repeat(50));

  saleDetails.forEach((item) => {
    const producto = item.productVariant?.Product?.name || 'Producto';
    const presentacion = item.productVariant?.vatiantName || '';
    const nombre = `${producto} - ${presentacion}`.padEnd(25).substring(0, 25);
    const cantidad = String(item.quantity).padStart(4);
    const precio = formatCOP(Number(item.unitPrice)).padStart(10);
    const total = formatCOP(Number(item.totalPrice)).padStart(12);
    doc.text(`${nombre} ${cantidad} ${precio} ${total}`);
  });

  doc.text('-'.repeat(50));
  doc.moveDown(0.5);

  // Totales
  doc.text(`Subtotal:`.padEnd(36) + formatCOP(sale.subtotal), { align: 'right' });
  doc.text(`IVA (19%):`.padEnd(36) + formatCOP(sale.tax), { align: 'right' });
  doc.text(`Costo de envío:`.padEnd(36) + formatCOP(sale.shippingCost), { align: 'right' });
  doc.text('-'.repeat(50));
  doc.font('Helvetica-Bold');
  doc.text(`TOTAL A PAGAR:`.padEnd(36) + formatCOP(sale.totalPrice), { align: 'right' });
  doc.font('Helvetica');
  doc.moveDown();

  // Método y usuario
  doc.text(`Método de pago: ${sale.paymentMethod}`);
  doc.text(`Atendido por: ${sale.User?.name || 'Usuario'}`);
  doc.moveDown(1.5);

  // 🎯 QR Code con info de venta
  const qrData = {
    referencia: sale.reference,
    total: sale.totalPrice,
    fecha: fechaStr,
    cliente: customer.name || 'Consumidor Final',
  };

  const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));

  doc.text('Escanea para ver esta venta:', { align: 'left' });
  doc.image(qrImage, doc.page.width / 2 - 60, doc.y, { fit: [120, 120], align: 'center' });
  doc.moveDown(8); // espacio suficiente para evitar que el texto final quede montado

  // Mensaje final
  doc.text('='.repeat(50));
  doc.text('¡Gracias por su compra! Visítanos pronto.', { align: 'center' });
  doc.text('='.repeat(50));

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return filePath;
};
