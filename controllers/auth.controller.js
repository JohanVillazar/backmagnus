import Users from '../models/Users.js';
import Sucursal from '../models/sucursal.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const { name, lastName, email, phone, password, role,SucursalId } = req.body;
    if (!SucursalId) return res.status(400).json({ msg: "SucursalId es obligatorio" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{1,10}$/;

    try {
        
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                msg: "La contraseña debe tener como máximo 10 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial."
            });
        }

        const existing = await Users.findOne({ where: { email } });
        if (existing) return res.status(400).json({ msg: "El usuario ya existe" });

        const hashedPassword = await bcrypt.hash(password, 10);
        await Users.create({ name, lastName, email, phone, password: hashedPassword, role, SucursalId });

        res.status(200).json({ msg: "El usuario se ha creado correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

 
export const login = async (req, res) => {

    
    const {email, password}= req.body; 

    try{
        const user = await Users.findOne({ where: {email}});

        if(!user) return res.status(400).json({ msg: "El usuario no existe"});

        const valisPass = await bcrypt.compare(password, user.password);
        if(!valisPass) return res.status(400).json({ msg: "Credensiales incorrectas"});

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '4h' });

        res.json({ token, user: {id: user.id, name: user.name, lastName: user.lastName, email: user.email, role: user.role} });

    } catch (error) {
        res.status(500).json({ msg: "Error al iniciar sesión", error });

    }
}

export const getAllUsers = async (req, res) => {
    try {
      
      const users = await Users.findAll({
        attributes: ['id', 'name', 'lastName', 'email', 'phone', 'role'],
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ msg: "Error al obtener usuarios", error });
    }
  };