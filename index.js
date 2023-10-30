const express = require("express");
const app = express();
app.use(express.json())
const cors = require("cors")
app.use(cors({ origin: "*" }))
require("dotenv").config()
const connectDB = require('./config/connectDB')
const userRoutes = require('./Routes/userRoutes')
const chatRoutes = require('./Routes/chatRoutes')
const messagesRoutes = require('./Routes/messagesRoutes')

app.get('/', (req, res) => {
    res.send("server is working")
})

app.use('/user', userRoutes)
app.use('/chat', chatRoutes)
app.use('/messages', messagesRoutes)

connectDB()

const server = app.listen(process.env.PORT || 4444, () => console.log("Server is running on port:4444"))

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket) => {
    console.log("Connected to socket.io successfully!");

    socket.on("setup", (userData) => {
        if (userData) {
            socket.join(userData._id)
            socket.emit("connection")
        }
    })

    socket.on("join chat", (room) => {
        socket.join(room)
    })

    socket.on("typing", (room) => socket.in(room).emit("typing"))
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach(user => {
            if (user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved)
        })

    })

    socket.off("setup", () => {
        console.log("User disconnected !");
        socket.leave(userData._id)
    })

})
