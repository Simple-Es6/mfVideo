//const WxParse = require('../../wxParse/wxParse.js');
const Util = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    userInfo: {},
    page:1,
    allPage:1,
    isList:1,
    vIndex:null,
    loadTrue:false,
    videoList:[],
    videoObj:{}
  },
  onLoad: function (option){
  	console.log(option);
  	let isL = option.isList,
  			vid = option.vid,
  			vClass = option.vClass,
  			index = option.inx,  	
  			that = this;
    that.setData({
    	vIndex:option.inx,
    	isList:isL
    },function(){
    	that.loadDetails(vid);
    	that.loadVideo(vClass);
    });
  	
  },
  onShareAppMessage:function(){
  	let that = this;
  	let obj = that.data.videoObj; 
    return {
      title:obj.name,
      path: `/pages/details/details?isList=0&inx=1&vid=${obj.video_id}&vClass=${obj.video_class_id}`,
      success: function(res) {
        // 转发成功
        console.log(res);
      },
      fail: function(res) {
        // 转发失败
      }
  	}
  },
  //下拉刷新
  onPullDownRefresh:function(){
  	 wx.stopPullDownRefresh();
  },
  //加载视频详情
  loadDetails:function(ids){
  	let that = this;
		console.log(app.ajaxApi.indexLoad);
		let times = parseInt(new Date().getTime()/1000);
  	wx.request({
		  url:app.ajaxApi.indexLoad,
		  data:{
		  	appid:app.defaultTou.appid,
				appsecret:app.defaultTou.appsecret,
				time:times,
				id:ids,
				user_id:app.globalData.userInfo.user_id
		  },
		  method:"GET",
		  header: {
		     'content-type': 'application/json'
		  },
		  success: function(res) {
		    console.log(res.data);
		    if(res.data.code==1000){			    		
						let arr = res.data.data;
						wx.setNavigationBarTitle({
						  title:arr[0].name
						});
						new Promise(function(resolve,reject){
		    			arr.forEach(function(val){
		    				val.video_time = Util.getVideoTime(val.video_time);
		    				val.time = Util.getTime1(val.time);
		    				val.thum_path = app.defaultTou.path+val.thum_path;
		    				let num = Number(val.like_num)+Number(val.like_num_help);
		    				if(num>10000){
		    					let num1 = parseInt(num/10000);
		    					val.like_shu = `${num1}万+`;
		    				}else{
		    					val.like_shu = num;
		    				};
		    			});
		    			resolve(arr);
		    			reject();
		    	}).then(function(obj){
	    				that.setData({
								videoObj:obj[0],
								loadTrue:true
							});		    				
		    		});
		    };
		  },
		  fail:function(){
		  	console.log(res);
		  }
		}); 	
  },
  //加载推荐视频
  loadVideo:function(vClass){
  	let that = this;
		console.log(app.ajaxApi.indexLoad);
		let times = parseInt(new Date().getTime()/1000);
		wx.request({
		  url:app.ajaxApi.indexLoad,
		  data:{
		  	appid:app.defaultTou.appid,
				appsecret:app.defaultTou.appsecret,
				time:times,
				video_class_id:vClass,
				user_id:app.globalData.userInfo.user_id
		  },
		  method:"GET",
		  header: {
		     'content-type': 'application/json'
		  },
		  success: function(res) {
		    console.log(res.data);
		    if(res.data.code==1000){			    		
						let arr = res.data.data;
						new Promise(function(resolve,reject){
		    			arr.forEach(function(val){
		    				val.video_time = Util.getVideoTime(val.video_time);
		    				val.gif_path = app.defaultTou.path+val.gif_path;
		    				val.thum_path = app.defaultTou.path+val.thum_path;
		    			});
		    			resolve(arr);
		    			reject();
		    	}).then(function(obj){
	    				that.setData({
								videoList:obj
							});		    				
		    		});
		    };
		  },
		  fail:function(){
		  	console.log(res);
		  }
		});
  },
  //视频点赞
  videoZan:function(e){
  	let that = this;
  	let nowLike = e.target.dataset.like;
  	let vids = e.target.dataset.vid;
  	let times = parseInt(new Date().getTime()/1000);
  	let urls = nowLike==1?app.ajaxApi.unlike:app.ajaxApi.like;
		wx.request({
		  url:urls,
		  data:{
		    appid:app.defaultTou.appid,
				appsecret:app.defaultTou.appsecret,
				time:times,
				user_id:app.globalData.userInfo.user_id,
				video_id:vids				
		  },
		  method:"GET",
		  header: {
		     'content-type': 'application/json'
		  },
		  success: function(res) {
		    console.log(res.data);
		    if(res.data.code==1000){
		    		let arr = that.data.videoObj;
		    		let num = Number(arr.like_num),
	    					num2 = Number(arr.like_num_help);
		    		if (nowLike==1) {
		    				arr.like = 0;
		    				num--;
		    				arr.like_num = num;		    				
		    		} else{
		    				num++;	
		    				arr.like_num = num;
		    				arr.like = 1;
		    		};
		    		let num3 = num +num2;
						if(num3>=10000){
							let num4 = parseInt(num3/10000);
							arr.like_shu = `${num4}万+`;
						}else{
							arr.like_shu = num3;
						};	
		    		that.setData({
		    				videoObj:arr
		    		},function(){
		    			if(that.data.isList==1){
		    				wx.setStorage({
		              key:"operation",
		              data:{
		                  operation:true,
		                  like:arr.like,
		                  inx:that.data.vIndex,
		                  like_shu:arr.like_shu
		              }
	          		});
		    			};		    			
		    		});		    		
		    }
		  },
		  fail:function(res){
		  	console.log(res);
		  }
		});  	
  },
  //前往详情页
  goDetails:function(e){
  	let that = this;
  	let index = e.target.dataset.inx;
  	let obj = this.data.videoList[index];
  	if (that.data.isList==1){
	  	wx.navigateTo({
				url:`../details/details?isList=0&inx=${index}&vid=${obj.video_id}&vClass=${obj.video_class_id}`
	  	});
  	} else{
  		wx.redirectTo({
				url:`../details/details?isList=0&inx=${index}&vid=${obj.video_id}&vClass=${obj.video_class_id}`
	  	});
  		/*wx.redirectTo({
				url:`../details/details?video_id=${obj.video_id}&video_path=${obj.video_path}&name=${obj.name}&like=${obj.like}&like_num=${obj.like_num}&time=${obj.time}&video_time=${obj.video_time}&content=${obj.content}&video_activity_id=${obj.video_activity_id}&video_class_id=${obj.video_class_id}&isList=0`  			
  		});*/
  	};
  	
  }
})
