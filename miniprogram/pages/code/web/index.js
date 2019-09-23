// pages/code/web/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: undefined

  },


  onLoad: function(options) {
    console.log(options)
    this.setData({
      src: options.src
    })
  },


  onShareAppMessage: function() {

  }
})