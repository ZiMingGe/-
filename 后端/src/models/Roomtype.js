const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoomTypeSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    allowNum:{
        type:Number
    },
    configure:{
        type:Array
    },
    imageList:{
        type:Array
    }
})

module.exports=Roomtype=mongoose.model('roomtypes',RoomTypeSchema)