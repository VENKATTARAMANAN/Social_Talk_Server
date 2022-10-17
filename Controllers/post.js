const asyncHandler = require("express-async-handler")
const generateToken = require('../config/generateToken')
const Chat = require("../Schema/chatSchema")
const Msg = require("../Schema/messageSchema")
const User = require("../Schema/userSchema")

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400).json({ message: "User_already_exists" })
    }

    const user = await User.create({ name, email, password, pic })

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(400).json({ message: "Failed_to_create_a_user" })
    }
})


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const checkUser = await User.findOne({ email })

    if (checkUser && (await checkUser.checkPassword(password))) {
        res.json({
            _id: checkUser._id,
            name: checkUser.name,
            email: checkUser.email,
            pic: checkUser.pic,
            token: generateToken(checkUser._id),
        })
    } else {
        res.status(401).json({ message: "Invalid_Email_or_Password" })
    }
})

const AccessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        console.log("UserId param not send with request");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ]
    }).populate("users", "-password").populate("latestMsg")

    isChat = await User.populate(isChat, {
        path: "latestMsg.sender",
        select: "name pic email",
    })

    if (isChat.length > 0) {
        res.send(isChat[0])
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        }
        try {
            const createNewChat = await Chat.create(chatData)
            const fullChat = await Chat.findOne({ _id: createNewChat._id }).populate("users", "-password")
            res.status(200).send(fullChat)
        } catch (error) {
            res.status(400).json({ message: "existed" })
        }
    }
})

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body

    if (!content || !chatId) {
        console.log("Invalid data passed into request!");
        return res.sendStatus(400)
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }

    try {
        var message = await Msg.create(newMessage)
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email"
        })

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMsg: message
        })
        res.json(message)

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = { registerUser, loginUser, AccessChat, sendMessage }