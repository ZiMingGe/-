const Room=require('../models/Room');
const PriceModel=require('../models/Price');
const RoomType=require('../models/Roomtype')

module.exports={
    //获取所有房间信息
    getall:async condition=>{
        console.log(condition)
        let result=[]
        let {currentPage,pageSize}=condition
        let offset = (currentPage -1) * pageSize
        let res= await Room.find().sort({roomId:1}).skip(offset).limit(pageSize)
        console.log(res)
        let price=await PriceModel.find().sort({roomId:1}).skip(offset).limit(pageSize)
        let total=await Room.countDocuments()
        res.map(item=>{
            let roomInfo={
                roomid:item._id, roomId:item.roomId,roomStatus:item.roomStatus,roomType:item.roomType,Price:'',priceid:'',startTime:'',
                endingTime:'',timeUnit:'',timeAmount:''
            }
            price.map(val=>{
                if(item.roomId===val.roomId){
                    roomInfo.priceid=val._id
                    roomInfo.Price=val.Price
                    roomInfo.startTime=val.startTime
                    roomInfo.endingTime=val.endingTime
                    roomInfo.timeUnit=val.timeUnit
                    roomInfo.timeAmount=val.timeAmount
                }
            })
            result.push(roomInfo)
        })
        return { result,total}
    },
    //获取房间号，房型和房间状态
    getList:async ()=>{
        let result=[]
        let List=await Room.find().sort({roomId:1})
        List.map(item=>{
            let need={
                roomId:item.roomId,
                roomType:item.roomType,
                roomStatus: item.roomStatus,
                status: 'success'
            }
            result.push(need)
        })
        return result
    },
    //添加
    add:async room=>{
        console.log(room)
        let r=await Room.findOne({roomId:room.roomId})
        let result
        if(r){
            result={code:0,msg:`房间号为${room.roomId}的房间已存在`}
            return  result;
        }
        //let len=await Room.find({roomType:room.roomType})
        let typeLength=await RoomType.find({name:room.roomType})
        if(typeLength.surplus<=0){
            result={code:0,msg:`${typeLength.name}数量不足`}
        }
        delete room._id
        let re=await Room.create(room);
        result={code: 1,data:re}
        return  result
    },
    //添加价格信息
    addPrice:async room=>{
        console.log(room)
        let p=await PriceModel.findOne({roomId:room.roomId})
        console.log(p)
        let result
            if (p){
                result={code:0,msg:`房间号为${room.roomId}的价格已存在`}
                return  result
            }
        let price={
            roomId:room.roomId,
            timeUnit:room.timeUnit,
            timeAmount:room.timeAmount,
            Price:room.Price,
            startTime:room.startTime,
            endingTime:room.endingTime
        }
        let {roomType}=room
        let roomUpdating={roomType}
        let r=await Room.updateOne({roomId:room.roomId},roomUpdating)
        delete room._id
        let re=await PriceModel.create(price)
        result={code:1,data: re}
        return  result
    },
    //更新房间表和价格表信息
    update:async info=>{
        console.log(info)
        let p=await PriceModel.findById({_id:info.priceid})
        let room=await Room.findById({_id:info.roomid})
        console.log(room)
        let result
        if(!p){
            result = { code: 0, msg: `您要修改的房间不存在` }
            return result
        }
        if (room.roomType!==info.roomType ){
            let {roomType}=info
            let roomUpdating={roomType}
            let r=await Room.updateOne({roomId:info.roomId},roomUpdating)
        }
        let  {roomStatus} =info
        let rsUpdate={roomStatus}
        let rs=await Room.updateOne({roomId:info.roomId},rsUpdate)
        let {timeUnit,Price,timeAmount,startTime,endingTime}=info
        let priceUpdating={timeUnit,Price, timeAmount,startTime,endingTime}
        console.log(priceUpdating)
        let re=await PriceModel.updateMany({_id:info.priceid},priceUpdating)
        console.log(re)
        result={code:1,msg:'更改成功'}
        return result
    },
    //删除
    delete:async ids=> {
        let result
        let re = await Room.remove({_id: ids.roomid})
        let pr = await PriceModel.remove({_id: ids.priceid})
        /*console.log('Promise返回结果：', re)
        console.log('Promise返回结果：', pr)*/
        result = { code: 1 }
        return result
    },
    updataStatus:async status=>{
        let result
        let room=await Room.find({roomId:status.roomId})
        if(!p){
            result = { code: 0, msg: `您要修改的房间不存在` }
            return result
        }
        let {roomStatus}=room
        let statusUpdate={roomStatus}
        let up=await Room.updateOne({roomId:status.roomId},statusUpdate)
        result={code:1}
        return  result
    },
    getInfoByPage:async con=>{
        let {pageIndex,pageSize}=con
        let offset=(pageIndex-1)*pageSize
        let condition={}
        if(con.roomId){
            condition.roomId=new RegExp(con.roomId,"i")
        }
        let count=await Room.countDocuments(condition)
        let rows=await Room.find(condition).skip(offset).limit(pageSize)
        return {rows,count}
    },
    search:async condition=>{
        console.log(condition)
        let result=[]
        let {currentPage,pageSize,room}=condition
        let offset = (currentPage -1) * pageSize
        let res= await Room.find(room).sort({roomId:1}).skip(offset).limit(pageSize)
        //console.log(res)
        let pr=await PriceModel.find()
        let total=await Room.countDocuments(room)
        res.map(item=>{
            let roomInfo={
                roomid:item._id, roomId:item.roomId,roomStatus:item.roomStatus,roomType:item.roomType,Price:'',priceid:'',startTime:'',
                endingTime:'',timeUnit:'',timeAmount:''
            }
            pr.map(val=>{
                if(item.roomId===val.roomId){
                    roomInfo.priceid=val._id
                    roomInfo.Price=val.Price
                    roomInfo.startTime=val.startTime
                    roomInfo.endingTime=val.endingTime
                    roomInfo.timeUnit=val.timeUnit
                    roomInfo.timeAmount=val.timeAmount
                }
            })
            result.push(roomInfo)
        })
        return { result,total}
    },
}