const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoomSchema = new Schema({
  roomId: {
    type: String,
    require: true
  },
  roomType: {
    type: String,
    require: true
  },
  roomStatus: {
    type: String,
    default:'故障'
  },
  arriveTime:{
    type:Date,
    default: null
  },
  leaveTime:{
    type:Date,
    default:null
  }
})

module.exports = Room = mongoose.model('rooms', RoomSchema)
