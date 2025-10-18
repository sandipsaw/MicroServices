const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street:String,
    city:String,
    state:String,
    zip:Number
})

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        select:false,
    },
    fullname:{
        firstname:{
            type:String,
            required:true
        },
        lastname:{
            type:String,
            required:true,
        }
    },
    role:{
        type:String,
        enum:['user','model'],
        default:'user'
    },
    address:[
        addressSchema,
    ]
})

const userModel = mongoose.model('user',userSchema)

module.exports = userModel;