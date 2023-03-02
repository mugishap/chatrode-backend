import bcrypt from "bcryptjs"
import { config } from "dotenv"
import mongoose from "mongoose"
import PasswordReset from "../models/passwordReset.js"
import User from "../models/user.js"
import Verification from "../models/verification.js"

config()

const DATABASE_URL = process.env.DATABASE_URL

const admin =
{
    fullname: "Admin 1",
    username: "adminpops",
    email: "adminpops@gmail.com",
    password: "admin@pass123"
}


export const connectDB = async () => {

    mongoose.set('strictQuery', true)
    await mongoose.connect(DATABASE_URL, {
        dbName: "chatrode",
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }, (err) => {
        if (err) throw new Error("Failed to connect to database")
        console.log("[LOG]:Database connection successful");
    })
    const _user = await User.findOne({ email: "adminpops@gmail.com", mobile: "+250782307144" })
    if (_user) return
    const hashed = await bcrypt.hash("admin@pass123", parseInt(process.env.SALT_ROUNDS))
    const user = {
        fullname: "Admin 1",
        username: "adminpops",
        email: "adminpops@gmail.com",
        password: hashed,
        role: "ADMIN"
    }

    const newUser = new User(user);
    await newUser.save();
    const verification = await new Verification({
        user: newUser._id
    })
    const passwordReset = await new PasswordReset({
        user: newUser._id
    })
    await verification.save()
    await passwordReset.save()
    console.log("Database seeded successfully")
}