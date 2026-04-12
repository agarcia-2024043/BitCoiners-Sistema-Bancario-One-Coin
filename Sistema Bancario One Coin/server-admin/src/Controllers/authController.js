import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// =====================================================
// REGISTRO - NO exponer password
// =====================================================
export const register = async (req, res) => {
    try {
        const { name, email, password, roles } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: "Todos los campos son obligatorios" 
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                error: "El email ya está registrado" 
            });
        }

        // Crear usuario - el hash se hace en el pre('save') hook
        const user = await User.create({ 
            name: name.trim(), 
            email: email.toLowerCase(), 
            password,  // ← Sin hashear aquí
            roles: roles || 'USER'
        });
        
        // ✅ NO exponer password
        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                createdAt: user.createdAt
            }
        });
        
    } catch (err) {
        console.error("Error en registro:", err);
        res.status(400).json({ error: err.message });
    }
};

// =====================================================
// LOGIN
// =====================================================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                error: "Email y contraseña son obligatorios" 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ 
                error: "Credenciales inválidas" 
            });
        }

        console.log("Password ingresada:", password);
        console.log("Password en BD:", user.password);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        console.log("¿Password válida?:", isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: "Credenciales inválidas" 
            });
        }

        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                roles: user.roles
            },
            process.env.JWT_SECRET || 'tu_secreto_aqui',
            { expiresIn: '8h' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles
            }
        });
        
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

