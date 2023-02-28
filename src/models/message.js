import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
    message: {
        type: String,
        required: true

    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true

    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})


const Message = mongoose.model('message', MessageSchema)
export default Message