const StayService=require('../service/StayService')
const Result=require('../models/result')
let result=new Result()

module.exports={
    //获取信息
    getInfo:async ctx=>{
        let {currentPage,pageSize} = ctx.query
        currentPage=Number(currentPage)
        pageSize=Number(pageSize)
        let con={pageSize,currentPage}
        //console.log(con)
        let infoList= await StayService.getInfo(con);
        //console.log(infoList)
        ctx.body=result.success('获取成功',infoList);
    },
    //房型分类信息
    getByroomType:async ctx=>{
        //console.log(ctx.query)
        let { keyWord } = ctx.query
        let info=await StayService.getByroomType(keyWord)
        ctx.body=result.success('获取成功',info)
    },
    getInfoByStatus:async ctx=>{
        let con=ctx.query
        let infoList=await StayService.getInfoByStatus(con)
        ctx.body=result.success('获取成功',infoList)
    },
    //办理入住
    checkIn:async ctx=>{
            //console.log(ctx.request.body)
            let customer=ctx.request.body
            let res=await StayService.checkIn(customer)
            console.log(res)
            let backData
            if(res.code){
                //办理成功
                backData=result.success('登记成功')
            }else {
                backData=result.error(res.msg)
            }
            ctx.body=backData
    },
    //退房结算
    checkOut:async ctx=>{
            let ids=ctx.request.body
            //console.log(ids)
            let res=await StayService.checkOut(ids)
            let backData
            if(res.code){
                //退房成功
                backData=result.success('办理成功')
            }else {
                backData=result.error(res.msg)
            }
            ctx.body=backData
    },
    //超时更新房间状态
    update:async ctx=>{
        let req=ctx.request.body
        let res=await StayService.update(req)
        let backData
        if(res.code){
            backData=result.success('更新成功')
        }else {
            backData=result.error(res.msg)
        }
        ctx.body=backData
    },
    //换房操作
    changeRoom:async ctx=>{
        let roomInfo=ctx.request.body
        let res=await StayService.changeRoom(roomInfo)
        let backData
        if(res.code){
            backData=result.success('换房成功')
        }else {
            backData=result.error(res.msg)
        }
        ctx.body=backData
    },
    getRoomList:async ctx=>{
        let res=await StayService.getRoomList()
        if(res.code){
            ctx.body={msg:'获取成功' ,res}
        }else {
            ctx.body={msg: '已无空房'}
        }
    },
    getInfoByRoom:async ctx=>{
        console.log(ctx.query)
        let con=ctx.query
        let res=await StayService.getInfoByRoom(con)
        if(res.code){
            ctx.body={msg:'获取成功' ,res}
        }else {
            ctx.body={msg: res.msg}
        }
    },
    singleChange:async ctx=>{
        let info=ctx.request.body
        let res=await StayService.singleChange(info)
        if(res.code){
            ctx.body=result.success('换房成功' ,res)
        }else {
            ctx.body=result.error(res.msg)
        }
    }

}