const Order=require('../models/Order')
const Room=require('../models/Room')
const Consumption=require('../models/Consumption')
const {sumConsumption}=require('../util/outTradNo')
const PriceModel=require('../models/Price')

module.exports={
    getInfoBypage:async condition=>{
        let result=[]
        console.log(condition)
        let {currentPage,pageSize}=condition
        let offset = (currentPage -1) * pageSize
        let order=await Order.find().sort({outTradNo:-1}).skip(offset).limit(pageSize)
        let total=await Order.countDocuments()
        result=order
        return {result,total}
    },
    //通过房间号获取订单号
    getTradNoByRoom:async room=>{
        let result
        let orderInfo=await Order.find({roomId:room.roomId,Status:'进行中'})
        console.log(orderInfo)
        if(!orderInfo){
            result={code:0,msg:'没有相关订单信息'}
            return result
        }

        result={code:1,orderInfo}
        return result
    },
    //通过时间查询是否满房
    getListByDate:async info=>{
        {}
    },
    //预约房间
    reservation:async info=>{
        let result
        let order=await Order.find({status:'预约中',arriveTime:info.arriveTime,leaveTime:info.leaveTime})
        let room=await  Room.find({roomType:info.roomType})
        if(order.length>=room.length){
            result={code:0,msg:`${info.roomType}在当天预订已满`}
            return result
        }

    },
    //接单
    accectOrder:async id=>{
        let result
        let order=await Order.findById({_id:id._id})
        if(!order){
            result={ code:0,msg: '没找到该订单的存在'}
            return  result
        }
        let orderUp= {'Status':'已接单'}
        let re=await Order.updateOne({_id: id._id},orderUp)
        result={code:1,msg:'接单成功'}
        return  result
    },
    //取消订单

    //通过订单号获取消费信息
    getConsumptionByNo:async num=>{
        let result
        let consumption=await Consumption.findOne({outTradNo: num.outTradNo})
        if(!consumption){
            result={ code:0,msg: '该订单的信息'}
            return  result
        }
        result={code:1,consumption}
        return result
    },
    addConsumption:async info=> {
        console.log(info)
        let result
        let con = await Consumption.findOne({outTradNo: info.outTradNo})
        //console.log(con)
        if (!con&&con===null) {
            result = {code: 0, msg: '没有该订单的相关信息'}
            return result
        }else {
            let detail=con.detail
            let sumInfo={"conName":info.detail.conName,"amounts":`${info.detail.amounts}`,"conTime":info.detail.conTime}
            detail.push(sumInfo)
            //console.log(detail)
            let num=0
            detail.map(item=>{
                num=parseInt(item.amounts)+num
            })
            console.log(num)
            let totalUp={"totalSum":num}
            console.log(detail)
            let detailUp={"detail":detail}
            let update=await Consumption.updateMany({outTradNo:info.outTradNo},detailUp)
            let totalUpdate=await Consumption.updateOne({outTradNo:info.outTradNo},totalUp)
            result={code:1}
            return result
        }
    },
    searchOrder:async condition=>{
        let result
        let {currentPage,pageSize,order}=condition
        let offset = (currentPage -1) * pageSize
        let or=await Order.find(order).sort({outTradNo:-1}).skip(offset).limit(pageSize)
        let total=await Order.countDocuments(order)
        result=or
        return {result,total}
    },
    continuedResidence:async info=>{
        console.log(info)
        let result
        try{
        let order=await Order.findOne({outTradNo:info.outTradNo})
        let price=await PriceModel.findOne({roomId: info.roomId})
        let startTime=order.leaveTime;
        let leaveTime=info.continueTime;
        if(new Date(startTime).getTime()>new Date(leaveTime).getTime()){
            result={code:0,msg:"续房日期不能小于原本的退房时间"}
            return result
        }else {
        let continueAmount=sumConsumption(startTime,leaveTime,price.Price,price.timeAmount,price.timeUnit)
        console.log(continueAmount);
        let roomUp={"leaveTime":`${info.continueTime}`}
        let newCon={"conName": '续住房费',"amounts": `${continueAmount}`,"conTime":info.continueTime}
        console.log(newCon)
        let conSum=await Consumption.findOne({outTradNo:info.outTradNo})
        let detail=conSum.detail
        detail.push(newCon)
        let num=0
        detail.map(item=>{
            num=parseInt(item.amounts)+num
        })
        console.log(num)
        let totalUp={"totalSum":num}
        let detailUp={"detail":detail}
        let orderUp={"leaveTime":`${info.continueTime}`}
        await Consumption.updateMany({outTradNo:info.outTradNo},detailUp)
        await Consumption.updateOne({outTradNo:info.outTradNo},totalUp)
        await Order.updateOne({outTradNo:info.outTradNo},orderUp);
        await Room.updateOne({roomId:info.roomId},roomUp);
        result={code:1}
        return result
        }
        }catch (error) {
            console.log(error)
        }
    }
}