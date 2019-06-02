const mongoose = require('mongoose');

//User Schema
const userSchema = mongoose.Schema({
    name:{
        type:String,
        lowercase: true
    },
    email: {
        type: String, 
        lowercase: true, 
        unique: true,
    },

    password:{
        type:String,
        require:true
    },
    agency:{
        type:String,
        require:true
    }
},{timestamps: true});

const User = module.exports = mongoose.model('users',userSchema); 