
const userModel = require('../models/user.models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {

    console.log("hello");

    const { username, email, password, fullname: { firstname, lastname } } = req.body

    const isuserAlreadyExists = await userModel.findOne({
        $or: [
            { username }, { email }
        ]
    })
    if (isuserAlreadyExists) {
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

}

const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(password);

        const user = await userModel.findOne({
            $or: [{ email }, { username }]
        }).select('+password')

        if (!user) {
            return res.status(401).json({ message: "user not found!" })
        }
        const isPassword = await bcrypt.compare(password, user.password)

        if (!isPassword) {
            return res.status(401).json({ message: "Invalid password" })
        }

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

        res.status(200).json({
            message: "user looged in successfully",
            user: user
        })
    }
    catch (err) {
        console.error("Login is not possible", err)
    }
}

const getCurrentUser = async (req,res,next)=>{
    return res.status(200).json({
        message:"user fetched succesfully",
        user:req.user
    })
    next()
}
module.exports = { registerUser, loginUser ,getCurrentUser}