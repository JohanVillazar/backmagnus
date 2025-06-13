import Suppliers from "../models/suppliers.js";

export const createSupplier = async (req, res) => {
    
    try{
        const { Nit, company, address, phone, email} = req.body;

        const  Supplier = await Suppliers.create({ Nit, company, address, phone, email});

        res.status(201).json({msg:"Proveedor creado correctamente"});
    }catch(error){
        res.status(500).json({msg:"Error al registrar Proveedor", error});  
    }
}

export const getSuppliers = async (req, res) => {
    try{
        const suppliers = await Suppliers.findAll();
        res.json(suppliers);
    }catch(error){    
        res.status(500).json({msg:"Error al obtener Proveedores", error});  
    }
}