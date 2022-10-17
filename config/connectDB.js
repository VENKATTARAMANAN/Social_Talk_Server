const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log(`MongoDb connected at ${connection.connection.host}`);
    } catch (error) {
        console.log(error.message);
        process.exit()
    }
}

module.exports = connectDB