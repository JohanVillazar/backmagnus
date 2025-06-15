
import CashRegister from "../../models/cashregister.js";
import CashRegisterProduct from "../../models/cashRegisterProduct.js";
import { updateFinalQuantity } from "./cashRegisterHelpers.js"

export const registerProductSaleInCashRegister = async (cashRegisterId, variantId, quantity) => {

  const openCashRegister = await CashRegister.findOne({
    where: { id: cashRegisterId, status: 'open' },
  });

  if (!openCashRegister) {

    throw new Error('No hay una caja abierta');
  }

  const productInCash = await CashRegisterProduct.findOne({
    where: {
      cashRegisterId: openCashRegister.id,
      variantId,
    },
  });

  if (!productInCash) {

    throw new Error('Producto no encontrado en la caja actual');
  }




  // Aumentar ventas
  productInCash.soldQuantity += quantity;

  // Recalcular cantidad final
  await updateFinalQuantity(productInCash);


};

