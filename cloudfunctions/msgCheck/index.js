// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {

  const {
    type,
  } = event;

  // 订单文档的status 0 未支付 1 已支付 2 已关闭
  switch (type) {

    case "text":
      try {
        var result = await cloud.openapi.security.msgSecCheck({
          content: event.content
        })
        return result
      } catch (err) {
        return err
      }

    case "img":
      try {
        var result = await cloud.openapi.security.imgSecCheck({
          media: {
            contentType: event.contentType,
            value: event.media
          }
        })
        return result
      } catch (err) {
        return err
      }
  }

}