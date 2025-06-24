import CashRegister from "../models/cashregister.js";
import User from "../models/Users.js";
import Products from "../models/products.js";
import Sale from "../models/sale.js";
import SaleDetail from "../models/saleDetail.js";
import ProductVariant from "../models/productVariant.js";
import sequelize from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import Customers from "../models/customers.js";
import Users from "../models/Users.js";
import { format } from "date-fns";
import PDFDocument from "pdfkit";
import {generateInvoicePDF} from "../utils/generateInvoicePDF.js";
import {registerProductSaleInCashRegister} from "../controllers/helpers/registerProductSaleInCashRegister.js";
import CashRegisterProduct from "../models/cashRegisterProduct.js";
import { Op, fn, col, literal } from "sequelize";
import Sequelize from "sequelize";
import Combo from  "../models/combo.js";



export const createSaleWithDetails = async (req, res) => {
  try {
    const { cashRegisterId, userId, customerId, paymentMethod, details, shippingCost = 0 } = req.body;

    if (!details || details.length === 0) {
      return res.status(400).json({ msg: "La venta debe tener al menos un detalle" });
    }

    const result = await sequelize.transaction(async (transaction) => {
      const calculateTotals = (details, shippingCost) => {
        let subtotal = details.reduce((acc, d) => acc + d.quantity * d.unitPrice, 0);
        const total = +(subtotal + parseFloat(shippingCost)).toFixed(2);
        return { subtotal, total };
      };

      const { subtotal, tax, total } = calculateTotals(details, shippingCost);

      const reference = `VENT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90) + 10}`;

      const sale = await Sale.create({
        id: uuidv4(),
        reference,
        cashRegisterId,
        userId,
        customerId,
        subtotal,
                shippingCost,
        totalPrice: total,
        paymentMethod,
      }, { transaction });

      const saleDetails = details.map((d) => ({
        id: uuidv4(),
        saleId: sale.id,
        variantId: d.variantId,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        totalPrice: d.quantity * d.unitPrice,
      }));

      await SaleDetail.bulkCreate(saleDetails, { transaction });

      const variantIds = details.map(d => d.variantId);
      const variants = await ProductVariant.findAll({
        where: { id: variantIds },
        transaction
      });

      const updates = details.map(async (detail) => {
        const variant = variants.find(v => v.id === detail.variantId);
        if (!variant) throw new Error(`Variante no encontrada: ${detail.variantId}`);

        if (variant.totalunitstock < detail.quantity) {
          throw new Error(`Stock insuficiente para variante ${detail.variantId}`);
        }

        await ProductVariant.update(
          { totalunitstock: variant.totalunitstock - detail.quantity },
          { where: { id: variant.id }, transaction }
        );

        await registerProductSaleInCashRegister(cashRegisterId, variant.id, detail.quantity);
      });

      await Promise.all(updates);

      return { saleId: sale.id };
    });

    const fullSale = await Sale.findByPk(result.saleId, {
      include: [
        { model: Users, attributes: ["name"] },
        { model: Customers, attributes: ["name"] },
      ],
    });

    const fullDetails = await SaleDetail.findAll({
      where: { saleId: result.saleId },
      include: [{
        model: ProductVariant,
        as: "productVariant",
        attributes: ["variantName"],
        include: [{ model: Products, as: "Product", attributes: ["name"] }],
      }],
    });

    res.status(201).json({
      message: "Venta creada con éxito",
      sale: fullSale,
      details: fullDetails,
    });

    
  } catch (error) {
    console.error("Error al crear la venta:", error);
    return res.status(500).json({ msg: "Error al registrar la venta" });
  }
};



