//app.js
App({
  //定义全局变量：是否刷新页面。为false不执行刷新
  isReloadOrderList: false,
  onLaunch: function () {
    // this.checkLogin(res => {
    //   console.log('is_login: ', res.is_login)
    //   if (!res.is_login) {
    //     this.login()
    //   }
    // })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 执行到此处表示用户已经授权，可以直接获取到用户信息
          wx.getUserInfo({
            success: res => {
              console.log(res)
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
  globalData: {
    userInfo: null,
    hasUserInfo: false,
    token: null	// 保存token
  }
})