//app.js
App({
  	onLaunch: function () {
	  	let that = this;
	    //调用API从本地缓存中获取数据
	    var logs = wx.getStorageSync('logs') || []
	    logs.unshift(Date.now())
	    wx.setStorageSync('logs', logs);	    
  	},
  	getUserInfo:function(cb){
    	var that = this
    	if(this.globalData.userInfo){
      		typeof cb == "function" && cb(this.globalData.userInfo)
    	}else{
      		//调用登录接口
      		wx.login({
	        	success: function () {
	          		wx.getUserInfo({
	            		success: function (res) {            	
	              			that.globalData.userInfo = res.userInfo
	              			typeof cb == "function" && cb(that.globalData.userInfo)
	            		}
	          		})
	        	}
      		})
    	}
  	},
  	defaultTou:{
  		appid:"WXAPP",
  		appsecret:"095d6ef572a1a5ca5cc51de31b5b7436",
  		user_id:1,
  		path:"http://wxapp.xingwt.com"
  	},
  	/*ajaxApi:{
  		author:"http://wxapp.xingwt.com/api/user/authorization",
  		indexLoad:'http://localhost/data/video.json',
	  	column:'http://localhost/data/column.json',
	  	details:'http://localhost/data/details.json',
	  	activity:'http://localhost/data/column.json',
	  	like:'http://localhost/data/videoZan.json',
	  	unlike:'http://localhost/data/videoZan.json'
  	},*/
  	ajaxApi:{
	  	author:"http://wxapp.xingwt.com/api/user/authorization",
	  	indexLoad:'http://wxapp.xingwt.com/api/video/videoList',
	  	column:'http://wxapp.xingwt.com/api/video/videoClassList',
	  	details:'http://wxapp.xingwt.com/api/video/videodetails.json',
	  	activity:'http://wxapp.xingwt.com/api/video/videoActivityList',
	  	like:'http://wxapp.xingwt.com/api/video/like',
	  	unlike:'http://wxapp.xingwt.com/api/video/unlike'
  	},
  	globalData:{
	    userInfo:{
	    	user_id:0
	    }
  	}
})