const Koa = require('koa')
const path = require('path')
const fs = require('fs')
const koalogger = require('koa-logger')
const cors = require('kcors')
const json = require('koa-json')
// const koaBodyParser = require('koa-bodyparser')
const KoaBody=require('koa-body')
const static = require('koa-static')                 //静态资源
const { port, mongodbUrl } = require('./config/config')
const router = require('./router/routes')
const middleware = require('./middleware')         //自定义的一些中间件
//引入log4js帮助js
const logUtil = require('./util/logUtil')

// mongodb数据连接
const mongoose = require('mongoose')
mongoose.connect(mongodbUrl,{useNewUrlParser:true})
    .then(() => console.log('数据库连接成功'))
    .catch(err => console.log(err))



const app=new Koa()
app.use(cors({credentials: true}))       //允许跨域,并且允许附带cookie

app.use(async (ctx, next) => {       // 写日志的中间件, 此中间件应放在业务中间件的前面    
    const start = new Date()         //响应开始时间    
    var ms                           //响应间隔时间
    try {        
        await next()                 //开始进入到下一个中间件
        ms = new Date() - start
        //记录响应日志
        // logUtil.logResponse(ctx, ms)
    } catch (error) {
        ms = new Date() - start
        //记录异常日志
        logUtil.logError(ctx, error, ms)
    }
})
app.use(static(path.join( __dirname,  '/public')))
app.use(koalogger())
app.use(json())

middleware(app)

//app.use(koaBodyParser())
//app.use(koaBody())
app.use(KoaBody({
    multipart:true, // 支持文件上传
    formidable:{
        //uploadDir:path.join(__dirname,'public/upload/'),  // 设置文件上传目录,要确保这个文件夹已经存在,否则会报错
        //keepExtensions: true,    // 保持文件的后缀
        //maxFieldsSize:2 * 1024 * 1024, // 所有的字段大小(不包括文件,默认是20M)
        maxFileSize: 10*1024*1024,    //上传的文件大小限制,默认是200M
    }
}))



// 加载路由
router(app)

app.listen(port, ()=> {
    console.log(`server is running at http://localhost:${port}`)
})