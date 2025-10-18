const { body, validationResult } = require('express-validator')

const responseWithValidationError = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    next()
}
const registerUserValidation = [
    body('username')
        .isString()
        .withMessage("username must be a string")
        .isLength({ min: 3 })
        .withMessage("username must be at least 3 character long"),
    body('email')
        .isEmail()
        .withMessage("Invalid email address"),
    body('password')
        .isLength({ min: 6 })
        .withMessage("password must be atleast 6 character long"),
    body('fullname.firstname')
        .isString()
        .withMessage("first name must be string")
        .notEmpty()
        .withMessage("first name is required"),
    body('fullname.lastname')
        .isString()
        .withMessage("last name must be string")
        .notEmpty()
        .withMessage("last name is required"),
    responseWithValidationError
]

const loginUserValidation = [
    body('email')
        .optional()
        .isEmail()
        .withMessage("Invalid email"),
    body('username')
        .optional()
        .isString()
        .withMessage("username must be string"),
    body('password')
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 character long")
        .notEmpty()
        .withMessage("password is empty"),
    (req, res, next) => {
        if (!req.body.username && !req.body.email) {
            return res.status(400).json({
                error: [{ message: "Either email or username is required" }]
            })
        }
       
        responseWithValidationError(req, res, next)
    }
]
module.exports = { registerUserValidation, loginUserValidation }