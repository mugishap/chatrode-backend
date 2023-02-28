import express from 'express'
import http from "http"
import { config } from 'dotenv'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { connectDB } from './src/utils/db.util.js'

config()
connectDB()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(cookieParser())


server.listen(PORT, (err) => {
    if (err) throw new Error("[LOG]: Server failed to start")
    console.log(`[LOG]:Server started successfully ${PORT}`)
})