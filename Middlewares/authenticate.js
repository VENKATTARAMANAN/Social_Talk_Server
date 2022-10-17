const asyncHandler = require("express-async-handler")
const User = require('../Schema/userSchema')
const jwt = require("jsonwebtoken")

const authenticate = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            res.status(401).json({ message: "Not_authorized" })
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not_authorized" })
    }
})

module.exports = { authenticate }