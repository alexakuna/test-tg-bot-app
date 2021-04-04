const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('TelegramBotUsers', userSchema)
