import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        required: false,
        default: ""
    },
    coverImage: {
        type: String,
        required: false,
        default: ""
    },
    role: {
        type: String,
        enum: ["ADMIN", "NORMAL"],
        default: "NORMAL"
    },
    password: {
        type: String,
        required: true
    },
    verification: {
        type: String
    },
    passwordReset: {
        type: String,
    },
    createdAt: {
        type: String,
        default: Date.now()
    },
    updatedAt: {
        type: String,
        default: Date.now()
    }
})


const User = mongoose.model('user', UserSchema)
export { User }