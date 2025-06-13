import { productVariant } from "../../models/index.js";


export const adjustInventory = async (variantId, quantity, operation = "subtract") => {
  const variant = await productVariant.findByPk(variantId);
  if (!variant) throw new Error("Variante no encontrada");

  if (operation === "add") {
    variant.totalunitstock += quantity;
  } else {
    variant.totalunitstock -= quantity;
    if (variant.totalunitstock < 0) variant.totalunitstock = 0; // seguridad
  }

  await variant.save();
};
