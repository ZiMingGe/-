class Result {
    error(msg,data) {  // 错误消息的msg必须提供, data可有可无
        return  { code: 500, msg: msg, data:data }
    }
    success(msg, data) {
        return { code: 200, msg: msg, data: data }
    }
    pageresult(msg, data) {   //分页数据的返回
        return { code: 200, msg: msg, rows: data.rows, count: data.count }
    }
}

module.exports = Result