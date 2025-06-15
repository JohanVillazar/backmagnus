import CashRegister from "../models/cashregister.js";
import CashMovement from "../models/cashmovement.js";
import Products from "../models/products.js";
import ProductVariant from "../models/productVariant.js";
import Sale from "../models/sale.js";
import {Op} from "sequelize";
import {fn} from "sequelize";
import {col} from "sequelize";
import CashRegisterProduct from "../models/cashRegisterProduct.js";
import {updateFinalQuantity} from "../controllers/helpers/cashRegisterHelpers.js";
import {generateCashRegisterSummary} from "../utils/generateCashRegisterSummary.js";
import Users from "../models/Users.js";
import { adjustInventory } from "./helpers/adjustInventory.js";
import SaleDetail from "../models/saleDetail.js";
import Combo from "../models/combo.js"; 
import fs from "fs";
import {sendCashRegisterEmail} from "../services/emailService.js";




//Abrir caja
export const openCashRegister = async (req, res) => {
 

  try {
    const { userId, openingAmount, Products } = req.body;

    const existingCashRegister = await CashRegister.findOne({ where: { status: "open" } });
    if (existingCashRegister) {
      return res.status(400).json({ msg: "Ya hay una caja abierta" });
    }

    const cashRegister = await CashRegister.create({ userId, openingAmount });

    // Si vienen productos manuales, usar esos
    if (Products && Array.isArray(Products) && Products.length > 0) {
      const productEntries = await Promise.all(Products.map(async (prod) => {
        const variant = await ProductVariant.findByPk(prod.variantId);
        if (!variant) throw new Error(`Variante no encontrada: ${prod.variantId}`);

        await adjustInventory(prod.variantId, prod.quantity, "subtract");

        return {
          cashRegisterId: cashRegister.id,
          variantId: prod.variantId,
          initialQuantity: prod.quantity,
          receivedQuantity: 0,
          soldQuantity: 0,
          consumedQuantity: 0,
          damagedQuantity: 0,
          finalQuantity: prod.quantity,
        };
      }));

      await CashRegisterProduct.bulkCreate(productEntries);

    } else {
      // 🚀 Nueva lógica: cargar desde la última caja cerrada
      const lastClosedCash = await CashRegister.findOne({
        where: { status: "closed" },
        order: [["closedAt", "DESC"]],
        include: [{ model: CashRegisterProduct }]
      });

      if (lastClosedCash) {
        const productEntries = await Promise.all(lastClosedCash.CashRegisterProducts.map(async (item) => {
          const quantity = item.finalQuantity || 0;

          await adjustInventory(item.variantId, quantity, "subtract");

          return {
            cashRegisterId: cashRegister.id,
            variantId: item.variantId,
            initialQuantity: quantity,
            receivedQuantity: 0,
            soldQuantity: 0,
            consumedQuantity: 0,
            damagedQuantity: 0,
            finalQuantity: quantity,
          };
        }));

        await CashRegisterProduct.bulkCreate(productEntries);
      }
    }

    res.status(201).json({ msg: "Caja abierta correctamente", cashRegister });

  } catch (error) {
    console.error("Error al abrir la caja:", error);
    res.status(500).json({ msg: "Error al abrir la caja" });
  }
};




