const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street:String,
    city:String,
    state:String,
    pincode:String,
    country:String,
    isDefault: {type:Boolean,default:false}
},{new:true})

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
        enum:['user','seller'],
        default:'user'
    },
    addresses:[
        addressSchema,
    ]
})

const userModel = mongoose.model('user',userSchema)

module.exports = userModel;