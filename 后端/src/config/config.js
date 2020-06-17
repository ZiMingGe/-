const env = process.env.NODE_ENV || 'development'

let port, database, mongodbUrl

let jwt_secret = 'qwqasdf#$123$%##*(&&!@#aic' // 用于jsonwebtoken的加密串
let expiresIn = '2h' //身份过期时间 4h=4小时

if (env === 'development') {
  // 如果是开发环境
  port = 8081
  database = {
    host: 'localhost',
    database: 'hotelDatabase',
    username: 'root',
    password: '',
    port: '270107'
  }
  mongodbUrl = 'mongodb://localhost:27017/hotelDatabase'
}

if (env === 'production') {
  //如果是生产环境
}

module.exports = {
  port,
  database,
  mongodbUrl,
  jwt_secret,
  expiresIn
}
