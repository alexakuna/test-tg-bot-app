const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')

router.post('/remove', controller.removeUser)
router.post('/update', controller.updateUser)
router.get('/', controller.getUsers)

module.exports = router
