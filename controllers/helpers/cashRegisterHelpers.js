


export const updateFinalQuantity = async (cashRegisterProduct) => {
    cashRegisterProduct.finalQuantity =
      (cashRegisterProduct.initialQuantity || 0) +
      (cashRegisterProduct.receivedQuantity || 0) -
      (cashRegisterProduct.soldQuantity || 0) -
      (cashRegisterProduct.consumedQuantity || 0) -
      (cashRegisterProduct.damagedQuantity || 0);
  
    await cashRegisterProduct.save();
  };
  