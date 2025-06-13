
import CashRegister from "../../models/cashregister.js";
import CashRegisterProduct from "../../models/cashRegisterProduct.js";
import {updateFinalQuantity} from "./cashRegisterHelpers.js"

export const registerProductSaleInCashRegister = async (cashRegisterId, variantId, quantity) => {
  console.log("📦 Registrando venta en caja...");
  console.log("➡️ Caja ID:", cashRegisterId);
  console.log("➡️ Variante ID:", variantId);
  console.log("➡️ Cantidad vendida:", quantity);

  const openCashRegister = await CashRegister.findOne({
    where: { id: cashRegisterId, status: 'open' },
  });

  if (!openCashRegister) {
    console.warn("⚠️ No hay una caja abierta con ese ID");
    throw new Error('No hay una caja abierta');
  }

  const productInCash = await CashRegisterProduct.findOne({
    where: {
      cashRegisterId: openCashRegister.id,
      variantId,
    },
  });
  


  if (!productInCash) {
  console.warn("⚠️ Producto NO encontrado en la caja actual:");
  console.warn("📌 Buscando con cashRegisterId:", openCashRegister.id);
  console.warn("📌 Buscando con variantId:", variantId);
  throw new Error('Producto no encontrado en la caja actual');
  }
  

 

  // Aumentar ventas
  productInCash.soldQuantity += quantity;

  // Recalcular cantidad final
  await updateFinalQuantity(productInCash);

  console.log("✅ Venta registrada. Nueva cantidad vendida:", productInCash.soldQuantity);
  console.log("🧮 Nueva cantidad final:", productInCash.finalQuantity);
};

