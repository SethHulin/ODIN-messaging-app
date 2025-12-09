const { Router } = require('express');
const router = Router()
const userRouter = require('./userRoutes')
const authRouter = require('./authRoutes')
const messageRouter = require('./messageRoutes')

router.use("/auth", authRouter)
router.use("/users", userRouter)
router.use("/messages", messageRouter)

module.exports = router;
