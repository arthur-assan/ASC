const mongoose = require('mongoose');

//User Schema
const caseSchema = mongoose.Schema({
    accuser:{
        type:String,
        lowercase: true
    },
    contact: {
        type: String, 
        lowercase: true, 
        unique: true,
    },
    statement:{
        type:String,
        require:true
    },
    case_class:{
        type:String,
        require:true
    },
    investigation:{
        type:String,
        require:true,
        default:null
    }
},{timestamps: true});

const Case = module.exports = mongoose.model('case',caseSchema); 