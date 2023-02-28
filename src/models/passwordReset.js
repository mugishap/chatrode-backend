import mongoose, { Schema } from "mongoose";

const PasswordResetSchema = Schema({
    user: {
        type: String,
        required: true,
    },
    passwordResetToken: {
        type: String,
    },
    expiresAt: {
        type: String
    },
    lastResetAt: {
        type: String,
    }
})

const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema)
export default PasswordReset