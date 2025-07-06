import express from "express";
import sequelize from "../config/db.js";
import Users from "./Users.js";
import Category from "./Category.js";
import Suppliers from "./suppliers.js";
import Customers from "./customers.js";
import Products from "./products.js";
import productVariant from "./productVariant.js";
import CashRegister from "./cashregister.js";
import CashMovement from "./cashmovement.js";
import Sale from "./sale.js";
import SaleDetail from "./saleDetail.js";
import Sucursal from "./sucursal.js";
import Purchase from "./purchase.js";
import PurchaseDetail from "./purchasedetail.js";
import CashRegisterProduct from "./cashRegisterProduct.js";
import Table from "./table.js";
import Order from "./order.js";
import OrderDetail from "./orderdetail.js";
import ComboComponent from "./ComboComponent.js";
import Combo from "./combo.js";

// Define associations
Products.hasMany(productVariant, { foreignKey: "productId", as: "Variants" });
productVariant.belongsTo(Products, { foreignKey: "productId", as: "Product" });

Users.hasMany(CashRegister, { foreignKey: "userId" });
CashRegister.belongsTo(Users, { foreignKey: "userId" });

CashRegister.hasMany(CashMovement, { foreignKey: "cashRegisterId" });
CashMovement.belongsTo(CashRegister, { foreignKey: "cashRegisterId" });

Users.hasMany(Sale, { foreignKey: "userId" });
Sale.belongsTo(Users, { foreignKey: "userId" });

Customers.hasMany(Sale, { foreignKey: "customerId" });
Sale.belongsTo(Customers, { foreignKey: "customerId" });

CashRegister.hasMany(Sale, { foreignKey: "cashRegisterId" });
Sale.belongsTo(CashRegister, { foreignKey: "cashRegisterId" });

Sale.hasMany(SaleDetail, { foreignKey: "saleId" });
SaleDetail.belongsTo(Sale, { foreignKey: "saleId" });

Sucursal.hasMany(Purchase, { foreignKey: 'SucursalId' });
Purchase.belongsTo(Sucursal, { foreignKey: 'SucursalId' });

Users.hasMany(Purchase, { foreignKey: 'userId' });
Purchase.belongsTo(Users, { foreignKey: 'userId' });

SaleDetail.belongsTo(productVariant, { foreignKey: "variantId" });
productVariant.hasMany(SaleDetail, { foreignKey: "variantId" });

Purchase.hasMany(PurchaseDetail, { foreignKey: 'purchaseId', onDelete: 'CASCADE' });
PurchaseDetail.belongsTo(Purchase, { foreignKey: 'purchaseId' });

productVariant.hasMany(PurchaseDetail, { foreignKey: 'variantId' });
PurchaseDetail.belongsTo(productVariant, { foreignKey: 'productVariantId' });

CashRegister.hasMany(CashRegisterProduct, { foreignKey: 'cashRegisterId' });
CashRegisterProduct.belongsTo(CashRegister, { foreignKey: 'cashRegisterId' });

CashRegisterProduct.belongsTo(productVariant, { foreignKey: 'variantId' });
productVariant.hasMany(CashRegisterProduct, { foreignKey: 'variantId' });

Table.hasMany(Order, { foreignKey: "tableId" });
Order.belongsTo(Table, { foreignKey: "tableId" });

Users.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(Users, { foreignKey: "userId" });

CashRegister.hasMany(Order, { foreignKey: "cashRegisterId" });
Order.belongsTo(CashRegister, { foreignKey: "cashRegisterId" });

Order.hasMany(OrderDetail, { foreignKey: "orderId", as: "details" });
OrderDetail.belongsTo(Order, { foreignKey: "orderId" });

productVariant.hasMany(OrderDetail, { foreignKey: "variantId" });
OrderDetail.belongsTo(productVariant, { foreignKey: "variantId" });

//relacion combo-categorias
Combo.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasMany(Combo, { foreignKey: "categoryId" });

//combos
Combo.hasMany(ComboComponent, {
  foreignKey: "comboId",
  as: "components" // alias para incluir los ingredientes del combo
});



// ComboComponent -> Combo
ComboComponent.belongsTo(Combo, {
  foreignKey: "comboId"
});

// ComboComponent -> ProductVariant (el ingrediente real)
ComboComponent.belongsTo(productVariant, {
  foreignKey: "variantId", // campo que usás al guardar ingredientes
  as: "component"          // alias que usás en el include
});

//ordercombo
OrderDetail.belongsTo(Combo, {
  foreignKey: "comboId",
  as: "combo"
});

//combo saledetail

SaleDetail.belongsTo(Combo, {
  foreignKey: "comboId",
  as: "combo"
});

// relacion compras suppliers
Purchase.belongsTo(Suppliers, { foreignKey: "SupplierId" });
Suppliers.hasMany(Purchase, { foreignKey: "SupplierId" });

//relacion usuario sucursal
Users.belongsTo(Sucursal, { foreignKey: "SucursalId" });
Sucursal.hasMany(Users, { foreignKey: "SucursalId" });

//relacion sucursal prodcuto
Products.belongsTo(Sucursal, {
  foreignKey: 'SucursalId',
  as: 'Sucursal',
});

Sucursal.hasMany(Products, {
  foreignKey: 'SucursalId',
  as: 'Products',
});












// Sync database with optimized options
const syncDB = async () => {
  try {
    await sequelize.authenticate(); // 🔍 Verifica la conexión
    console.log("✅ Conexión a la base de datos establecida correctamente");

    await sequelize.sync({ force: false }); // 🗂️ Sincroniza modelos sin borrar datos
    console.log("✅ Base de datos sincronizada");
  } catch (error) {
    console.error("❌ Error al conectar o sincronizar la base de datos:", error);
    process.exit(1); // 🛑 Salida del proceso si falla
  }
};

syncDB();


export {
  sequelize,
  Users,
  Category,
  Suppliers,
  Customers,
  Products,
  productVariant,
  CashRegister,
  CashMovement,
  Sale,
  SaleDetail,
  Sucursal,
  Purchase,
  Table,
  Order,
  OrderDetail,
  CashRegisterProduct
};
