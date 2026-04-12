import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["DEPOSITO", "RETIRO", "TRANSFERENCIA"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    originAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    destinationAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    date: {
        type: Date,
        default: Date.now
    },
    // ── Reversión ──────────────────────────────────────
    status: {
        type: String,
        enum: ["COMPLETADA", "REVERTIDA"],
        default: "COMPLETADA"
    },
    reversedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        default: null          // apunta a la transacción de reversión
    }
});

export const Transaction = mongoose.model("Transaction", transactionSchema);