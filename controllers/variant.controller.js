import productVariant from "../models/productVariant.js";
import Products from "../models/products.js";

export const createVariant = async (req, res) => {
    try {
        const {
            productId,
            vatiantName,
            amountVariant,
            amountinVariant,
            unitmeasureVariant,
            baseunit,
            priceperUnit,
            
        } = req.body;

        // Validar datos obligatorios
        if (!productId || !vatiantName || !amountVariant || !amountinVariant || !unitmeasureVariant || !baseunit  || !priceperUnit ) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Crear la variante (el hook `beforeSave` calculará totalunitstock automáticamente)
        const newVariant = await productVariant.create({
            productId,
            vatiantName,
            amountVariant,
            amountinVariant,
            unitmeasureVariant,
            baseunit,
            priceperUnit,
           
        });

        return res.status(201).json({
            message: "Variante creada exitosamente",
            variant: newVariant
        });

    } catch (error) {
        console.error("Error al crear la variante:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};




export const getAllVariants = async (req, res) => {
  try {
    const variants = await productVariant.findAll({
      include: {
        model: Products,
        as: "Product",
        attributes: ["id", "name", "description"],
      },
      order: [["productId", "ASC"]],
    });

    const grouped = {};

    variants.forEach((v) => {
      const prodId = v.productId;

      if (!grouped[prodId]) {
        grouped[prodId] = {
          productId: prodId,
          name: v.Product?.name || "Sin nombre",
          description: v.Product?.description || "",
          variants: [],
        };
      }

      grouped[prodId].variants.push({
        id: v.id, 
        vatiantName: v.vatiantName,
        amountVariant: v.amountVariant,
        amountinVariant: v.amountinVariant,
        unitmeasureVariant: v.unitmeasureVariant,
        baseunit: v.baseunit,
        priceperUnit: v.priceperUnit,
        totalunitstock: v.totalunitstock,
      });
    });

    return res.json(Object.values(grouped));
  } catch (error) {
    console.error("Error al obtener las variantes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const UpdateStock = async (req, res) => {
  const { id } = req.params;
  const { stockInto } = req.body;

  console.log(`\n🟡 [${new Date().toISOString()}] 🚨 Entrando a UpdateStock`);
  console.log(`🔑 Variante ID: ${id}, Stock a ingresar: ${stockInto}`);

  try {
    const variant = await productVariant.findByPk(id);

    if (!variant) {
      console.warn(`⚠️ Variante con ID ${id} no encontrada`);
      return res.status(404).json({ message: "Presentación no encontrada" });
    }

    const entrada = Number(stockInto);
    const stockAnterior = variant.totalunitstock;

    console.log(`📦 Stock anterior: ${stockAnterior}`);
    console.log(`➕ Sumando entrada: ${entrada}`);
    console.log(`🧮 Nuevo stock debería ser: ${stockAnterior + entrada}`);

    variant.totalunitstock += entrada;
    variant.stockInto = entrada;
    await variant.save();

    console.log(`✅ Stock actualizado correctamente`);
    console.log(`📈 totalunitstock final: ${variant.totalunitstock}`);

    res.json({
      msg: "Stock actualizado",
      totalunitstock: variant.totalunitstock,
      stockInto: variant.stockInto,
    });
  } catch (error) {
    console.error(`❌ Error al actualizar el stock para variante ${id}:`, error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getEnumUnits = (req, res) => {
  const unitMeasureOptions = [
    "bolsas", "botella", "sobre", "bulto", "unidades", "porciones"
  ];

  const baseUnitOptions = [
    "miligramos", "unidades", "gramos", "kilogramos",
    "mililitros", "litros", "galones", "milimetros", "centimetros"
  ];

  res.json({ unitMeasureOptions, baseUnitOptions });
};



