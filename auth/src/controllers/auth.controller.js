
const userModel = require('../models/user.models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {
    try {
        console.log("hello");

        const { username, email, password, fullname: { firstname, lastname } } = req.body

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username }, { email }
            ]
        })
        if (isUserAlreadyExists) {
            return res.status(409).json({
                message: "username or email already exists"
            })
        }
        const hashPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashPassword,
            fullname: { firstname, lastname }
        })

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: "User register successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                role: user.role
            }
        })
    } catch (err) {
        console.error("Error in register user", err)
        res.status(500).json({ message: "internal server error" })

    }
}
module.exports = { registerUser }