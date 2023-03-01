import { ApiResponse } from "../responses/api.response.js"
import { CreateUserSchema, UpdateUserSchema } from "../validator/index.js"
import bcrypt from "bcryptjs"
import { config } from "dotenv"
import User from "../models/user.js"
import Verification from "../models/verification.js"
import PasswordReset from '../models/passwordReset.js'
import jwt from "jsonwebtoken"

config()
const HASH_SALT = process.env.HASH_SALT
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const registerUser = async (req, res) => {
    try {
        const { error } = CreateUserSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(false, error.details[0].message, null))
        const { fullname, username, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 8)
        const user = new User({
            fullname,
            username,
            email,
            password: hashedPassword
        })
        await user.save()
        const verification = await new Verification({
            user: user._id
        })
        const passwordReset = await new PasswordReset({
            user: user._id
        })
        await verification.save()
        await passwordReset.save()
        const token = await jwt.sign({ id: user._id, role: user.role }, JWT_SECRET_KEY, { expiresIn: "31d" })
        return res.status(201).json(new ApiResponse(true, "User created successfully", { user, verification, token }))
    } catch (error) {
        console.log(error.message)
        const regex = /index:\s+(\w+)_\d+\s+/;
        if (error.message.includes(" duplicate key error collection")) return res.status(500).json(new ApiResponse(false, `${(error.message.match(regex)[1])} already exists`, error))
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", error))
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        return res.status(200).json(new ApiResponse(true, "All users", { count: users.length, users }))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        return res.status(200).json(new ApiResponse(true, "User found", user))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const updateUserById = async (req, res) => {
    try {
        const { error } = UpdateUserSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(false, error.details[0].message, null))
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        const { fullname, username, email, avatar, coverImage } = req.body
        if (email != user.email) {
            const verification = await Verification.findOne({ user: user._id })
            verification.verified = false
            verification.save()
        }

        user.fullname = fullname
        user.username = username
        user.email = email
        user.avatar = avatar
        user.coverImage = coverImage
        user.updatedAt = Date.now()
        await user.save()
        const verification = await Verification.findOne({ user: user._id })
        return res.status(200).json(new ApiResponse(true, "User updated successfully", { user, verification }))
    } catch (error) {
        console.log(error.message)
        const regex = /index:\s+(\w+)_\d+\s+/;
        if (error.message.includes(" duplicate key error collection")) return res.status(500).json(new ApiResponse(false, ` ${(error.message.match(regex)[1])} already exists`, error))
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", error))
    }
}

const updateProfileStatus = async (req, res) => {
    try {
        const { profileStatus } = req.body
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        user.profileStatus = profileStatus
        await user.save()
        const verification = await Verification.findOne({ user: user._id })
        return res.status(200).json(new ApiResponse(true, "Profile status updated successfully", { user, verification }))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const deleteUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        await user.delete()
        return res.status(200).json(new ApiResponse(true, "User deleted successfully", null))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        const { password } = req.body
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json(new ApiResponse(false, "Incorrect password", null))
        await Verification.findByIdAndDelete(user.verification)
        await PasswordReset.findByIdAndDelete(user.passwordReset)
        await User.findByIdAndDelete(user._id)
        return res.status(200).json(new ApiResponse(true, "User deleted successfully", null))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const getUserReport = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        const verification = await Verification.findOne({ user: user._id })
        const passwordReset = await PasswordReset.findOne({ user: user._id })
        return res.status(200).json(new ApiResponse(true, "User report fetched successfully", { user, verification, passwordReset }))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const searchUser = async (req, res) => {
    try {
        const { query } = req.params
        const users = await User.find({ $or: [{ username: (new RegExp(`${query}`)) }, { email: (new RegExp(`${query}`)) }, { fullname: (new RegExp(`${query}`)) }] })
        return res.status(200).json(new ApiResponse(true, "Users searched successfully", { users }))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body
        if (!avatar) return res.status(400).json(new ApiResponse(false, "No image provided", null))
        const user = await User.findById(req.user.id)
        user.avatar = avatar;
        user.save()
        const verification = await Verification.findOne({ user: user._id })
        return res.status(200).json(new ApiResponse(true, "Avatar updated successfully", { user, verification }))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const userController = {
    registerUser,
    getAllUsers,
    getUserById,
    updateUserById,
    updateProfileStatus,
    deleteUserByAdmin,
    deleteUser,
    getUserReport,
    searchUser,
    updateAvatar
}

export default userController