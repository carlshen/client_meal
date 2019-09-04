//app.js
App({
  //定义全局变量：是否刷新页面。为false不执行刷新
  isReloadOrderList: false,
  onLaunch: function () {
    this.checkLogin(res => {
      console.log('is_login: ', res.is_login)
      if (!res.is_login) {
        this.login()
      }
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 执行到此处表示用户已经授权，可以直接获取到用户信息
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo)
              this.globalData.userInfo = res.userInfo
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  login: function () {
    wx.login({
      success: res => {
        console.log('login code: ' + res.code)
        wx.request({
          url: 'http://192.168.40.236/api/login',
          method: 'post',
          data: { code: res.code },
          success: res => {
            console.log('token: ' + res.data.token)
            // 将token保存为公共数据（用于在多页面中访问）
            this.globalData.token = res.data.token
            // 将token保存到数据缓存（下次打开小程序无需重新获取token）
            wx.setStorage({ key: 'token', data: res.data.token })
          }
        })
      }
    })
  },
  checkLogin: function (callback) {
    var token = this.globalData.token
    if (!token) {
      // 从数据缓存中获取token
      token = wx.getStorageSync('token')
      if (token) {
        this.globalData.token = token
      } else {
        callback({ is_login: false })
        return
      }
    }
    wx.request({
      url: 'http://192.168.40.236/api/checklogin',
      data: { token: token },
      success: res => {
        callback({ is_login: res.data.is_login })
      }
    })
  },
  globalData: {
    userInfo: null,
    hasUserInfo: false,
    token: null	// 保存token
  }
})