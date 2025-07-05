import { v4 as uuidv4 } from "uuid";
import Purchase from "../models/purchase.js";
import PurchaseDetail from "../models/purchasedetail.js";
import Sucursal from "../models/sucursal.js";
import Users from "../models/Users.js";
import productVariant from "../models/productVariant.js";
import CashRegister from "../models/cashregister.js";
import sequelize from "../config/db.js";
import User from "../models/Users.js";
import Products from "../models/products.js";



export const createPurchase = async (req, res) => {
    const t = await sequelize.transaction(); // 🔥 Creamos transacción
  
    try {
      const { SucursalId,SupplierId, userId, details, totalAmount,status } = req.body;
  
     
  
      // ✅ Validaciones básicas
      if (!SucursalId || !userId || !details || details.length === 0 || !totalAmount) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios" });
      }
      if (!SupplierId) {
  return res.status(400).json({ msg: "El proveedor (SupplierId) es obligatorio" });
}
  
      // ✅ Buscar caja abierta (puedes agregar filtro por sucursal si después tienes multisucrusal)
      const openCashRegister = await CashRegister.findOne({ where: { status: "open" } });
      if (!openCashRegister) {
        return res.status(400).json({ msg: "No hay una caja abierta actualmente" });
      }
  
      // ✅ Generar referencia única
      const reference = `COMP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90) + 10}`;
  
      // ✅ Crear compra principal
      const newPurchase = await Purchase.create({
        id: uuidv4(),
        SucursalId,
        userId,
        reference,
        totalAmount,
        status,
        SupplierId
      }, { transaction: t });
  
      // ✅ Procesar cada detalle
      const purchaseDetails = await Promise.all(details.map(async (detail) => {
        const variant = await productVariant.findByPk(detail.productVariantId);
  
        if (!variant) throw new Error(`La variante ${detail.productVariantId} no existe`);
  
        if (detail.quantity <= 0) throw new Error(`La cantidad debe ser mayor a 0`);
        if (detail.unitPrice <= 0) throw new Error(`El precio unitario debe ser mayor a 0`);
  
        // 🔥 Actualizar stock del inventario general
        variant.totalunitstock = Number(variant.totalunitstock) + Number(detail.quantity);
        await variant.save({ transaction: t });
  
        return {
          id: uuidv4(),
          purchaseId: newPurchase.id,
          productVariantId: detail.productVariantId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          totalPrice: detail.quantity * detail.unitPrice,
          totalAmount: detail.quantity * detail.unitPrice,
        };
      }));
  
      // ✅ Guardar detalles en bloque
      await PurchaseDetail.bulkCreate(purchaseDetails, { transaction: t });
  
      // ✅ Confirmar todo
      await t.commit();
  
      return res.status(201).json({ msg: "✅ Compra registrada con éxito", newPurchase, purchaseDetails });
    } catch (error) {
      console.error("❌ Error al registrar la compra:", error);
      await t.rollback(); // 🔥 Si algo falla, rollback
      return res.status(500).json({ msg: "Error interno del servidor" });
    }
  };


  //ACTUALIZAR ESTADO
  export const updatePurchaseStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ msg: "Debes especificar el nuevo estado de la compra." });
  }

  try {
    const purchase = await Purchase.findByPk(id);

    if (!purchase) {
      return res.status(404).json({ msg: "Compra no encontrada." });
    }

    purchase.status = status;
    await purchase.save();

    return res.status(200).json({ msg: "Estado de la compra actualizado correctamente.", purchase });
  } catch (error) {
    console.error("❌ Error al actualizar el estado de la compra:", error);
    return res.status(500).json({ msg: "Error interno del servidor." });
  }
};


  
export const getPurchaseSummary = async (req, res) => {
  try {
    const totalAmount = await Purchase.sum('totalAmount', {
      where: { status: 'pendiente' }, // Opcional: puedes filtrar solo compras 'pendientes' si quieres
    });

    res.json({
      totalAmount: totalAmount || 0, // si no hay compras devuelve 0
    });
  } catch (error) {
    console.error("Error al obtener resumen de compras:", error);
    res.status(500).json({ msg: "Error al obtener resumen de compras" });
  }
};





export const getRecentPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      limit: 6,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "reference", "totalAmount", "status", "createdAt"],
      include: [
        {
          model: User,
          attributes: ["name", "lastName"],
        },
        {
          model: Sucursal,
          as: "Sucrusal",
          attributes: ["name"],
        },
        {
          model: PurchaseDetail,
          include: [
            {
              model: productVariant,
              as: "productVariant",
              attributes: ["id"],
              include: [
                {
                  model: Products,
                  as: "Product", // 🔥 Muy importante el alias correcto
                  attributes: ["name"], // 🔥 Traer solo el nombre del producto
                },
              ],
            },
          ],
        },
      ],
    });

    res.json(purchases);
  } catch (error) {
    console.error("❌ Error al obtener últimas compras:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

