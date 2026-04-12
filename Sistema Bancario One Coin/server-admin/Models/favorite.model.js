import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    alias: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    }
}, { timestamps: true });

// Un usuario no puede tener el mismo número de cuenta dos veces en favoritos
favoriteSchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", favoriteSchema);