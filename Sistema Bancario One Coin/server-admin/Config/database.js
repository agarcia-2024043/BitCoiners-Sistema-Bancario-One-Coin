import mongoose from "mongoose";
import { Role } from "../models/role.model.js"; 

export const connectDB = async () => {
    try {
        // Cambiamos la URL de la nube por la de tu Docker local
        await mongoose.connect("mongodb://127.0.0.1:27017/sistema_bancario", {
        });

        console.log("¡Base de datos local conectada!");

        const roles = ["User", "Admin"];
        for (const roleName of roles) {
            const roleExists = await Role.findOne({ name: roleName });
                if (!roleExists) {
                    await Role.create({ name: roleName });
                    console.log(`Rol creado: ${roleName}`);
        }
    }

    } catch (error) {
        console.log("Error al conectar a la base de datos:", error.message);
        process.exit(1); 
    }
};