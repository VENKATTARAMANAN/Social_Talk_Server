const express = require("express")
const { AllUsers } = require("../Controllers/get")
const { registerUser, loginUser } = require("../Controllers/post")
const { authenticate } = require("../Middlewares/authenticate")
const router = express.Router()

router.get('/allusers', authenticate, AllUsers)
router.post('/login', loginUser)
router.post('/register', registerUser)


module.exports = router