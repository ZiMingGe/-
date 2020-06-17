const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConsumptionSchema=new Schema({
    outTradNo:{
        type:String,
        required:true,
        unique:true
    },
    detail:{
        type: Array
    },
    totalSum:{
        type:Number
    }
})

module.exports =Consumption= mongoose.model('consumptions', ConsumptionSchema)