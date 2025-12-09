const db = require('../db/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { matchedData, validationResult, body } = require('express-validator')
const SECRET = process.env.JWT_SECRET
const passport = require('passport')

const validateUser = [
    body("username")
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage(`Username must be between 1 and 20 characters long`)
        .matches(/^[a-zA-Z0-9 ]*$/)
        .withMessage(`Username must only have characters numbers and spaces`),
    // user freedom! no strict passwords!
    body("password")
        .trim()
        .isLength({ min: 6, max: 32 })
        .withMessage(`Password must be between 6 and 32 characters long`)
        .matches(/^[a-zA-Z0-9!@#$%^&*]{6,32}$/)
        .withMessage(
            `Password can only contain letters, numbers, and special characters (!@#$%^&*).`
        ),
]

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

const login = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await db.user.findFirst({
            where: {
                username: username
            }
        })
        if (!user) {
            return res.status(401).json({
                error: {
                    message: "Invalid username or password",
                    timestamp: new Date().toISOString()
                }
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user.id }, SECRET, {
                expiresIn: "2d"
            })
            return res.json({
                token
            })
        } else {
            return res.status(401).json({
                error: {
                    message: "Invalid username or password",
                    timestamp: new Date().toISOString()
                }
            })
        }
    } catch (err) {
        next(err)
    }
}

const signup = [
    validateUser,
    async (req, res, next) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.status(400).json({
                error: {
                    message: err.array(),
                    timestamp: new Date().toISOString()
                }
            })
        }
        const { username, password } = matchedData(req);
        try {
            const existingUser = await db.user.findUnique({
                where: {
                    username: username
                }
            })
            if (existingUser) {
                return res.status(409).json({
                    error: {
                        message: `Username '${username}' is already taken.`,
                        timestamp: new Date().toISOString()
                    }
                })
            }

            const salt = await bcrypt.genSalt()
            const hashedPassword = await bcrypt.hash(password, salt)

            const newUser = await db.user.create({
                data: {
                    username: username,
                    password: hashedPassword
                },
                select: {
                    id: true,
                    username: true,
                    createdAt: true,
                }
            })

            res.status(201).json({
                user: newUser,
                message: "Created user successfully"
            })
        } catch (err) {
            next(err)
        }
    }
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
                    about
                },
                select: {
                    id: true,
                    username: true,
                    about: true,
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
    login,
    signup,
    updateInfo
}
