import { User } from "../models/user.model.js";

import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
    try {
        const { name, email, password, roles } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "El email ya está registrado" });
        }

        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, // Guardamos la versión secreta
            roles: roles || "USER" 
        });

        await newUser.save();
        const { password: _, ...userWithoutPassword } = newUser.toObject();
        res.status(201).json({ success: true, user: userWithoutPassword });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear usuario" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json({ success: true, total: users.length, users });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};