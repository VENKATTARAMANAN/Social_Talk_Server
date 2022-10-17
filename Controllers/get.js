const asyncHandler = require("express-async-handler")
const User = require('../Schema/userSchema')
const generateToken = require('../config/generateToken')
const Chat = require("../Schema/chatSchema")
const Msg = require("../Schema/messageSchema")

const AllUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ]
    } : {}

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users)
})

const GetChats = asyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password").populate("groupAdmin", "-password").populate("latestMsg")
            .sort({ updatedAt: -1 }).then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMsg.sender",
                    select: "name pic email",
                })
                res.status(200).send(results)
            })
    } catch (error) {
        res.status(400).json({ message: "Something wrong at GetChats api route" })
    }
})

const GetAllMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Msg.find({ chat: req.params.chatId }).populate("sender", "name pic email").populate("chat")
        res.json(messages)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = { AllUsers, GetChats, GetAllMessages }