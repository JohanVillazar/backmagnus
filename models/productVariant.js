import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const productVariant = sequelize.define("productVariant", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "Products",
            key: "id",
        },
        
    },
    vatiantName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amountVariant: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    amountinVariant: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unitmeasureVariant: {
        type: DataTypes.ENUM("bolsas", "botella", "sobre", "bulto","unidades","porciones"),
        allowNull: false,
    },
    baseunit: {
        type: DataTypes.ENUM(
            "miligramos","unidades", "gramos", "kilogramos", "mililitros", "litros",
            "galones", "milimetros", "centimetros"
        ),
        allowNull: false,
    },
    priceperVariant: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    priceperUnit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    stockInto: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    totalunitstock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Se inicializa en 0 antes del cálculo automático
    },
},

    {

        tableName: "ProductVariant", 
        freezeTableName: true,
        timestamps: false
    }
);

// ✅ Hook para calcular precio por variante antes de guardar
productVariant.beforeSave((variant) => {
    if (variant.priceperUnit && variant.amountinVariant) {
        variant.priceperVariant = variant.priceperUnit * variant.amountinVariant;
    }
});

// ✅ Hook para calcular stock inicial solo cuando se crea
productVariant.beforeCreate((variant) => {
    if (variant.amountVariant && variant.amountinVariant) {
        variant.totalunitstock = variant.amountVariant * variant.amountinVariant;
    }
});

// ✅ Hook para actualizar totalunitstock cuando hay una compra
productVariant.beforeUpdate((variant) => {
    if (variant.changed("stockInto")) {
        variant.totalunitstock += variant.stockInto;
    }
});

export default productVariant;
