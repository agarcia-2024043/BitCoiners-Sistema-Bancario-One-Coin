import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
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
    // Nombre personalizado que el cliente le da a la cuenta
    name: {
        type: String,
        trim: true,
        maxlength: 40,
        default: ""
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

export const Account = mongoose.model("Account", accountSchema);