export const getAllCashRegisters = async (req, res) => {
  try {
    const cashRegisters = await CashRegister.findAll();
    res.status(200).json(cashRegisters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener todas las cajas" });
  }
};


export const getCashStatus = async (req, res) => {
  try {
    const cashRegister = await CashRegister.findOne({
      where: { status: "open" },
    });

    if (!cashRegister) {
      return res.json({ isOpen: false });
    }

    return res.json({
      isOpen: true,
      cashRegisterId: cashRegister.id,
    });
  } catch (error) {
    console.error("❌ Error verificando el estado de caja:", error);
    res.status(500).json({ msg: "Error al verificar estado de caja" });
  }
};


//MOVIMIENTOS DURANTE EL TURNO DE CAJA 

export const addProductToCashRegister = async (req, res) => {
  try {
    const { variantId, quantity } = req.body;

    const openCashRegister = await CashRegister.findOne({ where: { status: 'open' } });
    if (!openCashRegister) {
      return res.status(400).json({ msg: 'No hay caja abierta actualmente' });
    }

    

    const variantExists = await ProductVariant.findByPk(variantId);
    if (!variantExists) {
      return res.status(404).json({ msg: 'La variante de producto no existe' });
    }

    const existingRecord = await CashRegisterProduct.findOne({
      where: {
        cashRegisterId: openCashRegister.id,
        variantId
      }
    });

  

    if (existingRecord) {
      existingRecord.receivedQuantity += quantity;
      existingRecord.finalQuantity += quantity;
      await existingRecord.save();
    } else {
      await CashRegisterProduct.create({
        cashRegisterId: openCashRegister.id,
        variantId,
        initialQuantity: 0,
        receivedQuantity: quantity,
        soldQuantity: 0,
        consumedQuantity: 0,
        damagedQuantity: 0,
        finalQuantity: quantity
      });
      console.log("🆕 Producto agregado a la caja");
    }

    // 🔥 Aumentar inventario general
    await adjustInventory(variantId, quantity, "add");

    res.status(200).json({ msg: 'Producto agregado correctamente al turno y stock actualizado' });
  } catch (error) {
    console.error("❌ Error al agregar producto al turno:", error);
    res.status(500).json({ msg: 'Error al agregar producto al turno' });
  }
};



//Agregar stock a turno de caja
export const addStockToCashRegister = async (req, res) => {
  try {
    const { variantId, quantity, userId } = req.body;

    const cashRegister = await CashRegister.findOne({ where: { status: 'open' } });
    if (!cashRegister) {
      return res.status(400).json({ msg: 'No hay una caja abierta' });
    }

    let existing = await CashRegisterProduct.findOne({
      where: {
        variantId,
        cashRegisterId: cashRegister.id,
      },
    });

    if (existing) {
      existing.receivedQuantity += quantity;
      await updateFinalQuantity(existing);
    } else {
      existing = await CashRegisterProduct.create({
        cashRegisterId: cashRegister.id,
        variantId,
        initialQuantity: 0,
        receivedQuantity: quantity,
        soldQuantity: 0,
        consumedQuantity: 0,
        damagedQuantity: 0,
        finalQuantity: quantity,
      });

      await updateFinalQuantity(existing);
    }

    // 🔥 Sumar al inventario general
    await adjustInventory(variantId, quantity, "add");

    res.status(200).json({ msg: 'Ingreso registrado correctamente y stock actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al registrar ingreso de producto' });
  }
};

// REGISTRAR CONSUMO

export const registerInternalConsumption = async (req, res) => {
  try {
    const { variantId, quantity } = req.body;

    const cashRegister = await CashRegister.findOne({ where: { status: 'open' } });
    if (!cashRegister) {
      return res.status(400).json({ msg: 'No hay una caja abierta' });
    }

    const product = await CashRegisterProduct.findOne({
      where: {
        cashRegisterId: cashRegister.id,
        variantId,
      },
    });

    if (!product) {
      return res.status(404).json({ msg: 'Producto no registrado en caja' });
    }

    product.consumedQuantity += quantity;
    product.finalQuantity -= quantity;
    await product.save();

    // 🔥 Descontar del inventario general
    await adjustInventory(variantId, quantity, "subtract");

    res.status(200).json({ msg: 'Consumo registrado correctamente y stock actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al registrar consumo' });
  }
};


// REGSITRAR DAÑOS 

export const registerProductDamage = async (req, res) => {
  try {
    const { variantId, quantity } = req.body;

    const cashRegister = await CashRegister.findOne({ where: { status: 'open' } });
    if (!cashRegister) {
      return res.status(400).json({ msg: 'No hay una caja abierta' });
    }

    const product = await CashRegisterProduct.findOne({
      where: {
        cashRegisterId: cashRegister.id,
        variantId,
      },
    });

    if (!product) {
      return res.status(404).json({ msg: 'Producto no registrado en caja' });
    }

    // Sumamos la cantidad dañada
    product.damagedQuantity += quantity;

    // Recalculamos la cantidad final usando el helper
    await updateFinalQuantity(product);

    // 🔥 Descontar del inventario general
    await adjustInventory(variantId, quantity, "subtract");

    res.status(200).json({ msg: 'Daño registrado correctamente y stock actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al registrar daño' });
  }
};
//REGISTRAR INGRESOS
export const addIncome = async (req, res) => {
  try {
    const { amount, description } = req.body;

    const cashRegister = await CashRegister.findOne({ where: { status: "open" } });
    if (!cashRegister) {
      return res.status(400).json({ msg: "No hay una caja abierta" });
    }

    await CashMovement.create({
      cashRegisterId: cashRegister.id,
      type: "ingreso",
      amount,
      description,
    });

    cashRegister.totalIncome += parseFloat(amount);
    await cashRegister.save();

    res.status(200).json({ msg: "Ingreso registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al registrar ingreso" });
  }
};

 export const getAlladdIncome = async (req, res) => {
  try {
    const incomes = await CashMovement.findAll({ where: { type: "ingreso" } });
    res.json(incomes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener los ingresos" });
  }
 }

//REGISTRAR GASTOS
export const addWithdrawal = async (req, res) => {
  try {
    const { amount, description } = req.body;

    const cashRegister = await CashRegister.findOne({ where: { status: "open" } });
    if (!cashRegister) {
      return res.status(400).json({ msg: "No hay una caja abierta" });
    }

    await CashMovement.create({
      cashRegisterId: cashRegister.id,
      type: "gasto",
      amount,
      description,
    });

    cashRegister.totalWithdrawals += parseFloat(amount);
    await cashRegister.save();

    res.status(200).json({ msg: "Retiro registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al registrar retiro" });
  }
};

//obtener movimientos
export const getAllCashMovements = async (req, res) => {
  try {
    const cashMovements = await CashMovement.findAll({
      order: [['createdAt', 'ASC']], // Opcional: ordenar por fecha
    });
    res.json(cashMovements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener movimientos de caja" });
  }
}

// productos en turno 
export const getProductsInOpenCash = async (req, res) => {
  try {
    const cashRegister = await CashRegister.findOne({ where: { status: "open" } });

    if (!cashRegister) {
      return res.status(404).json({ msg: "No hay caja abierta" });
    }

    const products = await CashRegisterProduct.findAll({
      where: { cashRegisterId: cashRegister.id },
      include: [
        {
          model: ProductVariant,
          as: "productVariant",
          include: {
            model: Products,
          as: "Product", // Y este también
          attributes: ["name"]
          }
        },
      ],
    });

    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos de la caja abierta:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};


//obtener los movimientos de stock durante el turno
export const getCurrentStockMovements = async (req, res) => {
  try {
    // Buscar caja abierta
    const openCash = await CashRegister.findOne({ where: { status: "open" } });
    if (!openCash) {
      return res.status(400).json({ msg: "No hay una caja abierta" });
    }

    // Buscar productos en caja abierta
    const products = await CashRegisterProduct.findAll({
      where: { cashRegisterId: openCash.id },
      include: [
        {
          model: ProductVariant,
          include: [
            {
              model: Products,
              as: "Product", // 👈 respetando el alias de belongsTo
              attributes: ["description"], // Solo traer el nombre
            },
          ],
        },
      ],
    });

    // Preparar movimientos
    const movements = [];

    for (const p of products) {
      // Debug real
      console.log("🧩 Variante encontrada:", p.ProductVariant?.Product?.name);

      const productName = p.ProductVariant?.Product?.name || "Producto desconocido";

      if (p.receivedQuantity > 0) {
        movements.push({
          productName,
          type: "agregado",
          quantity: p.receivedQuantity,
          date: p.updatedAt,
        });
      }

      if (p.consumedQuantity > 0) {
        movements.push({
          productName,
          type: "consumo",
          quantity: p.consumedQuantity,
          date: p.updatedAt,
        });
      }

      if (p.damagedQuantity > 0) {
        movements.push({
          productName,
          type: "daño",
          quantity: p.damagedQuantity,
          date: p.updatedAt,
        });
      }
    }

    // Enviar movimientos al frontend
    res.json(movements);

  } catch (error) {
    console.error("❌ Error al obtener movimientos de stock:", error);
    res.status(500).json({ msg: "Error interno al obtener movimientos de stock" });
  }
};
// PARCIAL DE CAJA TURNO
export const getOpenCashSummary = async (req, res) => {
  try {
    const cashRegister = await CashRegister.findOne({
      where: { status: "open" }
    });

    if (!cashRegister) {
      return res.status(400).json({ msg: "No hay caja abierta" });
    }

    // 🔹 Ventas
    const sales = await Sale.findAll({
      where: { cashRegisterId: cashRegister.id },
      attributes: ["id", "totalPrice"]
    });

    const saleIds = sales.map(s => s.id);

    const details = await SaleDetail.findAll({
      where: { saleId: saleIds },
      include: [
        {
          model: ProductVariant,
          as: "productVariant",
          include: {
            model: Products,
            as: "Product"
          }
        },
        {
          model: Combo,
          as: "combo"
        }
      ]
    });

    const summaryMap = new Map();
    let totalGeneral = 0;

    for (const detail of details) {
      const total = parseFloat(detail.totalPrice || 0);
      totalGeneral += total;

      let key, name, product;

      if (detail.productVariant) {
        // Producto normal
        key = detail.variantId;
        name = detail.productVariant.vatiantName;
        product = detail.productVariant.Product.name;
      } else if (detail.combo) {
        // Combo
        key = detail.comboId;
        name = "Combo";
        product = detail.combo.name;
      } else {
        continue;
      }

      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          variantId: key,
          variantName: name,
          productName: product,
          cantidad: 0,
          total: 0
        });
      }

      const current = summaryMap.get(key);
      current.cantidad += detail.quantity;
      current.total += total;
    }

    const productosVendidos = Array.from(summaryMap.values());

    // 🔹 Movimientos de productos
    const productMovements = await CashRegisterProduct.findAll({
      where: { cashRegisterId: cashRegister.id },
      include: {
        model: ProductVariant,
        as: "productVariant",
        include: {
          model: Products,
          as: "Product"
        }
      }
    });

    const productos = productMovements.map((p) => ({
      variantId: p.variantId,
      variantName: p.productVariant.vatiantName,
      productName: p.productVariant.Product.name,
      received: p.receivedQuantity || 0,
      consumed: p.consumedQuantity || 0,
      damaged: p.damagedQuantity || 0,
      sold: p.soldQuantity || 0
    }));

    // 🔹 Ingresos y gastos
    const movimientos = await CashMovement.findAll({
      where: { cashRegisterId: cashRegister.id },
      attributes: ["type", "description", "amount"]
    });

    const ingresos = movimientos
      .filter((m) => m.type === "ingreso")
      .map((m) => ({ description: m.description, amount: m.amount }));

    const gastos = movimientos
      .filter((m) => m.type === "gasto")
      .map((m) => ({ description: m.description, amount: m.amount }));

    // ✅ Respuesta final
    res.json({
      totalGeneral,
      productosVendidos,
      productos,
      ingresos,
      gastos
    });

  } catch (error) {
    console.error("Error al obtener resumen de caja abierta:", error);
    res.status(500).json({ msg: "Error al generar resumen" });
  }
};
//CERRAR TURNO DE CARGA
export const closeCashRegister = async (req, res) => {
  try {
    const cashRegister = await CashRegister.findOne({
      where: { status: "open" },
      include: {
        model: Users,
        attributes: ["name"]
      }
    });

    if (!cashRegister) {
      return res.status(400).json({ msg: "No hay una caja abierta" });
    }

    // 🔹 Buscar todas las ventas del turno
    const sales = await Sale.findAll({
      where: { cashRegisterId: cashRegister.id }
    });

    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.totalPrice || 0), 0);

    // 🔹 Buscar movimientos de caja (ingresos/gastos)
    const cashMovements = await CashMovement.findAll({
      where: { cashRegisterId: cashRegister.id },
    });

    const totalIncome = cashMovements
      .filter(mov => mov.type === "ingreso")
      .reduce((sum, mov) => sum + parseFloat(mov.amount || 0), 0);

    const totalWithdrawals = cashMovements
      .filter(mov => mov.type === "gasto")
      .reduce((sum, mov) => sum + parseFloat(mov.amount || 0), 0);

    // 🔹 Obtener consolidado de productos CON relaciones
    const productSummary = await CashRegisterProduct.findAll({
      where: { cashRegisterId: cashRegister.id },
      attributes: [
        "id",
        "variantId",
        "initialQuantity",
        "receivedQuantity",
        "soldQuantity",
        "consumedQuantity",
        "damagedQuantity",
        "finalQuantity",
      ],
      include: {
        model: ProductVariant,
        as: "productVariant",
        attributes: ["vatiantName"],
        include: {
          model: Products,
          as: "Product",
          attributes: ["name"]
        }
      }
    });

    // 🔹 Calcular finalQuantity y actualizar registros
    for (const item of productSummary) {
      const finalQty = (
        (item.initialQuantity || 0) +
        (item.receivedQuantity || 0) -
        (item.soldQuantity || 0) -
        (item.consumedQuantity || 0) -
        (item.damagedQuantity || 0)
      );

      item.finalQuantity = finalQty;
      await item.save();

      // 🔹 ACTUALIZAR STOCK GENERAL del inventario
      if (finalQty !== null && finalQty >= 0) {
        await ProductVariant.increment(
          { totalunitstock: finalQty },
          { where: { id: item.variantId } }
        );
      }
    }

    // 🔹 Resumen de combos vendidos en el turno

    const comboSummaryRaw = await SaleDetail.findAll({
  attributes: [
    "comboId",
    [fn("SUM", col("quantity")), "totalSold"]
  ],
  where: {
    comboId: { [Op.ne]: null },
    saleId: {
      [Op.in]: sales.map(sale => sale.id)
    }
  },
  include: [
    {
      model: Combo,
      as: "combo",
      attributes: ["name", "price"]
    }
  ],
  group: ["comboId", "combo.id"]
});

// 💰 Formateador de moneda COP
const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0
});

