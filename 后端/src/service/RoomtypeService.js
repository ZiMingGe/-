const RoomTypeMode=require('../models/Roomtype')
const RoomModel=require('../models/Room')

module.exports={
    getList:async condition=>{
        let result
        let con = condition ? { roomType: new RegExp(condition, 'i') } : {}
        let res=await RoomTypeMode.find(con)
        //console.log(res)
        if(!res){
            result={code:1,msg:`名称为${name}的房型不存在`}
            return  result
        }
      result=res
      return  result
    },
    getTypeList:async condition=>{
        let result
        let res=await RoomTypeMode.find().sort({name:1})
        console.log(res)
        let nameList=[]
        res.map(item=>{
            nameList.push(item.name)
        })
        result={code:1,data:nameList}
        return  result
    },
    addNew:async type=>{
        let r=await RoomTypeMode.findOne({name:type.name})
        let result
        if(r){
            result={code:0,msg:`名称为${type.name}房型已存在`}
            return  result;
        }
        delete type._id
        let re=await RoomTypeMode.create(type);
        result={code: 1,data:re}
        return  result
    },
    updateType:async info=>{
        let result
        let r=await RoomTypeMode.findById({_id:info._id})
        if(!r){
            result={code:0,msg:`该房型不存在`}
            return  result;
        }
        let {name,allowNum,configure}=info
        let typeUp={name,allowNum,configure}
        let type=await RoomTypeMode.updateMany({_id:info._id},typeUp)
        result ={code:1,msg:'更新成功'}
        return  result
    },
    uploadImage:async info=>{
        let result
        console.log(info)
        let re=await RoomTypeMode.findById({_id:info._id})
        if(!re){
            result={code:0,msg:'无法找到相关信息'}
            return  result
        }
        console.log(re.imageList instanceof  Array)
        let List={imageList:[]}
        if(re.imageList instanceof  Array){
            List.imageList=re.imageList
            console.log(List.imageList)
            if(List.imageList.length>=6){
                result={code:0,msg:'图片数量已达到最大限制数量'}
                return result
            }else {
                if (info.imageList instanceof  Array){
                    info.imageList.map(item=>{
                        List.imageList.push(item)
                    })
                   let {imageList}=List
                    let imgUp={imageList}
                    console.log(imgUp)
                    RoomTypeMode.updateOne({_id:info._id},imgUp).then(res=>{
                        console.log(res)
                        result={code:1,msg:'上传成功'}
                        return result
                    })
                }else {
                    List.imageList.push(info.imageList)
                    let {imageList}=List
                    let imgUp={imageList}
                    RoomTypeMode.updateOne({_id:info._id},imgUp).then(res=>{
                        console.log(res)
                        result={code:1,msg:'上传成功'}
                        return result
                    })
                }
            }
        }else {
            let {imageList}=info
            let imageUp={imageList}
            console.log(imageUp)
            RoomTypeMode.updateOne({_id: info._id},imageUp).then(res=>{
                console.log(res)
                result={code:1,data:imageUp}
                return  result
            })
        }
    },
    deleteImage:async image=>{
        console.log(image)
        let result
        let res=await RoomTypeMode.findOne({name:image.name})
        console.log(res)
        let imgArr=[]
        res.imageList.map(item=>{
            if(item.url!==image.url){
                imgArr.push(item)
            }
        })
        let imgUp={imageList:imgArr}
        console.log(imgArr)
        let up=await RoomTypeMode.updateMany({name:image.name},imgUp)
        result={code:1}
        return result
    },
    //删除房型
    deleteType:async type=>{
        let result
       let find=await RoomTypeMode.findById({_id:type._id})
        let room=await RoomModel.findOne({roomType:type.name})
        if(!find){
            result={code:0,msg:'没找到相关的房型信息'}
            return result
        }
        if(room){
            result={code:0,msg:'该房型已经跟房间绑定'}
            return  result
        }
        let res=await RoomTypeMode.deleteOne({_id:type._id})
        console.log('Promise返回结果：', res)
        result={code:1}
        return result
    }
}