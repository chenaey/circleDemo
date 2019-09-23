const app = getApp()
Page({

  data: {
    wallData: [],
    showZan: -1, //显示点赞按钮
    showPinLun: false,
    nmAvator: '/image/pyq/ng.jpg',
    commentValue: '',
    placeholderPL: '评论',
    userInfo: undefined,
    batchTimes: undefined, //分页
    btoText: "正在加载...",
    adminOpenid: "oOmqu4pDpN-1db4Ms_U0fjmCfBAw",
    shareObg: {
      title: '仲恺校友圈',
      desc: '',
      path: '/pages/pyq/circle/index',
      imageUrl: "/image/pyq/pyq03.jpg",
    } //转发样式
  },


  getcomment(e) {
    // console.log(e)
    this.setData({
      commentValue: e.detail.value
    })
  },




  bindComment(e) {
    console.log(e.currentTarget.dataset)
    this.setData({
      placeholderPL: "回复: " + e.currentTarget.dataset.name,
      showZan: e.currentTarget.dataset.indexn,
      showPinLun: true,
    })
  },

  showPinLun() {
    var main = this.data.wallData[this.data.showZan].userInfo.nickName
    this.setData({
      placeholderPL: "留言: " + main,
      showPinLun: !this.data.showPinLun,
    })
  },

  previewImage: function(e) {
    console.log(e)
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: e.currentTarget.dataset.images // 需要预览的图片http链接列表
    })
  },

  dianzan(e) {
    console.log(e.currentTarget.dataset)
    console.log(e.currentTarget.dataset.indexn)
    if (!this.data.userInfo) {
      wx.pageScrollTo({
        scrollTop: 200,
      })
      wx.showToast({
        title: '需要授权才能点赞评论,见第一条墙消息.',
        icon: 'none'
      })
      return
    }

    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      console.log(res.result.openid)
      var isZan = this.data.wallData[e.currentTarget.dataset.indexn].zans.some(a => {
        return a.openid === res.result.openid
      })
      console.log(isZan)
      //未点赞
      if (!isZan) {
        var data = this.data.wallData
        data[e.currentTarget.dataset.indexn].zans.push({
          name: this.data.userInfo.nickName
        })
        data[e.currentTarget.dataset.indexn].zanText = data[e.currentTarget.dataset.indexn].zans.map(a => {
          return a.name
        }).join(", ")
        this.setData({
          wallData: data
        })
        wx.cloud.callFunction({
          name: 'chat',
          data: {
            type: 'zan',
            collectionname: 'circle',
            data: {
              username: this.data.userInfo.nickName,
              _id: e.currentTarget.dataset._id
            }
          }
        }).then(res => {
          //刷新此项数据
          // const db = wx.cloud.database()
          // db.collection("circle").doc(e.currentTarget.dataset._id).get().then(
          //   res => {
          //     console.log(res.data)
          //     var data = this.data.wallData
          //     data[e.currentTarget.dataset.indexn] = res.data
          //     for (let i = 0; i < data.length; i++) {
          //       data[i].time = this.parseTime(data[i].createTime.getTime())
          //       data[i].zanText = data[i].zans.map(a => {
          //         return a.name
          //       }).join(", ")
          //     }
          //     this.setData({
          //       wallData: data
          //     })
          //   }
          // )
        })
      }
      this.setData({
        showZan: -1,
        placeholderPL: "留言"
      })
    })

  },

  submitComment(e) {
    if (!this.data.userInfo) {
      wx.pageScrollTo({
        scrollTop: 200,
      })
      wx.showToast({
        title: '需要授权才能点赞评论,见第一条墙消息.',
        icon: 'none',
        duration: 5000
      })
      return
    }
    if (this.data.commentValue.length <= 0) {
      wx.showToast({
        title: '内容为空',
        icon: 'none'
      })
      return
    }
    var _id = this.data.wallData[this.data.showZan]._id
    var formId = e.detail.formId
    var toName = ""
    if (this.data.placeholderPL.includes("回复")) {
      toName = this.data.placeholderPL.replace("回复:", "")
      console.log(toName)
    }
    wx.cloud.callFunction({
      name: 'chat',
      data: {
        type: 'comment',
        collectionname: 'circle',
        data: {
          username: this.data.userInfo.nickName,
          userInfo: this.data.userInfo,
          formId: formId,
          _id: _id,
          comment: this.data.commentValue,
          toName: toName
        }
      }
    }).then(res => {
      console.log(res)

      //更新这条数据
      const db = wx.cloud.database()
      db.collection("circle").doc(_id).get().then(
        res => {
          console.log(res.data)
          var data = this.data.wallData
          console.log(data)
          console.log(e.currentTarget.dataset.indexn)
          data[this.data.showZan] = res.data

          for (let i = 0; i < data.length; i++) {
            data[i].time = this.parseTime(data[i].createTime.getTime())
            data[i].zanText = data[i].zans.map(a => {
              return a.name
            }).join(", ")
          }
          this.setData({
            wallData: data,
            showZan: -1,
            placeholderPL: "留言",
            showPinLun: false,
            commentValue: ""
          })
        }
      )
    })
  },

  copyText(e) {
    console.log(e.currentTarget.dataset.text)
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
    })

  },


  adminDeletePyq(e) {
    var that = this
    var item = e.currentTarget.dataset.item
    const db = wx.cloud.database()
    wx.showModal({
      title: '提示',
      content: '确定删除吗',
      cancelText: '取消',
      confirmText: '删除',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'chat',
            data: {
              type: 'delete',
              collectionname: 'circle',
              data: {
                fileIDs: item.images,
                _id: item._id
              }
            }
          }).then(res => {
            var data = that.data.wallData
            data.splice(e.currentTarget.dataset.index, 1)
            that.setData({
              wallData: data
            })

          })
        }
      }
    })

  },

  deletePyq(e) {
    console.log(e.currentTarget.dataset.item)
    console.log(e.currentTarget.dataset.index)
    var that = this
    var item = e.currentTarget.dataset.item
    const db = wx.cloud.database()
    wx.showModal({
      title: '提示',
      content: '确定删除吗',
      cancelText: '取消',
      confirmText: '删除',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var data = that.data.wallData
          data.splice(e.currentTarget.dataset.index, 1)
          that.setData({
            wallData: data
          })

          db.collection('circle').doc(item._id).remove()
            .then(console.log)
            .catch(console.error)

          db.collection('circleback').add({
            data: {
              userInfo: item.userInfo,
              createTime: item.createTime,
              content: item.content,
              zans: item.zans,
              images: item.images,
              comments: item.comments,
            },
          })

        } else if (res.cancel) {}
      }
    })
  },

  onLoad: function(options) {
    var that = this
    console.log(options)
    this.setData({
      id: options.id
    })
    this.getMyWallData(options.id)

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      // 查看是否授权
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.getUserInfo({
              success(res) {
                that.setData({
                  userInfo: res.userInfo
                })
              }
            })
          }
        }
      })
    }

  },



  toShowZan(e) {
    if (e.currentTarget.dataset.index === this.data.showZan) {
      this.setData({
        showZan: -1,
        placeholderPL: "留言"
      })
    } else {
      this.setData({
        showZan: e.currentTarget.dataset.index
      })
    }
  },



  onPullDownRefresh: function() {
    this.getMyWallData(this.data.id)
  },


  toEdit() {
    wx.navigateTo({
      url: '../edit/index',
    })

  },


  toHome() {
    wx.navigateTo({
      url: './index',
    })
  },

  getMyWallData(id) {
    console.log(id)
    wx.showNavigationBarLoading()
    const db = wx.cloud.database()
    db.collection("circle").where({
      _id: id
    }).get().then(res => {
      console.log(res)
      console.log("MY")

      var zanText
      for (let i = 0; i < res.data.length; i++) {
        res.data[i].time = this.parseTime(res.data[i].createTime.getTime())
        res.data[i].zanText = res.data[i].zans.map(a => {
          return a.name
        }).join(", ")
      }
      var data = res.data.sort(function(a, b) {
        return b.createTime.getTime() - a.createTime.getTime()
      })
      this.setData({
        wallData: data
      })
      wx.hideNavigationBarLoading()

    })
  },

  onShow: function() {
    // this.getWallData(0, this.data.wallData.length, false)

  },
  onShareAppMessage: function(e) {
    console.log(e)
    console.log(this.data.showZan)
    var that = this
    var item = e.target.dataset.item
    console.log(item)
    var imageUrl = "/image/pyq/pyq03.jpg"
    if (item.images.length > 0) {

    }
    var shareObg = {
      // title: '仲恺校友圈',
      desc: item.content,
      path: '/pages/pyq/circle/index',
      imageUrl: imageUrl,
    } //转发
    return shareObg
  },

  onPageScroll: function(e) {
    this.setData({
      showZan: -1,
      placeholderPL: "留言",
      showPinLun: false,
    })
  },
  parseTime(dateTimeStamp) { //dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
    var minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime(); //获取当前时间毫秒
    var diffValue = now - dateTimeStamp; //时间差

    if (diffValue < 0) {
      return;
    }
    var minC = diffValue / minute; //计算时间差的分，时，天，周，月
    var hourC = diffValue / hour;
    var dayC = diffValue / day;
    var weekC = diffValue / week;
    var monthC = diffValue / month;
    var result = "23分钟前"
    if (monthC >= 1 && monthC <= 3) {
      result = " " + parseInt(monthC) + "月前"
    } else if (weekC >= 1 && weekC <= 3) {
      result = " " + parseInt(weekC) + "周前"
    } else if (dayC >= 1 && dayC <= 6) {
      result = " " + parseInt(dayC) + "天前"
    } else if (hourC >= 1 && hourC <= 23) {
      result = " " + parseInt(hourC) + "小时前"
    } else if (minC >= 1 && minC <= 59) {
      result = " " + parseInt(minC) + "分钟前"
    } else if (diffValue >= 0 && diffValue <= minute) {
      result = "刚刚"
    } else {
      var datetime = new Date();
      datetime.setTime(dateTimeStamp);
      var Nyear = datetime.getFullYear();
      var Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
      var Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
      var Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
      var Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
      var Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
      result = Nyear + "-" + Nmonth + "-" + Ndate
    }
    return result;
  },



})