import SaleDetail from "../models/saleDetail.js";
import productVariant from "../models/productVariant.js";
import Sale from "../models/sale.js";



export const createSaleDetail = async (req, res) => {
    try {
      const { saleId, variantId, quantity, unitPrice } = req.body;
  
      // Verificar si la venta existe
      const sale = await Sale.findByPk(saleId);
      if (!sale) {
        return res.status(404).json({ message: "Venta no encontrada" });
      }
  
      // Verificar si el producto existe
      const variant = await productVariant.findByPk(variantId);
      if (!variant) {
        return res.status(404).json({ message: "Variante de producto no encontrada" });
      }
  
      // Verificar si hay stock suficiente
      if (variant.totalunitstock < quantity) {
        return res.status(400).json({ message: "Stock insuficiente" });
      }
  
      // Calcular totalPrice
      const totalPrice = quantity * unitPrice;
  
      // Crear detalle de venta
      const saleDetail = await SaleDetail.create({
        saleId,
        variantId,
        quantity,
        unitPrice,
        totalPrice,
      });
  
      // Restar del stock
      await variant.update({ totalunitstock: variant.totalunitstock - quantity });
  
      res.status(201).json({
        message: "Detalle de venta creado exitosamente",
        saleDetail,
      });
    } catch (error) {
      res.status(500).json({ message: "Error al crear detalle de venta", error: error.message });
    }
  };


  export const getSaleDetails = async (req, res) => {
    try {
      const { saleId } = req.params;
  
      const saleDetails = await SaleDetail.findAll({
        where: { saleId },
        include: [{ model: productVariant, attributes: ["variantName", "unitmeasureVariant"] }],
      });
  
      if (!saleDetails.length) {
        return res.status(404).json({ message: "No hay detalles de venta para esta venta" });
      }
  
      res.json(saleDetails);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener detalles de venta", error: error.message });
    }
  };
  
  export const deleteSaleDetail = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Buscar detalle de venta
      const saleDetail = await SaleDetail.findByPk(id);
      if (!saleDetail) {
        return res.status(404).json({ message: "Detalle de venta no encontrado" });
      }
  
      // Devolver stock eliminado
      const variant = await productVariant.findByPk(saleDetail.variantId);
      if (variant) {
        await variant.update({ totalunitstock: variant.totalunitstock + saleDetail.quantity });
      }
  
      // Eliminar detalle de venta
      await saleDetail.destroy();
  
      res.json({ message: "Detalle de venta eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar detalle de venta", error: error.message });
    }
  };

