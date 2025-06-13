import  ComboComponent  from "../models/ComboComponent.js";
import  Combo  from "../models/combo.js";
import productVariant from "../models/productVariant.js";
import Products from "../models/products.js";

export const setComboComponents = async (req, res) => {
  try {
    const { comboVariantId } = req.params;
    const { componentes } = req.body; // Array: [{ componentVariantId, quantity }]

    // 1. Eliminar componentes anteriores (si existen)
    await ComboComponent.destroy({ where: { comboVariantId } });

    // 2. Registrar los nuevos
    for (const comp of componentes) {
      await ComboComponent.create({
        comboVariantId,
        componentVariantId: comp.componentVariantId,
        quantity: comp.quantity
      });
    }

    res.status(200).json({ msg: "Componentes del combo actualizados correctamente" });
  } catch (error) {
    console.error("Error al guardar componentes del combo:", error);
    res.status(500).json({ msg: "Error interno al guardar componentes del combo" });
  }
};

export const createCombo = async (req, res) => {
  try {
    const { name, description, price, componentes } = req.body;

    // Validar componentes
    if (!Array.isArray(componentes) || componentes.length === 0) {
      return res.status(400).json({ msg: "Debes agregar al menos un componente al combo" });
    }

    for (const comp of componentes) {
      if (!comp.variantId || !comp.quantity) {
        return res.status(400).json({ msg: "Todos los componentes deben tener variantId y quantity" });
      }

      const exists = await productVariant.findByPk(comp.variantId);
      if (!exists) {
        return res.status(404).json({ msg: `El ingrediente con ID ${comp.variantId} no existe` });
      }
    }

    // Crear combo base
    const combo = await Combo.create({ name, description, price });

    // Asociar componentes
    for (const comp of componentes) {
      await ComboComponent.create({
        comboId: combo.id,
        variantId: comp.variantId,
        quantity: comp.quantity
      });
    }

    res.status(201).json({ msg: "Combo creado correctamente", comboId: combo.id });
  } catch (error) {
    console.error("Error creando combo:", error);
    res.status(500).json({ msg: "Error al crear el combo" });
  }
};



export const getAllCombos = async (req, res) => {
  try {
    const combos = await Combo.findAll();
    res.json(combos);
  } catch (error) {
    console.error("Error al obtener todos los combos:", error);
    res.status(500).json({ msg: "Error al obtener todos los combos" });
  }
};


export const getComboItems = async (req, res) => {
  try {
    const combos = await Combo.findAll({
      include: {
        model: ComboComponent,
        as: "components",
        include: {
          model: productVariant,
          as: "component",
          include: {
            model: Products,
            as: "Product", // alias de relación en ProductVariant
            attributes: ["name"]
          }
        }
      }
    });

    res.json(combos);
  } catch (error) {
    console.error("Error al obtener combos:", error);
    res.status(500).json({ msg: "Error al obtener los combos" });
  }
};

