const express = require("express")
const { GetChats } = require("../Controllers/get")
const { AccessChat } = require("../Controllers/post")
const router = express.Router()
const { authenticate } = require("../Middlewares/authenticate")


router.get('/', authenticate, GetChats)
router.post('/', authenticate, AccessChat)

module.exports = router