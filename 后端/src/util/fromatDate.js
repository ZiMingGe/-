module.exports={
    formatDate:(date, fmt) => {
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                (date.getUTCFullYear() + '').substr(4 - RegExp.$1.length)
            )
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + ''
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1 ? str : padLeftZero(str)
                )
            }
        }
        return fmt
    },
    padLeftZero:function (str) {
        return ('00' + str).substr(str.length)
    }
}
