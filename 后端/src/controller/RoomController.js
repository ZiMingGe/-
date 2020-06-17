const roomService = require('../service/RoomService')
const Result=require('../models/result')

let result=new Result();

module.exports={
    //获取所有房间信息
    getall:async ctx=>{
        //console.log(ctx.query)
        let {currentPage,pageSize} = ctx.query
        currentPage=Number(currentPage)
        pageSize=Number(pageSize)
        let con={pageSize,currentPage}
        let roomList= await roomService.getall(con);
        ctx.body=result.success('获取成功',roomList);
    },
    //获取房间号，房型和房间
    getList:async ctx=>{
        let roomList=await roomService.getList();
        ctx.body=result.success('获取成功',roomList);
    },
    search:async ctx=>{
        console.log(ctx.request.body)
        let {currentPage,pageSize,room,price} = ctx.request.body
        let con={currentPage,pageSize,room,price}
        let roomList=await roomService.search(con)
        ctx.body=result.success('获取成功',roomList);
    },
    //添加
    add:async (ctx,next)=>{
        let room=ctx.request.body
        let res=await roomService.add(room)
        let backData
        if(res.code){
            backData=result.success('添加成功')
        }else{
            backData=result.error(res.msg)
        }
        ctx.body=backData
    },
    //编辑
    edit:async (ctx,next)=>{
        let roomInfo=ctx.request.body
        //console.log(roomInfo)
        let backData
        let res
        if(roomInfo.priceid){
            res=await roomService.update(roomInfo)
        }else {
            res=await roomService.addPrice(roomInfo)
        }
        if(res.code){
            backData=result.success('更改成功')
        }else {
            backData=result.error(res.msg)
        }
        ctx.body=backData
    },
    //删除
    delete:async ctx=>{
        console.log(ctx.request.body)
        let ids=ctx.request.body
        console.log(`要删除的ids值：${ids}`)
        let re=await roomService.delete(ids)
        let backData
        if (re.code) {
            //删除成功
            backData = result.success('删除成功！')
        } else {
            backData = result.error(re.msg)
        }
        ctx.body = backData
    },
    //更改房间状态
    updataStatus:async ctx=>{
        let status=ctx.request.body
        let res=await roomService.updataStatus(status)
        let backData
        if(res.code){
            backData=result.success('更改成功')
        }else {
            backData=result.error(res.msg)
        }
        ctx.body=backData
    },
    getInfoByPage:async ctx=>{
        let {pageSize,currentPage,roomId}=ctx.query
        let con
        let backData
        let pageDate=await roomService.getInfoByPage()
        backData=result.pageresult('获取成功',pageDate)
        ctx.body=backData
    }
};