export const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({ include: [CashRegister, User] });
    res.json(sales);
  } catch (error) {
    console.error("Error al obtener las ventas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findOne({
      where: { id: sequelize.escape(id) },
      include: [CashRegister, User]
    });

    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.json(sale);
  } catch (error) {
    console.error("Error al obtener la venta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//REPORTE EN DASHBOARD
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereCondition = {};
    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const sales = await Sale.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit: 10,
      include: [
        {
          model: Users,
          attributes: ["id", "name", "email"]
        },
        {
          model: Customers,
          attributes: ["id", "name"]
        },
        {
          model: SaleDetail,
          include: [
            {
              model: ProductVariant,
              as: "productVariant",
              attributes: ["id", "vatiantName"],
              include: [
                {
                  model: Products,
                  as: "Product",
                  attributes: ["id", "name"]
                }
              ]
            },
            {
              model: Combo,
              as: "combo" // 👈 asegúrate que esta relación esté bien definida con alias
            }
          ]
        }
      ]
    });

    const report = sales.map(sale => ({
      fecha: sale.createdAt,
      referencia: sale.reference,
      usuario: sale.User?.name || "No asignado",
      cliente: sale.Customer?.name || "Venta sin cliente",
      productos: sale.saleDetails?.map(detail => {
        if (detail.combo) {
          return {
            producto: `Combo: ${detail.combo.name}`,
            presentacion: "Combo",
            cantidad: detail.quantity,
            precioTotal: detail.totalPrice
          };
        }

        return {
          producto: detail.productVariant?.Product?.name || "Desconocido",
          presentacion: detail.productVariant?.vatiantName || "Sin presentación",
          cantidad: detail.quantity,
          precioTotal: detail.totalPrice
        };
      }) ?? []
    }));

    res.status(200).json({ message: "Reporte generado con éxito", report });

  } catch (error) {
    console.error("Error generando el reporte:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};
//REPORTE EN PDF

export const exportSalesReportPdf = async (req, res) => {
  try {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          "Content-Length": Buffer.byteLength(pdfData),
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment;filename=reporte_ventas.pdf",
        })
        .end(pdfData);
    });

    doc.fontSize(18).text("Reporte de Ventas", { align: "center" }).moveDown();

    const sales = await Sale.findAll({
      include: [
        { model: Users, attributes: ["name"] },
        { model: Customers, attributes: ["name"] },
        {
          model: SaleDetail,
          as: "saleDetails",
          include: [
            {
              model: ProductVariant,
              as: "productVariant",
              attributes: ["vatiantName"],
              include: [{ model: Products, as: "Product", attributes: ["name"] }],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!sales || sales.length === 0) {
      doc.fontSize(14).text("No hay ventas registradas.", { align: "center" });
      doc.end();
      return;
    }

    sales.forEach((sale) => {
      doc
        .fontSize(12)
        .text(`Fecha: ${new Date(sale.createdAt).toLocaleString()}`)
        .text(`Referencia: ${sale.reference}`)
        .text(`Usuario: ${sale.User?.name || "No asignado"}`)
        .text(`Cliente: ${sale.Customer?.name || "Venta sin cliente"}`)
        .moveDown();

      if (sale.saleDetails && sale.saleDetails.length > 0) {
        sale.saleDetails.forEach((detail) => {
          const producto = detail.productVariant?.Product?.name || "Desconocido";
          const presentacion = detail.productVariant?.vatiantName || "";
          doc
            .fontSize(11)
            .text(
              `• ${producto} - ${presentacion} | Cantidad: ${detail.quantity} | Total: $${Number(detail.totalPrice).toFixed(2)}`
            );
        });
      } else {
        doc.fontSize(11).text("No hay productos en esta venta.");
      }

      // 🧮 Mostrar resumen de totales
      doc
        .moveDown()
        .fontSize(11)
        .text(`Subtotal: $${Number(sale.subtotal).toFixed(2)}`)
                .text(`Costo de Envío: $${Number(sale.shippingCost).toFixed(2)}`)
        .text(`TOTAL: $${Number(sale.totalPrice).toFixed(2)}`, { underline: true })
        .moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Error generando el PDF:", error);
    res.status(500).json({ message: "Error al generar el PDF" });
  }
};



export const getDailySalesSummary = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      where: literal(`"timestamp"::date = CURRENT_DATE`)
    });

    const totalAmount = sales.reduce((sum, s) => sum + parseFloat(s.totalPrice), 0);

    res.json({
      msg: "Resumen de ventas del día",
      count: sales.length,
      totalAmount,
    });
  } catch (error) {
    console.error("Error en getSalesOfToday:", error);
    res.status(500).json({ msg: "Error al obtener resumen" });
  }
};

export const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await SaleDetail.findAll({
      attributes: [
        "variantId",
        "comboId",
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "quantity"],
      ],
      include: [
        {
          model: ProductVariant,
          as: "productVariant",
          attributes: ["vatiantName"],
          include: [
            {
              model: Products,
              as: "Product",
              attributes: ["name"]
            }
          ]
        },
        {
          model: Combo,
          as: "combo",
          attributes: ["name"]
        }
      ],
      group: [
        "variantId",
        "comboId",
        "productVariant.id",
        "productVariant->Product.id",
        "combo.id"
      ],
      order: [[Sequelize.literal("quantity"), "DESC"]],
      limit: 5
    });

    // Transformar para el frontend
    const formatted = topProducts.map(item => {
      const nombre = item.variantId
        ? `${item.productVariant?.vatiantName || ""} - ${item.productVariant?.Product?.name || "Desconocido"}`
        : item.combo?.name || "Combo Desconocido";

      return {
        nombre,
        cantidad: parseInt(item.get("quantity")),
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error al obtener productos más vendidos:", error);
    res.status(500).json({ msg: "Error interno" });
  }
};



export const getWeeklySales = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const sales = await Sale.findAll({
      where: {
        createdAt: {
          [Op.between]: [sevenDaysAgo, today],
        },
      },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('SUM', col('totalPrice')), 'total'],
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
    });

    res.json(sales);
  } catch (error) {
    console.error('Error fetching weekly sales:', error);
    res.status(500).json({ message: 'Error al obtener ventas semanales' });
  }
};