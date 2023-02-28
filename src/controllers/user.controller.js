import { ApiResponse } from "../responses/api.response.js"
import { CreateUserSchema, UpdateUserSchema } from "../validator/index.js"
import bcrypt from "bcryptjs"
import { config } from "dotenv"
import User from "../models/user.js"
import Verification from "../models/verification.js"

config()
const HASH_SALT = process.env.HASH_SALT

const registerUser = async (req, res) => {
    try {
        const { error } = CreateUserSchema(req.body)
        if (error) return res.status(400).json(new ApiResponse(false, error.details[0].message, null))
        const { fullname, username, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, HASH_SALT)
        const user = new User({
            fullname,
            username,
            email,
            password: hashedPassword
        })
        await user.save()
        return res.status(201).json(new ApiResponse(true, "User created successfully", null))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        return res.status(200).json(new ApiResponse(true, "All users", users))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        return res.status(200).json(new ApiResponse(true, "User found", user))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

export const updateUserById = async (req, res) => {
    try {
        const { error } = UpdateUserSchema(req.body)
        if (error) return res.status(400).json(new ApiResponse(false, error.details[0].message, null))
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        const { fullname, username, email, avatar, coverImage } = req.body
        const anotherUser = await User.find({ $or: [{ username }, { email }] })
        if (anotherUser.length > 0) return res.status(400).json(new ApiResponse(false, "Username or email already exists", null))
        user.fullname = fullname
        user.username = username
        user.email = email
        user.avatar = avatar
        user.coverImage = coverImage
        await user.save()

        const verification = await Verification.findOne({ user: user._id })
        verification.verified = false
        verification.save()
        
        return res.status(200).json(new ApiResponse(true, "User updated successfully", user))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

export const updateProfileStatus = async (req, res) => {
    try {
        const { profileStatus } = req.body
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        user.profileStatus = profileStatus
        await user.save()
        return res.status(200).json(new ApiResponse(true, "Profile status updated successfully", user))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

export const deleteUserByAdmin = async (req, res) => {
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

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        await user.delete()
        return res.status(200).json(new ApiResponse(true, "User deleted successfully", null))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

