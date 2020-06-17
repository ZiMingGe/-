const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const PriceSchema=new Schema({
    roomId:{
        type:String,
        require:true
    },
    timeUnit:{

        type:String
    },
    timeAmount:{
        type:Number
    },
    Price:{
        type:Number
    },
    startTime:{
        type:Date
    },
    endingTime:{
      type:Date
    }
})

module.exports=Price=mongoose.model('prices',PriceSchema)