const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: {
        type: String,
        default:
            'https://res.cloudinary.com/thoddusamy/image/upload/v1665481225/chat-app/default_avatar/default_avatar_jshf8r.png',
    },
},
    { timestamps: true }
)

userSchema.methods.checkPassword = async function (pass) {
    return await bcrypt.compare(pass, this.password)
}

userSchema.pre('save', async function (next) {
    if (!this.isModified) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model("User", userSchema)

module.exports = User