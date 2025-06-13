import  Products  from "../models/products.js";


export const createProduct = async (req, res) => {
    
    try{

        const { name, description, categoryId, supplierId } = req.body;

        const product = await Products.create({name,description,categoryId,supplierId});
        res.status(201).json({ msg: "Producto creado correctamente", id: product.id });
    }catch(error){
        res.status(500).json({msg:"Error al registrar Producto", error});
    }
}