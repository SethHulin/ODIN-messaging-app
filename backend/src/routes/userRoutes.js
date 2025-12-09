const { Router } = require('express')
const userRouter = Router()
const userController = require('../controllers/userController')

userRouter.put("/:id", userController.updateInfo)

module.exports = userRouter
