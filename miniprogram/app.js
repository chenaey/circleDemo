  //app.js
  const systemInfo = wx.getSystemInfoSync()
  App({
    onLaunch: function() {

      //云开发
      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      } else {
        wx.cloud.init({
          traceUser: true,
        })
      }

      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res.userInfo

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            })
          }
        },

        getUserInfo: function(e) {
          app.globalData.userInfo = e.detail.userInfo
          this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
          })
        },


      })



    },
    globalData: {
      userInfo: null,

    },

  })