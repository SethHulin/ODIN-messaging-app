const { Router } = require('express')
const userRouter = Router()
const userController = require('../controllers/userController')

userRouter.post("/login", userController.login)
userRouter.post("/signup", userController.signup)
userRouter.put("/:id", userController.updateInfo)

module.exports = userRouter
