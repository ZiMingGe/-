const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GoodSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type: String
    },
    amount:{
        type:String
    },

})