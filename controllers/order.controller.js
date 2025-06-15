import { v4 as uuidv4 } from "uuid";
import Table from "../models/table.js";
import Order from "../models/order.js";
import OrderDetail from "../models/orderdetail.js";
import ProductVariant from "../models/productVariant.js";
import sequelize from "../config/db.js";
import Sale from "../models/sale.js";
import SaleDetail from "../models/saleDetail.js";
import Users from "../models/Users.js";
import Customers from "../models/customers.js";
import {generateInvoicePDF} from "../utils/generateInvoicePDF.js";
import {registerProductSaleInCashRegister} from "../controllers/helpers/registerProductSaleInCashRegister.js";
import Products from "../models/products.js";
import  Combo from "../models/combo.js";
import ComboComponent from "../models/ComboComponent.js";
import CashRegisterProduct from "../models/cashRegisterProduct.js";




export const createOrderForTable = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { tableId, products, userId, cashRegisterId } = req.body;

    const table = await Table.findByPk(tableId, { transaction });
    if (!table) return res.status(404).json({ msg: "Mesa no encontrada" });
    if (table.status === "ocupada") {
      return res.status(400).json({ msg: "La mesa ya está ocupada" });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ msg: "Debe agregar al menos un producto" });
    }

    const order = await Order.create({
      id: uuidv4(),
      tableId,
      userId,
      cashRegisterId,
      status: "pendiente",
      total: 0,
    }, { transaction });

    let totalOrder = 0;
    const orderDetails = [];

    for (const item of products) {
      const variant = await ProductVariant.findByPk(item.variantId);

      if (variant) {
        // 🟢 Producto normal
        const totalItem = item.quantity * parseFloat(variant.priceperUnit);
        totalOrder += totalItem;

        orderDetails.push({
          id: uuidv4(),
          orderId: order.id,
          variantId: item.variantId,
          comboId: null,
          quantity: item.quantity,
          unitPrice: variant.priceperUnit,
          total: totalItem,
        });

      } else {
        // 🔍 Combo
        const combo = await Combo.findByPk(item.variantId, {
          include: {
            model: ComboComponent,
            as: "components",
            include: {
              model: ProductVariant,
              as: "component"
            }
          }
        });

        if (!combo) {
          throw new Error(`Variante o combo no encontrado: ${item.variantId}`);
        }

        for (const comp of combo.components) {
          const variantToDiscount = comp.component;

          if (!variantToDiscount || !variantToDiscount.id) {
            throw new Error(`Ingrediente faltante en combo`);
          }

          const crProduct = await CashRegisterProduct.findOne({
            where: {
              cashRegisterId,
              variantId: variantToDiscount.id
            },
            transaction
          });

          if (!crProduct) {
            throw new Error(`Ingrediente no registrado en la caja: ${variantToDiscount.id}`);
          }

          const toDiscount = item.quantity * comp.quantity;

          if (crProduct.finalQuantity < toDiscount) {
            throw new Error(`Stock insuficiente para ingrediente: ${variantToDiscount.id}`);
          }

          crProduct.finalQuantity -= toDiscount;
          crProduct.soldQuantity += toDiscount;
          await crProduct.save({ transaction });
        }

        const comboTotal = item.quantity * parseFloat(combo.price);
        totalOrder += comboTotal;

        orderDetails.push({
          id: uuidv4(),
          orderId: order.id,
          variantId: null,
          comboId: combo.id, // ✅ ahora se guarda aquí
          quantity: item.quantity,
          unitPrice: combo.price,
          total: comboTotal,
        });
      }
    }

    await OrderDetail.bulkCreate(orderDetails, { transaction });

    order.total = totalOrder;
    await order.save({ transaction });

    table.status = "ocupada";
    await table.save({ transaction });

    await transaction.commit();

    return res.status(201).json({
      msg: "Pedido creado exitosamente",
      order,
      details: orderDetails,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error al crear pedido:", error);
    return res.status(500).json({ msg: "Error al crear el pedido" });
  }
};




