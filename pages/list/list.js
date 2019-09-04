const fetch = require('../../utils/fetch.js')
const app = getApp()
Page({
  data: {
    activeIndex: 0,
    toView: "a0",
    cartList: [],
    currentType: 0,
    currentIndex: 0,
    sumMonney: 0, // 总价钱
    cupNumber: 0, // 购物车里商品的总数量
    showCart: false, // 是否展开购物车
    loading: false,
    containerH: '',
    heightArr: [] // 数组:查找到的所有单元的内容高度
  },
  getUserInfo: function (e) {
    console.log(e.detail.userInfo)
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  onLoad: function(options) {
    // 显示模态对话框
    wx.showLoading({
      title: "努力加载中"
    })
    // 请求数据
    fetch('food/list').then((res) => {
      wx.hideLoading();
      this.setData({
        listData: res.data,
        loading: true
      })
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
  },
  // 点击左侧菜单项选择
  selectMenu: function(e) {
    let index = e.currentTarget.dataset.index
    console.log(index)
    this.setData({
      activeIndex: index,
      toView: "a" + index,
    })
  },
  // 加入购物车
  addToCart: function(e) {
    console.log(e)
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    this.setData({
      currentType: type,
      currentIndex: index,
    });
    var a = this.data
    // 声明数组addItem
    var addItem = {
      "type": type,
      "index": index,
      "name": a.listData[a.currentType].foods[a.currentIndex].name,
      "price": a.listData[a.currentType].foods[a.currentIndex].specfoods[0].price,
      "number": 1,
      "sum": a.listData[a.currentType].foods[a.currentIndex].specfoods[0].price,
    }
    // 把新数组(addItem) push到 原数组cartList
    var cartList = this.data.cartList;
    var result = false;
    for (let i = 0; i < cartList.length; i++) {
      if (cartList[i].name == addItem.name) {
        result = true;
      }
    }
    if (!result) {
      var sumMonney = a.sumMonney + a.listData[a.currentType].foods[a.currentIndex].specfoods[0].price;
      cartList.push(addItem);
      this.setData({
        cartList: cartList,
        showModalStatus: false,
        sumMonney: sumMonney,
        cupNumber: a.cupNumber + 1
      });
    }
  },
  // 移出购物车
  cutToCart: function (e) {
    console.log(e)
    if (this.data.cartList.length > 0) {
      var type = e.currentTarget.dataset.type;
      var index = e.currentTarget.dataset.index;
      this.setData({
        currentType: type,
        currentIndex: index,
      });
      var a = this.data
      // 声明数组addItem
      var cutItem = {
        "type": a.currentType,
        "index": a.currentIndex,
        "name": a.listData[a.currentType].foods[a.currentIndex].name,
        "price": a.listData[a.currentType].foods[a.currentIndex].specfoods[0].price,
        "number": 1,
        "sum": a.listData[a.currentType].foods[a.currentIndex].specfoods[0].price,
      }
      // 把新数组(addItem) 从原数组cartList移除
      var cartList = this.data.cartList;
      var result = false;
      var i = 0;
      console.log(cutItem);
      for (i = 0; i < cartList.length; i++) {
        if (cartList[i].name == cutItem.name) {
          type = cartList[i].type;
          index = cartList[i].index;
          result = true;
          break;
        }
      }
      if (result) {
        var num = cartList[i].number;
        console.log('cut item number ' + num)
        var sum = a.sumMonney - a.listData[type].foods[index].specfoods[0].price * num;
        cartList.splice(i, 1);
        this.setData({
          cartList: cartList,
          showModalStatus: false,
          showCart: false,
          sumMonney: sum,
          cupNumber: this.data.cupNumber - num
        });
      }
    }
  },
  // 展开购物车
  showCartList: function() {
    if (this.data.cartList.length != 0) {
      this.setData({
        showCart: !this.data.showCart,
      });
    }
  },
  // 购物车添加商品数量
  addNumber: function(e) {
    var index = e.currentTarget.dataset.index;
    var cartList = this.data.cartList;
    cartList[index].number++;
    var sum = this.data.sumMonney + cartList[index].price;
    cartList[index].sum += cartList[index].price;
    this.setData({
      cartList: cartList,
      sumMonney: sum,
      cupNumber: this.data.cupNumber + 1
    })
  },
  // 购物车减少商品数量
  decNumber: function(e) {
    var index = e.currentTarget.dataset.index;
    var cartList = this.data.cartList;
    var sum = this.data.sumMonney - cartList[index].price;
    cartList[index].sum -= cartList[index].price;
    cartList[index].number == 1 ? cartList.splice(index, 1) : cartList[index].number--;
    this.setData({
      cartList: cartList,
      sumMonney: sum,
      showCart: cartList.length == 0 ? false : true,
      cupNumber: this.data.cupNumber - 1
    });
  },
  // 清空购物车
  clearCartList: function() {
    this.setData({
      cartList: [],
      showCart: false,
      sumMonney: 0,
      cupNumber: 0
    });
  },
  // 点击"选好了"，缓存购物车的值
  goBalance: function(e) {
    if (this.data.sumMonney == 0) {
      return
    }
    console.log(app.globalData);
    var myDate = new Date();
    var datas = {
      id: myDate.getTime(), num: this.data.cupNumber,
      data: this.data.cartList
    };
    if (app.globalData.token) {
      datas = {
        id: app.globalData.token, num: this.data.cupNumber,
        data: this.data.cartList
      };
    }
    console.log(JSON.stringify(datas));
    fetch("food/order", {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datas),
    }).then(function (res) {
      console.log(res.data)
      if (res.data.error !== 0) {
        wx.showModal({
          title: '下单失败',
          content: '操作失败请重试',
        })
      } else {
        wx.showModal({
          title: '点餐成功',
          content: '暂时不支持刷卡支付功能',
          success: function (res) {
            if (res.cancel) {
              //点击取消,默认隐藏弹框
            } else {
              //点击确定
              fetch("food/sum", {
                method: 'POST',
              }).then(function (res) {
                console.log(res.data)
                if (res.data.error === 0) {
                  wx.showModal({
                    title: '点餐人数统计',
                    content: '目前点餐人数总共有' + res.data.order_id + '人',
                  })
                }
              }).catch(function (error) {
                console.log('Request failed', error);
              });
            }
          },
        })
      }
      // 请求成功后跳转到订单确认页面，把返回的order_id订单编号传过去
      // wx.navigateTo({
      //   url: '../order/balance/balance?order_id=' + res.data.order_id
      // })
    }).catch(function (error) {
      console.log('Request failed', error);
    });
  }
})