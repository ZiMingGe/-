const  orderService=require('../service/OrderService')
const Result=require('../models/result')

let result=new Result()

module.exports={
    //分页获取信息
    getInfoBypage:async ctx=>{
        console.log(ctx.query)
        let { currentPage,pageSize} = ctx.query
        currentPage=Number(currentPage)
        pageSize=Number(pageSize)
        let con={pageSize,currentPage}
        let infoList=await orderService.getInfoBypage(con)
        ctx.body=result.success('获取成功',infoList);
    },
    //通过房间信息获取订单信息
    getTradNoByRoom:async ctx=>{
        console.log(ctx.query)
        let con=ctx.query
        let info=await orderService.getTradNoByRoom(con)
        ctx.body=result.success('获取成功',info)
    },
    getListByDate:async ctx=>{
        let {arriveTime,leavTime}=ctx.request.body
        let con={arriveTime,leavTime}
        let list=await orderService.getListByDate(con)
        ctx.body=result.success('获取成功',list)
    },
    //预约入住生成订单
    reservation:async (ctx,next)=>{
        let info=ctx.request.body
        let res=await orderService.reservation(info)
        let backData
        if(res.code){
            //退房成功
            backData=result.success('办理成功')
        }else {
            backData=result.error(res.msg)
        }
        ctx.body=backData
    },
    //通过订单号获取消费信息
    getConsumptionByNo:async cxt=>{
        console.log(cxt.query)
        let num=cxt.query
        let res=await orderService.getConsumptionByNo(num)
        cxt.body=result.success('获取成功',res)
    },
    //新增消费信息
    addConsumption:async ctx=>{
        console.log(ctx.request.body)
        let con=ctx.request.body
        let res=await orderService.addConsumption(con)
        ctx.body=result.success('添加成功')
    },
    //条件搜索信息
    searchOrder:async ctx=>{
        let {currentPage,pageSize,order} = ctx.request.body
        let condition={currentPage,pageSize,order}
        let res=await orderService.searchOrder(condition)
        ctx.body=result.success('获取成功',res);
    },
    continuedResidence:async ctx=>{
        let info=ctx.request.body
        let res=await orderService.continuedResidence(info)
        if(res.code){
            ctx.body=result.success('续住成功' ,res)
        }else {
            ctx.body=result.error(res.msg)
        }
    }
}