import mongoose from "mongoose";

const limitSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        unique: true      // un límite por cuenta
    },
    dailyLimit: {
        type: Number,
        required: true,
        min: 0
    },
    perTransactionLimit: {
        type: Number,
        required: true,
        min: 0
    },
    // acumulado del día en curso — se resetea cada día
    dailyUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const Limit = mongoose.model("Limit", limitSchema);