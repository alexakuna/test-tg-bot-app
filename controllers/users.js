const { Telegraf } = require('telegraf')
const User = require('../models/User')
const TelegramBotUsers = require('../models/TelegramBotUsers')

const conf = require('../config')

const bot = new Telegraf(conf.token)

module.exports.removeUser = async function (req, res) {

    try {
        const appUser = await User.findOne({email: req.body.email})
        const user = await User.findOneAndRemove({email: req.body.email})
        const tUsers = await TelegramBotUsers.find({}, 'id').exec()
        for await (let user of tUsers) {
            await bot.telegram.sendMessage(
                user.id,
                `Пользователь был удален. id - ${appUser._id}`
            )
        }
        res.status(200).json(user)
    } catch (e) {
        console.log(e)
        res.status(500).json(e)
    }

}
module.exports.updateUser = async function (req, res) {

    try {
        const appUser = await User.findOne({email: req.body.email})
        const user = await User.findOneAndReplace({email: req.body.email}, req.body, {new: true})
        const tUsers = await TelegramBotUsers.find({}, 'id').exec()
        for await (let user of tUsers) {
            await bot.telegram.sendMessage(
                user.id,
                `Данные пользователя были изменены. id - ${appUser._id}`
            )
        }
        res.status(200).json(user)
    } catch (e) {
        console.log(e)
        res.status(500).json(e)
    }

}
module.exports.getUsers = async function (req, res) {
    try {
        const users = await User.find({})
        res.status(200).json(users)
    } catch (e) {
        console.log(e)
        res.status(500).json(e)
    }

}
