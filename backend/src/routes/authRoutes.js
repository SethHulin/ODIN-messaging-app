const { Router } = require('express')
const authRouter = Router()
const authController = require('../controllers/authController')

userRouter.post("/login", authController.login)
userRouter.post("/signup", authController.signup)

module.exports = authRouter
