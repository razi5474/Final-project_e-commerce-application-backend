const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: [true, 'Please provide a name']
    },
    email:{
        type: String,
        required: [true, 'Please provide an email'],
        unique: true
    },
    phone:{
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true
    },
    password:{
        type: String,
        required: [true, 'Please provide a password'],
        minlength:[8,"Password must be at least 8 characters"],
        maxlength: [128,"Password must be at most 128 characters"], 
    },
    role:{
        type: String,
        enum: ['user','seller', 'admin'],
        default: 'user'
    }
},
{
    timestamps: true
})
module.exports = mongoose.model('User', userSchema)