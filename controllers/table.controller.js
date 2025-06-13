import { v4 as uuidv4 } from "uuid";
import Table from "../models/table.js";


export const createTable = async (req, res) => {
    try {
      const { location , seats,number } = req.body;
  
      if (!location) return res.status(400).json({ msg: "La ubicacion es requerida" });
  
      const newTable = await Table.create({
        id: uuidv4(),
        location,
        seats,
        number,
        status: "disponible" // por defecto
      });
  
      res.status(201).json({ msg: "Mesa creada exitosamente", table: newTable });
    } catch (error) {
      console.error("Error al crear mesa:", error);
      res.status(500).json({ msg: "Error al crear la mesa" });
    }
  };


  
export const reserveTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json({ msg: "Mesa no encontrada" });
    }

    if (table.status !== "disponible") {
      return res.status(400).json({ msg: "La mesa no está disponible para reservar" });
    }

    table.status = "reservada";
    await table.save();

    res.json({ msg: "Mesa reservada exitosamente", table });
  } catch (error) {
    console.error("❌ Error al reservar mesa:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

  export const getAllTables = async (req, res) => {
    try {
      const tables = await Table.findAll();
      res.status(200).json({ tables });
    } catch (error) {
      console.error("Error al obtener las mesas:", error);
      res.status(500).json({ msg: "Error al obtener las mesas" });
    }
  }