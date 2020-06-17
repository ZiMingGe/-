const Room=require('../models/Room');
const PriceModel=require('../models/Price');
const CustomerModel=require('../models/Customer')
const RoomTypeModel=require('../models/Roomtype')
const {randomOutTraNo,sumConsumption}=require('../util/outTradNo')
const Order=require('../models/Order')
const Consumption=require('../models/Consumption')

module.exports={
    //获取信息
    getInfo:async condition=>{
        let result=[]
        let {currentPage,pageSize}=condition
        let offset = (currentPage -1) * pageSize
        let total=await Room.countDocuments()
        let customer=await CustomerModel.find({'status':'入住中'}).sort({roomId:1})
        let roomPrice=await Room.aggregate([{
            $lookup:{
                from:'prices',
                localField:'roomId',
                foreignField:'roomId',
                as:'priceInfo'
            }
        }]).sort({roomId:1}).skip(offset).limit(pageSize)
        roomPrice.map(item=>{
            //console.log(customer.length)
            item.Customer=[]
            if(customer.length>0){
                customer.map(val=>{
                    //console.log(val)
                    if (val.roomId===item.roomId&&val.status==='入住中'){
                        item.Customer.push(val)
                    }
                })
                item.customerNum=item.Customer.length
            }else {
                item.Customer=[]
                item.customerNum=0
            }
        })
        //console.log(roomPrice)
        result=roomPrice
      return  {result,total}
    },
    //根据房型分类获取信息
   getByroomType:async type=>{
        let result=[]
        let roomtype=await RoomTypeModel.find().sort({name:1})
        let room=await Room.find().sort({roomId:1})
        let customer=await CustomerModel.find({'status':'入住中'}).sort({roomId:1})
        let arr=[]
        roomtype.map(type=>{
            room.map(item=>{
                if (item.roomType===type.name){
                    let info={roomId: item.roomId,roomType: item.roomType,
                        roomStatus: item.roomStatus,arriveTime: item.arriveTime,
                        leaveTime: item.leaveTime,customer:[]
                    }
                    customer.map(val=>{
                        if (val.roomId===item.roomId&&val.status==='入住中'){
                            info.customer.push(val.name)
                        }
                    })
                    arr.push(info)
                }
            })
        })
       arr.map(item => {
           if (result.length === 0) {
               result.push({ roomType: item.roomType, List: [item] })
           } else {
               let re = result.some(val => {
                   if (val.roomType === item.roomType) {
                       val.List.push(item)
                       return true
                   }
               })
               if (!re) {
                   result.push({ roomType: item.roomType, List: [item] })
               }
           }
       })
        return  result
    },
    //通过状态筛选房图
    getInfoByStatus:async status=>{
        let result=[]
        let room=await Room.find({roomStatus:status.status})
        let customer=await CustomerModel.find({'status':'入住中'}).sort({roomId:1})
        let roomtype=await RoomTypeModel.find().sort({name:1})
        let arr=[]
        roomtype.map(type=>{
            room.map(item=>{
                if (item.roomType===type.name){
                    let info={
                        roomId: item.roomId, roomType: item.roomType,roomStatus: item.roomStatus,
                        arriveTime: item.arriveTime,leaveTime: item.leaveTime, customer:[]
                    }
                    customer.map(val=>{
                        if (val.roomId===item.roomId&&val.status==='入住中'){
                            info.customer.push(val.name)
                        }
                    })
                    arr.push(info)
                }
            })
        })
        arr.map(item => {
            if (result.length === 0) {
                result.push({ roomType: item.roomType, List: [item] })
            } else {
                let re = result.some(val => {
                    if (val.roomType === item.roomType) {
                        val.List.push(item)
                        return true
                    }
                })
                if (!re) {
                    result.push({ roomType: item.roomType, List: [item] })
                }
            }
        })
        return  result
    },
    //办理入住
    checkIn:async customer=>{
        console.log(customer)
        let result
        let cm=await CustomerModel.findOne({IDNum:customer.IDNum})
        if(cm&&cm.status==='入住中') {
            result = {code: 0, msg: `该顾客的身份证号与${cm.name}的身份证号相同`}
            return result
        }
        let room =await Room.findOne({roomId:customer.roomId})
        let type=await RoomTypeModel.findOne({name:room.roomType})
        let roomLength=type.allowNum
        let tradeNo=await randomOutTraNo()
        console.log(tradeNo)
        let order={outTradNo:tradeNo,roomId:customer.roomId,name: [],remark:customer.remark,Status: '进行中',arriveTime:customer.arriveTime,leaveTime:customer.leaveTime}
        order.name.push(customer.name)
        //判断是否多人信息登记
        if (customer.newItem.length!==0){
            if(customer.newItem.length+1<=roomLength){
                customer.newItem.map(val=>{
                    let {roomId,remark}=customer
                    let {name, IDNum,telNum}=val
                    let info=Object.assign({roomId,remark},{name, IDNum,telNum})
                    order.name.push(val.name)
                    CustomerModel.create(info).then(res=>{
                        console.log(res)
                    })
                })
            }else {
                result={code:0,msg:`该房间只能容纳${roomLength}人`}
                return result
            }
        }
        let{roomId,name,IDNum,telNum,remark}=customer
        let customerInfo={roomId,name,IDNum,telNum,remark}
        let {roomStatus}={'roomStatus':'入住中'}
        let roomUpdate={roomStatus}
        let {arriveTime,leaveTime}=customer
        let times={arriveTime,leaveTime}
        let price=await PriceModel.findOne({roomId:customer.roomId})
        let amounts=await sumConsumption(customer.arriveTime,customer.leaveTime,price.Price,price.timeAmount,price.timeUnit)
        console.log(amounts)
        let detail=[{conName:'房费',amounts:amounts,conTime:customer.arriveTime}]
        let consumption={outTradNo: tradeNo,detail:detail,totalSum:amounts}
        try{
            let res=await Order.create(order)
            let re =await CustomerModel.create(customerInfo)
            let up =await Room.updateOne({roomId:customer.roomId},roomUpdate)
            let ins=await Room.updateMany({roomId:customer.roomId},times)
            let con=await Consumption.create(consumption)
        }catch(error){
           console.log(error)
        }
        result={code:1,msg:'办理成功'}
        return  result
    },
    //退房，结算
    checkOut:async settlement=>{
        console.log(settlement)
        let result
        let roomUp={'arriveTime':'','leaveTime':'','roomStatus':'打扫中'}
        let customerUp={'status':'离店'}
        try {
            settlement.customer_id.map(val=>{
                CustomerModel.updateOne({_id:val},customerUp).then(up=>{
                    console.log(up)
                })
            })
            let order=await Order.find({roomId:settlement.roomId,Status:'进行中'})
            console.log(order)
            await Room.updateMany({_id:settlement.room_id},roomUp);
            order.map(item=>{
               Consumption.findOne({outTradNo:item.outTradNo}).then(res=>{
                   console.log(res)
                   let tradeAmount=res.totalSum;
                   let oUP={tradAmount:tradeAmount, Status:'已完成'};
                   Order.updateMany({outTradNo:item.outTradNo},oUP).then(re=>{
                       console.log(re)
                   })
               })
            })
        }catch (error) {
            console.log(error)
            return { code: 0, msg: '结账过程中出现错误' }
         }
        result={code:1,msg:'退房成功'}
        return result
    },
    //超时更新
    update:async  status=>{
        console.log(status)
        let result
        let room=await Room.find({roomId:status.roomId})
        if(!room){
            result={code:1,msg:`房间号为${settlement.roomId}的房间不存在`}
            return  result
        }
        let {roomStatus}={'roomStatus':'已超时'}
        let roomUp={roomStatus}
        let res=await Room.updateOne({roomId:status.roomId},roomUp)
        result={code:1}
        return result
    },
    //所有人换房操作
    changeRoom:async info=>{
        console.log(info)
        let result
        let changeRoom=await Room.findOne({roomId:info.oldId})
        let newRoom=await Room.findOne({roomId:info.newId})
        let newLeave=new Date(newRoom.leaveTime).getTime()
        console.log(newLeave)
        let oldLeave=new Date(changeRoom.leaveTime).getTime()
        if(newLeave!==0&&newLeave!==oldLeave){
            result={code:0,msg:'两间房的退房时间不一致'}
            return  result
        }
        if(newRoom.roomStatus==='空房'){
                let {arriveTime,leaveTime,roomStatus}=changeRoom
                let updateInfo={arriveTime,leaveTime,roomStatus}
                console.log(updateInfo)
                let roomId={$set:{roomId:info.newId}}
                info.customer.map(val=>{
                    console.log(val)
                    CustomerModel.updateOne({_id:val._id},roomId).then(cu=>{
                        console.log(cu)
                    })
                })
                let order= await Order.findOne({roomId:info.oldId,Status:'进行中'})
                let id=order._id
                let oldUpdate ={$set:{roomStatus:'打扫中',arriveTime:'',leaveTime:''}}
                let roomIdUp={
                    $set:{roomId:info.newId,arriveTime:new Date(changeRoom.arriveTime),leaveTime:new Date(changeRoom.leaveTime)}
                }
                await Order.updateMany({_id: id},roomIdUp)
                await Room.updateMany({roomId:info.newId},updateInfo)
                await Room.updateMany({_id:changeRoom._id},oldUpdate)
                result={code:1,msg:'换房成功'}
                return result
        }else if(newRoom.roomStatus==='入住中'){
            let type=await RoomTypeModel.findOne({name:changeRoom.roomType});
            let roomLength=type.allowNum
            let customer=await CustomerModel.find({roomId:info.newId,status:'入住中'})
            let customerNum=customer.length
            if(customerNum+info.customer.length>roomLength){
                result={code:0,msg:`该房间只能再容纳${roomLength-customerNum}个人`}
                return  result
            }else {
                let order= await Order.findOne({roomId:info.oldId,Status:'进行中'})
                let newOrder= await Order.findOne({roomId:info.newId,Status:'进行中'})
                if(newOrder.tradAmount!==order.tradAmount){
                    result={code:0,msg:'两个房间的交易金额不一致不能进行换房'}
                    return result
                }
                /*if (order.name.length<=1){
                    let namList=[]
                    info.customer.map(val=>{
                        console.log(val)
                        namList.push(val.name)
                        CustomerModel.updateOne({_id:val._id},roomIdUp).then(cu=>{
                            console.log(cu)
                        })
                    })
                    newOrder.name.map(item=>{
                        namList.push(item)
                    })
                    let nameUp={$set:{name:namList}}
                    let roomIdUp={$set:{roomId:info.newId}}

                }else {*/
                    let old_id=order._id
                    let roomIdUp={$set:{roomId:info.newId}}
                    let oldUpdate ={$set:{roomStatus:'打扫中',arriveTime:'',leaveTime:''}}
                    await Order.updateMany({_id: old_id},roomIdUp)
                    await Room.updateMany({_id:changeRoom._id},oldUpdate)
                    info.customer.map(val=>{
                        console.log(val)
                        CustomerModel.updateOne({_id:val._id},roomIdUp).then(cu=>{
                            console.log(cu)
                        })
                    })
                //}
            }
            result={code:1,msg:'换房成功'}
            return result
        }else {
            result={code:0,msg:'该房间不能办理入住'}
            return result
        }
    },
    //获取房间列表
    getRoomList:async ()=>{
       let result
        let list=await Room.find({$or:[{roomStatus:'空房'}, {roomStatus:'入住中'}]}).sort({roomId:1})
        let dataList=[]
        if(!list){
            result={code:0}
            return  result
        }
        list.map(item=>{
            let info={  roomId:item.roomId, roomType:item.roomType }
            dataList.push(info)
        })
        result={code:1,data:dataList}
        return  result
    },
    //获取价格和图片信息
    getInfoByRoom:async room=>{
        let result
        let type=await RoomTypeModel.findOne({name:room.roomType})
        console.log(type)
        let price=await PriceModel.findOne({roomId:room.roomId})
        let customer=await CustomerModel.find({roomId:room.roomId,status:'入住中'})
        console.log(price)
        let imgList=type.imageList
        let num=price
        let info={
            imageList:imgList,
            Price:num,
            customerInfo:customer
        }
        console.log(info)
        result={code:1,data: info}
        return  result
    },
    singleChange:async info=>{
        let result
        console.log(info)
        let findRoom=await Room.findOne({roomId:info.oldId})
        let type=await RoomTypeModel.findOne({name:findRoom.roomType})
        let newRoom=await Room.findOne({roomId:info.newId})
        let allowNum=type.allowNum
        if(newRoom.roomStatus==='入住中'){
            let customer=CustomerModel.find({roomId:info.newId,status:'入住中'})
            if(customer.length+1>allowNum){
                result={code:0,msg:'该房间已经达到最大容纳数量'}
                return  result
            }else {
                let oldOrder=await Order.findOne({roomId:info.oldId,Status:'进行中'})
                let newOrder=await Order.findOne({roomId:info.newId,Status:'进行中'})
                let roomId={$set:{roomId:info.newId}}
                info.customer.map(name=>{
                    CustomerModel.updateOne({_id:name._id},roomId)
                })
                let oldCustomer=[]
                oldOrder.customer.map(item=>{
                    if (item!==info.customer[0].name){ oldCustomer.push(item) }
                })
                let newCustomer=[]
                newCustomer= newOrder.customer.push(info.customer)
                let oldCustomerUp={$set:{customer:oldCustomer}}
                let newCustomerUp={$set:{customer:newCustomer}}
                await Order.updateOne({_id:oldOrder._id},oldCustomerUp)
                await Order.updateOne({_id:newOrder._id},newCustomerUp)
            }
        }else if (newRoom.roomStatus==='空房'){
            let old=await Order.findOne({roomId:info.oldId,Status:'进行中'})
            console.log(old)
            let roomId={$set:{roomId:info.newId}}
            info.customer.map(name=>{
                CustomerModel.updateOne({_id:name._id},roomId).then(re=>{
                    console.log(re)
                })
            })
            let customer=[]
            old.name.map(item=>{
                info.customer.map(val=>{
                    if (item!==val.name){
                        customer.push(item)
                    }
                })
            })
            let orderUpdate={$set:{name:customer}}
            let oldRoom=await Room.findOne({roomId:info.oldId})
            let tradeNo=await randomOutTraNo()
            console.log(tradeNo)
            let order={outTradNo:tradeNo,roomId:info.newId,name: [],remark:info.customer[0].remark,Status: '进行中',arriveTime:oldRoom.arriveTime,leaveTime:oldRoom.leaveTime}
            order.name.push(info.customer[0].name)
            let newUpdate ={$set:{roomStatus:'入住中',arriveTime:oldRoom.arriveTime,leaveTime:oldRoom.leaveTime}}
            let price=await PriceModel.findOne({roomId:info.newId})
            let amounts=await sumConsumption(oldRoom.arriveTime,oldRoom.leaveTime,price.Price,price.timeAmount,price.timeUnit)
            console.log(amounts)
            let detail=[{conName:'房费',amounts:amounts,conTime:oldRoom.arriveTime}]
            let consumption={outTradNo: tradeNo,detail:detail,totalSum:amounts}
            let con= await Consumption.create(consumption)
            let or= await Order.create(order)
            let ou= await Order.updateOne({_id:old._id},orderUpdate)
            let ro= await Room.updateMany({roomId:info.newId},newUpdate)
            result={code:1,msg:'换房成功'}
            return  result
        }else {
            result={code:0,msg:'该房间不能办理入住'}
            return  result
        }
    },

}