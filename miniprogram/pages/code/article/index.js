// pages/code/article/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //https://mp.weixin.qq.com/s/jmUr8514yhZn4mSCg79pEw
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "wxparse",
      data: {
        url: options.url
      }
    }).then(res => {
      console.log(res)
      wx.setNavigationBarTitle({
        title: res.result.data.data.msg_title,
      })
      // res.result.data.data.msg_content = res.result.data.data.msg_content.replace(/data-src=/gi, 'src=')
      res.result.data.data.msg_content = res.result.data.data.msg_content.replace(/data-src=/gi, 'src=').replace(/<img class.*?data/gi, '<img class="rich_pages" data').replace(/<img data/gi, '<img class="rich_pages" data')


      console.log(res.result.data.data.msg_content)
      that.setData({
        html: res.result.data.data
      })
      wx.hideLoading()
    })
  },

  onShareAppMessage: function() {

  }
})