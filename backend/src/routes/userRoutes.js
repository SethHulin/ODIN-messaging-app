const { Router } = require('express')
const userRouter = Router()
const userController = require('../controllers/userController')

userRouter.put("/:id", userController.updateInfo)
userRouter.post("/friends/requests/add/:id", userController.addFriend)
userRouter.put("/friends/requests/accept/:id", userControllers.acceptFriend)
userRouter.put("/friends/requests/refuse/:id", userControllers.refuseFriend)
userRouter.put("/friends/block/:id", userControllers.blockFriend)
userRouter.delete("/friends/:id", userControllers.removeFriend)

module.exports = userRouter
