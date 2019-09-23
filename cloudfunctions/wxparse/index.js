// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const extract = require('we-extract').extract

  const {
    url
  } = event;

  const data = await extract(url)
  return {
    data,
  }
}