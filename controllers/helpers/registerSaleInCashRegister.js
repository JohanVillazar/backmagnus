import CashRegisterProduct from "../../models/cashRegisterProduct.js";

export const registerProductSaleInCashRegister = async (cashRegisterId,  variantId, quantitySold) => {
  const product = await CashRegisterProduct.findOne({
    where: { cashRegisterId,  variantId },
  });

  if (product) {
    product.sales += quantitySold;
    await product.save();
  }
};
