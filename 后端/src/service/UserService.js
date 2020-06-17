const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { jwt_secret, expiresIn } = require('../config/config')

const saltRounds = 10

/* 获取一个期限为4小时的token */
function getToken(payload = {}) {
  return jwt.sign(payload, jwt_secret, { expiresIn: expiresIn })
}

module.exports = {
  // 获取所有用户
  getall: async condition => {
    let result = []
    //如果有传查询关键字, 查询 name的模糊匹配(使用的正则)
    let con = condition ? { name: new RegExp(condition, 'i') } : {}
    const u = await User.find(con)
    u.map(item => {
      if (item.role !== '超级管理员') {
        let proty = {
          _id:item._id,
          name: item.name,
          date: item.date,
          role: item.role,
        }
        result.push(proty)
      }
    })
    return result
  },
  // 注册
  registe: async user => {
    const u = await User.findOne({ name: user.name })
    let result
    if (u) {
      result = { code: 0, msg: `用户名${user.name}已经存在` }
      return result
    }
    // 将数据插入到数据库中
    let re = await User.create(user) //create 会返回插入到数据库后的doc对象,也即是会有_id
    // 生成 token
    let token = getToken({ name: user.name, role: re.role })
    result = { code: 1, data: token }
    return result
  },
  // 登录
  login: async user => {
    const u = await User.findOne({ name: user.name })
    let result
    if (!u) {
      result = {
        code: 0,
        msg: `用户不存在,请重新输入`
      }
      return result
    }
    // 比较密码是否一致
    try {
      let flag = await bcrypt.compare(user.password, u.password)
      if (!flag) {
        result = { code: 0, msg: `密码不正确`, data: { token: null } }
        return result
      }
    } catch (error) {
      return { code: 0, msg: '比较加密密码时执行出错!' }
    }
    // 生成 token
    let token = getToken({ _id: u._id, name: user.name, role: u.role })
    result = {
      code: 1,
      msg: '登录成功',
      data: {
        data: {username: user.name,ole: u.role},token: token}
    }
    return result
  },
  // 添加
  add: async user => {
    const u = await User.findOne({ name: user.name })
    let result
    if (u) {
      result = { code: 0, msg: `用户名${user.name}已经存在` }
      return result
    }
    // 将数据插入到数据库中
    delete user._id //因为前端传过来的对象包含有_id属性, 创建的时候要将这个_id删除掉,才能添加成功
    let re = await User.create(user) //create 会返回插入到数据库后的doc对象,也即是会有_id
    result = { code: 1, data: re }
    return result
  },
  // 删除用户
  delete: async ids => {
    console.log(ids)
    let result
    let u=await User.findById({ _id: ids.id })
    console.log(u)
    if(u.role==='超级管理员'){
      result={code:1,msg:'你没有删除用户的权限'}
      return result
    }
    let re = await User.remove({ _id: ids.id })
    console.log('Promise返回结果：', re)
    result = { code: 1 }
    return result
  },
  // 修改用户资料
  update: async user => {
    const u = await User.findById(user._id)
    let result
    if (!u) {
      result = { code: 0, msg: `您要修改的用户不存在` }
      return result
    }
    const sameNameUsers = await User.findOne({
      name: user.name,
      _id: { $ne: user._id }
    })
    if (sameNameUsers) {
      result = { code: 0, msg: `用户名${user.name}已经存在` }
      return result
    }
    // 更新数据
    let { name, role } = user
    let updating = { name, role }
    let re = await User.updateOne({ _id: user._id }, updating)
    result = { code: 1, data: re }
    return result
  },
  // 获取分页数据
  getpagedata: async con => {
    let { pageIndex, pageSize } = con
    let offset = (pageIndex - 1) * pageSize
    let condition = {}
    if (con.name) {
      condition.name = new RegExp(con.name, 'i') // 根据名字模糊查询
    }
    let count = await User.countDocuments(condition) // 计算某个条件的数据数量
    let rows = await User.find(condition)
      .skip(offset)
      .limit(pageSize) // 使用offset和limit的方式获取当前页的数据
    return { rows, count }
  },
  editPassword:async pass=>{
    let result
    let user=await User.findById({_id:pass._id})
    if(!user){
      result={code:0,msg:'不存在改用户'}
      return  result
    }
    let {password}=pass
    let passUp={password}
    let re=await User.updateOne({_id:pass._id},passUp)
    result={code:1,msg:'修改成功'}
    return result
  }

}
