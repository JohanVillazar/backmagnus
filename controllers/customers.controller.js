import Customers from "../models/customers.js";


export const createCustomer = async (req, res) => {

    try{
        const {name, lastName, dni, address, city, phone} = req.body;

        const existing = await Customers.findOne({ where: {dni, name, lastName}});
        if(existing) return res.status(400).json({msg: "El cliente ya existe en el sistema"});


        const Customer = await Customers.create({name, lastName, dni, address, city, phone});

        res.status(201).json({msg:"Cliente registrado correctamente"});

    }catch(error){
        res.status(500).json({msg:"Error al registrar Cliente", error});
    }

};
    