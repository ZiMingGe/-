const Router = require('koa-router')
const userCtrl = require('../controller/UserController')   // 这里引入controller
const roomCtrl =require('../controller/RoomController')
const stayCtrl=require('../controller/StayController')
const roomTypeCtrl=require('../controller/RoomtypeController')
const orderCtrl=require('../controller/OrderController')

module.exports = app => {
    const router = new Router()

    const apiRouter = new Router()

    router.get('/', async(ctx,next) => {
        ctx.type = 'text/html'
        ctx.body = `<h1>这里是Koa首页</h1>`
    })
    //用户接口
    apiRouter.post('/user/registe',userCtrl.registe)  // 用户注册
    apiRouter.post('/user/login',userCtrl.login)      // 用户登录
    apiRouter.post('/user/delete',userCtrl.delete)    // 删除用户
    apiRouter.post('/user/edit',userCtrl.edit)        // 添加或修改
    apiRouter.get('/user/getall',userCtrl.getall)     // 查询所有
    apiRouter.get('/user/getPageData',userCtrl.getpagedata)
    //房间接口
    apiRouter.get('/room/getall',roomCtrl.getall)//获取所有房间信息
    apiRouter.get('/room/getList',roomCtrl.getList)
    apiRouter.post('/room/edit',roomCtrl.edit)
    apiRouter.post('/room/add',roomCtrl.add)
    apiRouter.post('/room/delete',roomCtrl.delete)
    apiRouter.post('/room/search',roomCtrl.search)
    //登记入住退房接口
    apiRouter.get('/stay/getInfo',stayCtrl.getInfo)
    apiRouter.get('/stay/getByroomType',stayCtrl.getByroomType)
    apiRouter.get('/stay/getRoomList',stayCtrl.getRoomList)
    apiRouter.get('/stay/getInfoByStatus',stayCtrl.getInfoByStatus)
    apiRouter.get('/stay/getInfoByRoom',stayCtrl.getInfoByRoom)
    apiRouter.post('/stay/checkin',stayCtrl.checkIn)
    apiRouter.post('/stay/checkout',stayCtrl.checkOut)
    apiRouter.post('/stay/update',stayCtrl.update)
    apiRouter.post('/stay/changeRoom',stayCtrl.changeRoom)
    apiRouter.post('/stay/singleChange',stayCtrl.singleChange)
    //房型接口
    apiRouter.get('/roomType/getList',roomTypeCtrl.getList)
    apiRouter.get('/roomType/getNameList',roomTypeCtrl.getTypeList)
    apiRouter.post('/roomType/editType',roomTypeCtrl.editType)
    apiRouter.post('/roomType/upload',roomTypeCtrl.uploadImage)
    apiRouter.post('/roomType/singleUpload',roomTypeCtrl.uploaSingleImage)
    apiRouter.post('/roomType/addNew',roomTypeCtrl.addNew)
    apiRouter.post('/roomType/deleteType',roomTypeCtrl.deleteType)
    apiRouter.post('/roomType/deleteImage',roomTypeCtrl.deleteImage)
    //顾客信息接口

    //订单接口
    apiRouter.get('/order/getList',orderCtrl.getInfoBypage)
    apiRouter.get('/order/getTradNoByRoom',orderCtrl.getTradNoByRoom)
    apiRouter.get('/order/getConsumptionByNo',orderCtrl.getConsumptionByNo)
    apiRouter.post('/order/addConsumption',orderCtrl.addConsumption)
    apiRouter.post('/order/continuedResidence',orderCtrl.continuedResidence)
    apiRouter.post('/order/searchOrder',orderCtrl.searchOrder)
    //设定api路由为router的子路由
    router.use('/api', apiRouter.routes(), apiRouter.allowedMethods())
    
    //如果匹配不到路由则返回404
    router.all('/*', async (ctx, next) => {
        ctx.response.status = 404;
        ctx.response.body = `<h1>~~ohhh page not found!</h1>`
    })
    app.use(router.routes()).use(router.allowedMethods())
}