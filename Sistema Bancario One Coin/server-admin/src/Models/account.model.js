import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
        // Normalizar a minúsculas al guardar — el Guid de .NET siempre
        // llega en minúsculas pero esto lo blindamos a nivel de modelo
        set: (v) => v?.toLowerCase().trim()
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ["ahorro", "monetaria", "corriente"],
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

export const Account = mongoose.model("Account", accountSchema);