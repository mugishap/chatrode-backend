import express from 'express'
import http from "http"
import { config } from 'dotenv'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { connectDB } from './src/utils/db.util.js'
import cors from 'cors'
import options from './src/utils/cors.util.js'
import authRouter from './src/routes/auth.route.js'
import userRouter from './src/routes/user.route.js'
import { Server } from 'socket.io'
import Message from './src/models/message.js'
import { ApiResponse } from './src/responses/api.response.js'
import swaggerUi from 'swagger-ui-express'
import swaggerFile from './src/docs/swagger.json' assert { type: "json" };

config()
connectDB()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cors(options));
app.use(cors({ origin: "*   " }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.use("*", (req, res) => {
    res.status(404).json(new ApiResponse(false, "Route not found", null));
});

server.listen(PORT, (err) => {
    if (err) throw new Error("[LOG]: Server failed to start")
    console.log(`[LOG]:Server started successfully ${PORT}`)
})


//Socket IO
const io = new Server(server, {
    cors: options,
})
io.on("connection", (socket) => {
    socket.on("new-message", async (content, receiver, sender) => {
        const message = new Message({
            message: content,
            receiver,
            sender
        })
        await message.save()
        const messages = await Message.find({ sender, receiver })
        io.to(receiver).emit("new-messages", messages)
        socket.broadcast.emit("notification", receiver, message)
    })
})