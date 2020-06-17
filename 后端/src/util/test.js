console.log(images)
let upFolder = path.resolve(__dirname,'public/upload'+`/${info.name}`)   //放置于public目录(也就是静态资源目录,才好前端页面直接引用)
console.log(upFolder)
let flag = fs.existsSync(upFolder)
console.log(flag)
if(!flag){
    await fs.mkdirSync(upFolder)
    console.log(create)
}
for (let img of images){
    let reader=fs.createReadStream(img.path)
    let imgPath=path.join(upFolder+`/${img.name}`)
    console.log(imgPath)
    console.log(imgPath)
    const upStream=fs.createWriteStream(imgPath)
    reader.pipe(upStream)
}