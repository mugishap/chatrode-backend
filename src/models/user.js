import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
        maxlength: 40
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
    online: {
        type: Boolean,
        default: false,
        required: false
    },
    role: {
        type: String,
        enum: ["ADMIN", "NORMAL"],
        default: "NORMAL"
    },
    profileStatus: {
        type: String,
        required: false
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
export default User