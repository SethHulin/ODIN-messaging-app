const passport = require('passport')
const db = require('../db/prisma')
const { matchedData, validationResult, body } = require('express-validator')

const validateUserInfo = [
    body("username")
        .trim()
        .optional()
        .isLength({ max: 20 })
        .withMessage(`Username has a limit of 20 characters long`)
        .matches(/^[a-zA-Z0-9 ]*$/)
        .withMessage(`Username must only have characters numbers and spaces`),
    body("about")
        .trim()
        .optional()
        .isLength({ max: 200 })
        .withMessage('About me has a limit of 200 characters long')
        .matches(/^[a-zA-Z0-9!@#$%^&* ]*$/)
        .withMessage(
            `About me can only contain letters, numbers, spaces, and special characters (!@#$%^&*).`
        ),
]

const updateInfo = [validateUserInfo,
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
        const err = validationResult(req)
        if (!err.isEmpty()) {
            return res.status(400).json({
                error: {
                    message: err.array(),
                    timestamp: new Date().toISOString()
                }
            })
        }
        try {
            const { username, about } = matchedData(req)
            const updatedUser = await db.user.update({
                where: {
                    id: req.user.id,
                },
                data: {
                    username,
                    aboutMe: about
                },
                select: {
                    id: true,
                    username: true,
                    aboutMe: true,
                    createdAt: true
                }
            })
            res.json({
                updatedUser
            })
        } catch (err) {
            next(err)
        }
    }
]

module.exports = {
    updateInfo
}