// 🔄 Mapear para agregar el total en dinero y el texto formateado
const comboSummary = comboSummaryRaw.map((item) => {
  const totalSold = Number(item.getDataValue("totalSold"));
  const price = Number(item.combo.price);
  const totalRevenue = totalSold * price;

  return {
    comboId: item.comboId,
    totalSold,
    totalRevenue,
    totalRevenueFormatted: formatter.format(totalRevenue), 
    combo: {
      name: item.combo.name
    }
  };
});

 

// 🔹 Calcular y cerrar caja
cashRegister.totalSales = totalSales;
cashRegister.totalIncome = totalIncome;
cashRegister.totalWithdrawals = totalWithdrawals;
cashRegister.closingAmount =
  parseFloat(cashRegister.openingAmount) + totalSales + totalIncome - totalWithdrawals;
cashRegister.status = "closed";
cashRegister.closedAt = new Date();
await cashRegister.save();

// 🔹 Generar el PDF
const pdfPath = await generateCashRegisterSummary(cashRegister, productSummary, comboSummary);

// 🔹 Enviar por correo electrónico
  try {
    await sendCashRegisterEmail("baruterraza2024@gmail.com", pdfPath); //correo del administrador de punto
    console.log("📧 Tirilla enviada por correo");
  } catch (emailError) {
    console.error("❌ Error enviando email:", emailError?.message || emailError);
  }

  // 🔹 Eliminar archivo local después de enviar el correo
  fs.unlink(pdfPath, (err) => {
    if (err) console.warn("⚠️ No se pudo eliminar el archivo PDF local:", err);
  });

  // 🔹 Respuesta final al frontend
  res.status(200).json({
    msg: "Caja cerrada correctamente y tirilla enviada por email",
    cashRegister,
    productSummary,
    comboSummary,
  });

} catch (error) {
  console.error("❌ Error cerrando caja:", error);
  res.status(500).json({ msg: "Error cerrando caja", error: error.message });
}
};
 

export const getLastClosedProducts = async (req, res) => {
  try {
    const lastCash = await CashRegister.findOne({
      where: { status: "closed" },
      order: [["closedAt", "DESC"]],
      include: [{
        model: CashRegisterProduct,
        attributes: ["variantId", "finalQuantity"]
      }]
    });

    if (!lastCash || !lastCash.CashRegisterProducts) {
      return res.status(404).json({ msg: "No hay cajas cerradas con productos" });
    }

    const products = lastCash.CashRegisterProducts.filter(p => p.finalQuantity > 0);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener productos del último cierre:", error);
    res.status(500).json({ msg: "Error al obtener productos del cierre anterior" });
  }
};





