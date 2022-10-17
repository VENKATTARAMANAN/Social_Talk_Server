const express = require("express")
const { GetAllMessages } = require("../Controllers/get")
const { sendMessage } = require("../Controllers/post")
const { authenticate } = require("../Middlewares/authenticate")

const router = express.Router()

router.get('/:chatId', authenticate, GetAllMessages)
router.post('/', authenticate, sendMessage)

module.exports = router