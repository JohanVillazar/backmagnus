import  Category  from "../models/Category.js";

export const createCategory = async (req, res) => {
    try {
        const { name, logo } = req.body;
        const newCategoria = await Category.create({ name, logo });

        res.status(201).json({ msg: "Categoria creada correctamente" });
    } catch (error) {

        res.status(500).json({ msg: "Error al crear la categoria", error });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener las categorias", error });
    }
};
 