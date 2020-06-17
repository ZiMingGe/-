const RoomtypeService=require('../service/RoomtypeService')
const Result=require('../models/result')
const path = require('path')
const fs=require('fs')
const {randomOutTraNo}=require('../util/outTradNo')
let result=new Result();


module.exports={
    getList:async ctx=>{
        let {word}=ctx.query
        let res=await RoomtypeService.getList(word)
        ctx.body=result.success('获取成功',res)
    },
    getTypeList:async ctx=>{
        let res=await RoomtypeService.getTypeList()
        ctx.body=result.success('获取成功',res)
    },
    addNew:async ctx=>{
        let info=ctx.request.body
        let res=await RoomtypeService.addNew(info)
        let backData
        if(res.code){
            backData=result.success('添加成功')
        }else{
            backData=result.error(res.msg)
        }
        ctx.body=backData
    },
    //编辑房型信息
    editType:async ctx=>{
        let con=ctx.request.body
        console.log(con)
        let res=await RoomtypeService.updateType(con)
        let backData
        if(res.code){
            backData=result.success('更新成功')
        }else{
            backData=result.error(res.msg)
        }
        ctx.body=backData
    },
    //多图上传
    uploadImage:async ctx=>{
        console.log(ctx.request.files)
        let file=ctx.request.files.image
        let dirName=path.resolve('./src/public/upload/',`${ctx.request.body.name}`)
        let id=ctx.request.body._id
        //console.log(dirName)
        if(!fs.existsSync(dirName)){
            fs.mkdirSync(dirName)
        }
        //let date=randomOutTraNo()
        //console.log(dirName)
        let fileInfo=[]
        file.map(item=>{
            let reader=fs.createReadStream(item.path)
            let filePath=path.join(dirName+'/')+`${item.name}`
            let upStream=fs.createWriteStream(filePath)
            let originUrl='http://'+ctx.request.headers.host
            console.log(originUrl)
            let fileUrl=`${originUrl}/upload/${ctx.request.body.name}/${item.name}`
            reader.pipe(upStream)
            //console.log(upStream)
            let info={name:item.name,url:fileUrl}
            fileInfo.push(info)
        })
        let con={_id:id,imageList:fileInfo}
        let re=await RoomtypeService.uploadImage(con)
        ctx.body=result.success('上传成功',re)
    },
    //单张图片上传
    uploaSingleImage:async ctx=>{
        let file=ctx.request.files.image
        let dirName=path.resolve('./src/public/upload/',`${ctx.request.body.name}`)
        let id=ctx.request.body._id
        if(!fs.existsSync(dirName)){
            fs.mkdirSync(dirName)
        }
        let singleReader=fs.createReadStream(file.path)
        let filePath=path.join(dirName+'/')+`${file.name}`
        let upStream=fs.createWriteStream(filePath)
        let originUrl='http://'+ctx.request.headers.host
        let fileUrl=`${originUrl}/upload/${ctx.request.body.name}/${file.name}`
        singleReader.pipe(upStream)
        let con={_id: id,imageList: {name:file.name, url:fileUrl}}
        console.log(con)
        let re=await RoomtypeService.uploadImage(con)
        ctx.body=result.success('上传成功',re)
    },
    deleteImage:async ctx=>{
        let info=ctx.request.body
        try{
            let res=await RoomtypeService.deleteImage(info)
            if(res.code){
            let filePath=path.resolve('./src/public/upload/',`${info.name}/${info.imgName}`)
            if(fs.existsSync(filePath)){
               fs.unlinkSync(filePath)
                ctx.body=result.success('删除成功')
            }
        }
        }catch (error) {
            console.log(error)
        }
    },
    deleteType:async ctx=>{
        console.log(ctx.request.body)
        let type=ctx.request.body
        let res = await RoomtypeService.deleteType(type)
        console.log(res.code)
        try{
        if(res.code){
            let Dirpath=path.resolve('./src/public/upload/',`${type.name}`)
            console.log(Dirpath)
            let files = []
            console.log(fs.existsSync(Dirpath))
            if(fs.existsSync(Dirpath)){
                files=fs.readdirSync(Dirpath)
                files.map(file=> {
                    let curPath = Dirpath + "/" + file;
                    console.log(curPath)
                    console.log(fs.statSync(curPath).isDirectory())
                    if(!fs.statSync(curPath).isDirectory()) {
                        fs.unlinkSync(curPath)
                    }
                })
                fs.rmdirSync(Dirpath)
            }
            ctx.body=result.success('删除成功')
        }else {
            ctx.body=result.error(res.msg)
        }
        }catch (error) {
            console.log(error)
        }
    }
}