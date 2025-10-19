const userModel = require('../models/user.models');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser')

const authMiddleware = async (req, res, next) => {
    const token = req.cookies?.token;
    
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided" })
    }
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({
            _id: decoded.id
        })
        req.user = user;
        next();
    } 
    catch (error) {
        return res.status(401).json({
            message:"invalid token"
        })
    }
}

module.exports = authMiddleware;