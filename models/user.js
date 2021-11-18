const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    passwordHash:{
        type:String,
        required:true
    },
    street:{
        type:String
    },
    apartment:{
        type:String
    },
    city:{
        type:String
    },
    zip:{
        type:String
    },
    country:{
        type:String
    },
    phone:{
        type:Number,
        required:true,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    }
})

exports.User=mongoose.model('User',userSchema);

