const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CustomerSchema = new Schema({
    roomId:{
      type:String,
      required:true
    },
    name:{
        type:String,
        required: true,
    },
    IDNum:{
        type:String,
        required: true,
    },
    telNum:{
        type:Number,
        required: true,
    },
    remark:{
        type:String,
    },
    status:{
        type:String,
        default:'入住中'
    }
})

module.exports =Customer = mongoose.model('customers', CustomerSchema)