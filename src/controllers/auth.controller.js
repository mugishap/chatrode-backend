import { config } from "dotenv"
import User from "../models/user"
import PasswordReset from "../models/passwordReset"
import Verification from "../models/verification"
import { sendAccountVerificationEmail, sendPaswordResetEmail } from "../utils/mail.util"
import bcrypt from 'bcryptjs'

config()
const HASH_SALT = process.env.HASH_SALT
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const login = async (req, res) => {
    try {
        const { error } = LoginSchema(req.body)
        if (error) return res.status(400).json(new ApiResponse(false, error.details[0].message, null))
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json(new ApiResponse(false, "Incorrect credentials", null))
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) return res.status(404).json(new ApiResponse(false, "Incorrect credentials", null))
        const token = jwt.sign({ id: user._id }, JWT_SECRET_KEY, { expiresIn: "1d" })
        return res.status(200).json(new ApiResponse(true, "Login successful", { user, token }))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const initiateEmailVerification = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))

        const verification = await Verification.findOne({ user: user._id })
        if (verification.verified) return res.status(400).json(new ApiResponse(false, "Account already verified", null))

        const verificationToken = crypto.randomBytes(32).toString("hex")
        const verificationExpiry = Date.now() + 3600000

        verification.verificationToken = verificationToken
        verification.expiresAt = verificationExpiry

        await verification.save()
        const email = await sendAccountVerificationEmail(user.email, user.names, verificationToken)
        return res.status(200).json(new ApiResponse(true, "Verification email sent", { verificationToken, email }))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const initiatePasswordReset = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))

        const passwordReset = await PasswordReset.findOne({ user: user._id })
        if (!passwordReset) {
            const newReset = new PasswordReset({
                user: user._id
            })
            await newReset.save()
        }

        const passwordResetToken = crypto.randomBytes(32).toString("hex")
        const passwordResetExpiry = Date.now() + 3600000

        passwordReset.passwordResetToken = passwordResetToken
        passwordReset.expiresAt = passwordResetExpiry

        await passwordReset.save()
        const sentMail = await sendPaswordResetEmail(user.email, user.names, passwordResetToken)
        return res.status(200).json(new ApiResponse(true, "Password reset email email sent", { passwordResetToken, sentMail }))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { verificationToken } = req.body
        const verification = await Verification.findOne({ verificationToken, verified: false, expiresAt: { $gt: Date.now() } })
        if (!verification) return res.status(404).json(new ApiResponse(false, "Verification token not found", null))
        const user = await User.findById(verification.user)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        verification.verified = true
        verification.expiresAt = null
        verification.verificationToken = null
        await verification.save()
        return res.status(200).json(new ApiResponse(true, "Account verified", user))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

const resetPassword = async (req, res) => {
    try {
        const { passwordResetToken, password } = req.body
        const passwordReset = await PasswordReset.findOne({ passwordResetToken, expiresAt: { $gt: Date.now() } })
        if (!passwordReset) return res.status(404).json(new ApiResponse(false, "Password reset token not found", null))
        passwordReset.passwordResetToken = null
        passwordReset.expiresAt = null
        await passwordReset.save()
        const user = await User.findById(passwordReset.user)
        if (!user) return res.status(404).json(new ApiResponse(false, "User not found", null))
        user.password = await bcrypt.hash(password, HASH_SALT)
        user.save()
        return res.status(200).json(new ApiResponse(true, "Password reset successful", user))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new ApiResponse(false, "Internal Server Error", null))
    }
}

export const authController = {
    login,
    initiateEmailVerification,
    initiatePasswordReset,
    verifyEmail,
    resetPassword
}