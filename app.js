const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const logger = require('morgan')
const conf = require('./config')
const User = require('./models/User')
const cors = require('cors')

const TelegramBotUsers = require('./models/TelegramBotUsers')

mongoose.connect(conf.url, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => console.log('The database is connected'))
    .catch(error => console.log(error))

const { Telegraf } = require('telegraf')

const bot = new Telegraf(conf.token)

bot.start(async (ctx) => {
    const candidate = await TelegramBotUsers.findOne({id: ctx.message.chat.id})
    if(candidate === null) {
        const user = new TelegramBotUsers(ctx.message.chat)
        try {
            await user.save()
        } catch (e) {
            console.log(e)
        }
    }
    await ctx.replyWithHTML(`
    Добро пожаловать в тестовый бот <b>${ctx.message.chat.first_name}</b>!
    Узнать возможности бота можно по команде /help.`)
})
bot.help((ctx) => {

    ctx.reply(
`
    Перечень команд бота:
    /id <Здесь нужно указать id юзера>
    /name <Получение даных юзера по имени. Укажите id юзера>
    /email <Получение даных юзера по email. Укажите email юзера>
    /phone <Получение даных юзера по по номеру телефона. Укажите номер телефона юзера>
    /birthday <Получение даных юзера по по дате рождения. Укажите дату рождения>
    /users <Дополнительные данные вводить не нужно>
`
    )
})

bot.command('id', async (ctx) => {
    const str = ctx.message.text.split(' ')
    if(str.length < 2) return
    try {
        const user = await User.findById(str[1])
        ctx.reply(`Имя: ${user.name},
email: ${user.email},
Дата рождения: ${user.date_of_birth},
Номер телефона: ${user.phone_number}`)
    } catch (e) {
        ctx.reply('Пользователь с таким id отсутствует в системе.')
    }
})
bot.command('name', async (ctx) => {
    const str = ctx.message.text.split(' ')
    if(str.length < 2) return
    try {
        const user = await User.findOne({name: str[1]})
        ctx.reply(`Имя: ${user.name},
email: ${user.email},
Дата рождения: ${user.date_of_birth},
Номер телефона: ${user.phone_number}`)
    } catch (e) {
        ctx.reply('Пользователь с таким именем отсутствует в системе.')
    }
})
bot.command('email', async (ctx) => {
    const str = ctx.message.text.split(' ')
    if(str.length < 2) return
    try {
        const user = await User.findOne({email: str[1]})
        ctx.reply(`Имя: ${user.name},
email: ${user.email},
Дата рождения: ${user.date_of_birth},
Номер телефона: ${user.phone_number}`)
    } catch (e) {
        ctx.reply('Пользователь с таким email отсутствует в системе.')
    }
})
bot.command('birthday', async (ctx) => {
    const str = ctx.message.text.split(' ')
    if(str.length < 2) return
    try {
        const user = await User.findOne({date_of_birth: str[1]})
        ctx.reply(`Имя: ${user.name},
email: ${user.email},
Дата рождения: ${user.date_of_birth},
Номер телефона: ${user.phone_number}`)
    } catch (e) {
        ctx.reply('Пользователь с таким email отсутствует в системе.')
    }
})
bot.command('phone', async (ctx) => {

    const str = ctx.message.text.split(' ')
    if(str.length < 2) return
    const phone = ctx.message.text.replace('/phone', '').trim()
    try {
        const user = await User.findOne({phone_number: phone})
        ctx.reply(`Имя: ${user.name},
email: ${user.email},
Дата рождения: ${user.date_of_birth},
Номер телефона: ${user.phone_number}`)
    } catch (e) {
        ctx.reply('Пользователь с таким номером телефона отсутствует в системе.')
    }
})
bot.command('users', async (ctx) => {
    const total = await User.find({})
    ctx.telegram.getChatMembersCount(ctx.message.chat.id)
        .then(i => ctx.reply(`Пользователей бота - ${i}. Пользователей в системе ${total.length}`))
})
//bot.hears(/\/cmd (?<param>.*)/, ctx => console.log(ctx.match.groups))
bot.launch()
    .then(() => console.log('The bot has been started!'))
    .catch(e => console.log(e))

const indexRouter = require('./routes/users')
const createRouter = require('./routes/create')
const usersRouter = require('./routes/users')

const app = express()

app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
//app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

app.use('/api', indexRouter)
app.use('/api/create', createRouter)
app.use('/api', usersRouter)
app.use('/api', usersRouter)

// Перед деплоем раскомментировать!
app.use(express.static(__dirname + '/dist/'))
app.get(/.*/, (req, res) => {
    res.sendFile(__dirname + '/dist/index.html')
})

module.exports = app
