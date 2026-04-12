import { Favorite } from "../Models/favorite.model.js";
import { Account } from "../Models/account.model.js";

// =====================================================
// GET /favorites — listar favoritos del usuario
// =====================================================
export const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, total: favorites.length, favorites });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener favoritos", error: error.message });
    }
};

// =====================================================
// POST /favorites — agregar cuenta a favoritos
// Body: { accountNumber, alias }
// =====================================================
export const addFavorite = async (req, res) => {
    try {
        const { accountNumber, alias } = req.body;

        if (!accountNumber || !alias) {
            return res.status(400).json({ message: "accountNumber y alias son obligatorios" });
        }

        // Verificar que la cuenta destino existe
        const account = await Account.findOne({ accountNumber });
        if (!account) {
            return res.status(404).json({ message: "La cuenta no existe" });
        }

        // No se puede agregar la propia cuenta como favorito
        if (account.userId === req.user.id) {
            return res.status(400).json({ message: "No puedes agregar tu propia cuenta como favorito" });
        }

        const favorite = new Favorite({
            userId: req.user.id,
            accountNumber,
            alias: alias.trim()
        });

        await favorite.save();

        res.status(201).json({ success: true, message: "Favorito agregado", favorite });
    } catch (error) {
        // Error de índice único: cuenta ya en favoritos
        if (error.code === 11000) {
            return res.status(400).json({ message: "Esta cuenta ya está en tus favoritos" });
        }
        res.status(500).json({ message: "Error al agregar favorito", error: error.message });
    }
};

// =====================================================
// PUT /favorites/:id — actualizar alias de un favorito
// =====================================================
export const updateFavorite = async (req, res) => {
    try {
        const { alias } = req.body;
        if (!alias) return res.status(400).json({ message: "El alias es obligatorio" });

        const favorite = await Favorite.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },   // solo el dueño puede editar
            { alias: alias.trim() },
            { new: true }
        );

        if (!favorite) return res.status(404).json({ message: "Favorito no encontrado" });

        res.json({ success: true, message: "Favorito actualizado", favorite });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar favorito", error: error.message });
    }
};

// =====================================================
// DELETE /favorites/:id — eliminar favorito
// =====================================================
export const deleteFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id     // solo el dueño puede eliminar
        });

        if (!favorite) return res.status(404).json({ message: "Favorito no encontrado" });

        res.json({ success: true, message: "Favorito eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar favorito", error: error.message });
    }
};