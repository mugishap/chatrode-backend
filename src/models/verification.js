import mongoose, { Schema } from "mongoose";

const VerificationSchema = Schema({
    user: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        required: false,
        default: false
    },
    verificationToken: {
        type: String,
    },
    expiresAt: {
        type: String
    },
    verifiedAt: {
        type: String,
    }
})
const Verification = mongoose.model("Verification", VerificationSchema)
export default Verification