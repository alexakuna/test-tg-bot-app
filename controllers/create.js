const { Telegraf } = require('telegraf')
const User = require('../models/User')
const TelegramBotUsers = require('../models/TelegramBotUsers')
const conf = require('../config')

const bot = new Telegraf(conf.token)

module.exports.create = async function (req, res) {
    const candidate = await User.findOne({email: req.body.email})

    if (candidate) {
        res.status(409).json({
            message: `Пользователь с email - ${req.body.email} уже есть.`
        })
    } else {
        const user = new User(req.body)
        try {
            await user.save()
            const tUsers = await TelegramBotUsers.find({}, 'id').exec()
            const appUser = await User.findOne({email: req.body.email})
            for await (let user of tUsers) {
                await bot.telegram.sendMessage(
                    user.id,
            `В системе появился новый пользователь. id пользователя - ${appUser._id}`
                )
            }
            res.status(201).json(user)
        } catch (e) {
            console.log(e)
            res.status(500).json({message: e.message})
        }
    }
}
