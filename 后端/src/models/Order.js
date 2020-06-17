const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema=new Schema({
   outTradNo:{
       type:String,
       required:true
   },
    roomId:{
       type: String,
        required: true
    },
    tradAmount:{
       type:Number
    },
    name:{
       type:Array
    },
    remark:{
       type:String
    },
    Status:{
        type:String
    },
    arriveTime:{
        type:Date,
    },
    leaveTime:{
        type:Date,
    },
    user_id:{
       type:String
    }
})

module.exports=Income=mongoose.model('orders',OrderSchema)