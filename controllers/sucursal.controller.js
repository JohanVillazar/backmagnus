import sequelize from "../config/db.js";
import  Sucursal  from "../models/sucursal.js";


export const createSucursal = async (req, res) => {

    try{
        const {name,email,phone,address,city,manager} = req.body;

        const newSucursal = await Sucursal.create({name,email,phone,address,city,manager});

        res.status(201).json({msg:"Sucursal creada correctamente"});

    }catch(error){
        res.status(500).json({msg:"Error al crear la sucursal", error});
    }

};

export const getAllSucursales = async (req, res) => {
    try{
        const sucursales = await Sucursal.findAll();
        res.json(sucursales);
    }catch(error){
        res.status(500).json({msg:"Error al obtener las sucursales", error});
    }
}