export const addProductsToExistingOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { tableId, products } = req.body;

    if (!tableId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ msg: "Datos incompletos o inválidos" });
    }

    // Validar mesa
    const table = await Table.findByPk(tableId, { transaction });
    if (!table) return res.status(404).json({ msg: "Mesa no encontrada" });

    // Buscar la orden pendiente para esa mesa
    const order = await Order.findOne({
      where: { tableId, status: "pendiente" },
      transaction,
    });

    if (!order) {
      return res.status(404).json({ msg: "No hay una orden pendiente para esta mesa" });
    }

    let newTotal = parseFloat(order.total);

    const orderDetails = [];

    for (const item of products) {
      const variant = await ProductVariant.findByPk(item.variantId);
      if (!variant) {
        throw new Error(`Variante no encontrada: ${item.variantId}`);
      }

      const itemTotal = item.quantity * parseFloat(variant.priceperUnit);
      newTotal += itemTotal;

      orderDetails.push({
        id: uuidv4(),
        orderId: order.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: variant.priceperUnit,
        total: itemTotal,
      });
    }

    await OrderDetail.bulkCreate(orderDetails, { transaction });

    // Actualizar total de la orden
    order.total = newTotal;
    await order.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      msg: "Productos agregados a la orden correctamente",
      orderId: order.id,
      nuevosDetalles: orderDetails,
      nuevoTotal: newTotal,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error al agregar productos a la orden:", error);
    return res.status(500).json({ msg: "Error al agregar productos a la orden" });
  }
};

export const getActiveOrderByTable = async (req, res) => {
  try {
    const { tableId } = req.params;

    const activeOrder = await Order.findOne({
      where: { tableId, status: "pendiente" },
      include: [
        {
          model: OrderDetail,
          as: "details",
          include: [
            {
              model: ProductVariant,
              as: "productVariant",
              include: [
                {
                  model: Products,
                  as: "Product"
                }
              ]
            },
            {
              model: Combo,
              as: "combo" // 👈 esto es lo nuevo
            }
          ]
        }
      ]
    });

    if (!activeOrder) {
      return res.status(404).json({ msg: "No hay pedidos pendientes para esta mesa" });
    }

    res.status(200).json({
      msg: "Pedido activo encontrado",
      order: activeOrder,
    });
  } catch (error) {
    console.error("❌ Error al obtener pedido activo:", error);
    res.status(500).json({ msg: "Error al obtener el pedido activo" });
  }
};


//gener venta y pdf

export const closeOrderAndGenerateSale = async (req, res) => {
  const { orderId, customerId, paymentMethod } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, { transaction });
    if (!order || order.status !== "pendiente") {
      return res.status(400).json({ msg: "Orden no válida o ya pagada" });
    }

    const orderDetails = await OrderDetail.findAll({
      where: { orderId },
      include: [
        {
          model: ProductVariant,
          as: "productVariant"
        },
        {
          model: Combo,
          as: "combo"
        }
      ],
      transaction
    });

    if (!orderDetails || orderDetails.length === 0) {
      return res.status(400).json({ msg: "La orden no tiene productos" });
    }

    let subtotal = 0;
    const saleDetails = [];

    for (const item of orderDetails) {
      saleDetails.push({
        id: uuidv4(),
        saleId: null, // se asigna después
        variantId: item.variantId,
        comboId: item.comboId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total,
      });
      subtotal += parseFloat(item.total);
    }

    const reference = `VENT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90) + 10}`;

    const sale = await Sale.create({
      id: uuidv4(),
      reference,
      userId: order.userId,
      cashRegisterId: order.cashRegisterId,
      customerId,
      subtotal,
      tax: 0, // Tax is now set to 0
      shippingCost: 0,
      totalPrice: subtotal, // Total is now equal to subtotal
      paymentMethod,
    }, { transaction });

    // Asignar saleId real
    for (const detail of saleDetails) {
      detail.saleId = sale.id;
    }

    await SaleDetail.bulkCreate(saleDetails, { transaction });

    order.status = "pagado";
    await order.save({ transaction });

    const table = await Table.findByPk(order.tableId, { transaction });
    if (table) {
      table.status = "disponible";
      await table.save({ transaction });
    }

    await transaction.commit();

    return res.status(200).json({
      msg: "Orden pagada y venta registrada",
      sale,
    });

  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("❌ Error al cerrar orden:", error);
    return res.status(500).json({ msg: "Error al cerrar la orden" });
  }
};



