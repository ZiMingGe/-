module.exports={
    randomOutTraNo() {
        let  time = new Date();
        // 年
        let  year= String(time.getFullYear());
        // 月
        let  mouth= String(time.getMonth() + 1);
        // 日
        let  day= String(time.getDate());
        if(day.length<2){
            day='0'+day
        }
        // 时
        let  hours= String(time.getHours());
        if(hours.length<2){
            hours='0' + hours
        }
        // 分
        let  minutes= String(time.getMinutes());
        if(minutes.length<2) {
            minutes='0' + minutes
        }
        // 秒
        let  seconds= String(time.getSeconds());
        if(seconds.length<2) {
            seconds='0' + seconds
        }
        return ( year + mouth + day + hours + minutes + seconds + (Math.round(Math.random() * 23 + 100)).toString())

    },
    sumConsumption:(startTime,leaveTime,Price,timeAmount,timeUnit)=>{
        let start = new Date(startTime)
        start = start.getTime()
        let end = new Date(leaveTime)
        end = end.getTime()
        let tradNum=0
        if(timeUnit==='天'){
            let days = Math.round((parseFloat(end)- parseFloat(start)) / (24 * 3600 * 1000))
            tradNum  = days * parseInt(Price)
        }else if (timeUnit==='小时'){
            let times=Math.round((parseFloat(end)- parseFloat(start))/(3600*1000))
            tradNum=(times/timeAmount)*Price
        }
        return parseFloat(tradNum).toString()
    }
}