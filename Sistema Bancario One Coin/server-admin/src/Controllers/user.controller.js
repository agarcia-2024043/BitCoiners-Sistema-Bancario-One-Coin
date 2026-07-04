import { User } from "../Models/user.model.js";

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json({ success: true, total: users.length, users });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};