//const WxParse = require('../../wxParse/wxParse.js');
const Util = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    userInfo: {},
    page:1,
    isGo:false,
    allPage:1,
    loadTrue:true,
    playTime:0,
    isFirst:false,
    videoList:[],
    videoContent:[],
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function (){
  	let that = this;
  	wx.login({
		    success: function (rq) {
		    	//console.log(rq);
		    	let codes = rq.code;
		    	wx.request({
			  		url:'https://api.weixin.qq.com/sns/jscode2session',
			  		data:{
			  			appid:'wxa4e31536ff79fe03',
			  			secret:'ade018c5e0969f196b9cd8e9853bb3a5',
			  			js_code:codes,
			  			grant_type:'authorization_code',
			  		},
			  		method:"GET",
			  		header: {
			    		'content-type': 'application/json'
						},
						success:function(ress){
							let openids = ress.data.openid;
					  	wx.getUserInfo({
				        success: function (res) {
				        	//console.log(res);
				        	let times = parseInt(new Date().getTime()/1000);
				        	let dataObj = res.userInfo;
				        	dataObj.time = times;
				        	dataObj.appid = "WXAPP";
				        	dataObj.nickname = dataObj.nickName;
				        	dataObj.headimg = dataObj.avatarUrl;
				        	dataObj.openid = openids;
				        	delete dataObj.nickName;
				        	delete dataObj.avatarUrl;
				        	//delete dataObj.headimg;
				        	dataObj.appsecret = "095d6ef572a1a5ca5cc51de31b5b7436";
				        	wx.request({
							  		url:'http://wxapp.xingwt.com/api/user/authorization',
							  		data:dataObj,
							  		method:"GET",
							  		header: {
							    		'content-type': 'application/json'
										},
										success:function(res){
									  		//console.log(res);
									  		dataObj.user_id = res.data.data.user_id;
									  		app.globalData.userInfo = dataObj;
									  		//console.log(app.globalData.userInfo);
									  		that.loadVideo(1);
									  		wx.setStorage({
				                  key:"user_id",
				                  data:res.data.data.user_id
				                });
									  		that.setData({
									  			userInfo:dataObj
									  		});
										},
								  	fail:function(res){
								  		console.log(res);
								  	}
									});			          
					    	}
					    });
						},
				  	fail:function(res){
				  		console.log(res);
				  	}
					});	
		  }
	  });
    
  },
  goSearch:function(){
  		wx.navigateTo({
			  url: '../search/search'
			});
  },
  goDetails:function(e){
  	let  that = this;
  	let index = e.target.dataset.inx;
  	let obj = this.data.videoList[index];
  	wx.navigateTo({
			url:`../details/details?isList=1&inx=${index}&vid=${obj.video_id}&vClass=${obj.video_class_id}`,			
			success:function(){
				that.setData({
					isGo:true
				});
			}
  	});
  },
  onShow:function(){
      let that = this;
      if(that.data.isGo){      	
	      wx.getStorage({
	        key:'operation',
	        success: function(res) { 
	        	//console.log(res);
            let list = that.data.videoList;
            if (res.data.operation){                	             
                let idx = res.data.inx;
                list[idx].like = res.data.like;
                list[idx].like_shu = res.data.like_shu;	                              
	              that.setData({
	                  videoList:list,
	                  isGo:false
	              });
            };
            wx.removeStorage({
              key: 'operation',
              success: function(res) {
              	  
              } 
            });     
	        } 
	      });
      };          
  },
  //播放暂停
  pauseVideo:function(e){
  	console.log(e);
  	let num = parseInt(e.detail.currentTime);
  	let vids = e.target.dataset.vid;
  	console.log(num);
  	this.setData({
  		playTime:num,
  		playId:vids
  	});
  },
  //send停止时间
  sendTime:function(vid,hour){
  	let times = parseInt(new Date().getTime()/1000);			
		wx.request({
		  url:app.ajaxApi.indexLoad,
		  data:{
		  	appid:app.defaultTou.appid,
				appsecret:app.defaultTou.appsecret,
				time:times,
				vTime:hour,
				video_id:vid,
				user_id:app.globalData.userInfo.user_id
		  },
		  method:"GET",
		  header: {
		     'content-type': 'application/json'
		  },
		  success: function(res) {
		    console.log(res.data);
		    /*if(res.data.code==1000){
		    	
		    }*/
		  },
		  fail:function(){
		  	console.log(res);
		  }
		});
  },
  //下拉刷新
  onPullDownRefresh:function(){
  	 wx.stopPullDownRefresh();
  },
  //加载视频
  loadVideo:function(pages){
  	let that = this;
  	//console.log(app.globalData.userInfo);
  	if (that.data.loadTrue){
  		that.setData({
				loadTrue:false
			});
			//console.log(app.ajaxApi.indexLoad);
			let times = parseInt(new Date().getTime()/1000);			
  		wx.request({
			  url:app.ajaxApi.indexLoad,
			  data:{
			  	appid:app.defaultTou.appid,
					appsecret:app.defaultTou.appsecret,
					time:times,
					user_id:app.globalData.userInfo.user_id,
			    page:pages
			  },
			  method:"GET",
			  header: {
			     'content-type': 'application/json'
			  },
			  success: function(res) {
			    //console.log(res.data);
			    if(res.data.code==1000){
			    		that.videoContext = wx.createVideoContext('myVideo0');			    		
			    		let arr1 = res.data.data?res.data.data:[];
			    		let allPage = res.data.all_page;
			    		//详情文字的数组
			    		let arr4 = that.data.videoContent;
			    		let arr3 = [];
			    		let obj = {};
			    		new Promise(function(resolve,reject){
			    			arr1.forEach(function(val){
			    				val.hidden = true;
			    				val.close = true;
			    				val.gifShow = false;
			    				val.gif_path = app.defaultTou.path+val.gif_path;
			    				val.thum_path = app.defaultTou.path+val.thum_path;
			    				val.time = Util.getTime1(val.time);
			    				let num = Number(val.like_num)+Number(val.like_num_help);
			    				if(num>10000){
			    					let num1 = parseInt(num/10000);
			    					val.like_shu = `${num1}万+`;
			    				}else{
			    					val.like_shu = num;
			    				};
			    				val.video_time = Util.getVideoTime(val.video_time);
			    			});
			    			resolve(arr1);
			    			reject();
			    		}).then(function(obj){
		    				let arr = that.data.videoList;
		    				let newVideo = arr.concat(obj);
		    				that.setData({
				    			page:pages,
				    			loadTrue:true,
				    			allPage:allPage,			    			
				    			videoList:newVideo				    			
				    		});			    				
			    		});			    		
			    };
			  },
			  fail:function(){
			  	console.log(res);
			  }
			});
		};  	
  },
  //显示gif图片
  playGif:function(e){
  	console.log(e);
  	let that = this;
    let arr = this.data.videoList;
    let num = e.target.dataset.idx;
    arr[num].gifShow = true;
    that.setData({
      videoList:arr
    });
  },
  //视频点赞
  videoZan:function(e){
  	let that = this;
  	let index = e.target.dataset.inx;
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
		    if(res.data.code==1000){
	    		let arr = that.data.videoList;
	    		let num = Number(arr[index].like_num),
	    				num2 = Number(arr[index].like_num_help);		    						    		
	    		if (nowLike==1) {
	    				arr[index].like = 0;
	    				num--;
	    				arr[index].like_num = num;		    				
	    		} else{
	    				num++;	
	    				arr[index].like_num = num;
	    				arr[index].like = 1;
	    		};
	    		let num3 = num +num2;
					if(num3>=10000){
						let num4 = parseInt(num3/10000);
						arr[index].like_shu = `${num4}万+`;
					}else{
						arr[index].like_shu = num3;
					};
	    		console.log(arr);
	    		that.setData({
	    				videoList:arr
	    		});
		    		
		   };
		  },
		  fail:function(res){
		  	console.log(res);
		  }
		});  	
  },
  tapClose:function(e){
  	let that = this;
    let arr = this.data.videoList;
    let num = e.target.dataset.idx;
    arr[num].close = !arr[num].close;
    that.setData({
      videoList:arr
    });
  },
  //上拉加载更多
  onReachBottom:function(){
  		let that = this;
  		let pages = that.data.page;
  		if(pages<that.data.allPage){
				pages++;
				that.loadVideo(pages);
			}
  },
  //点击播放视频
  playVideo:function(e){
    //console.log(e);
    let that = this;
    let arr = this.data.videoList;
    let num = e.target.dataset.idx;
    //console.log(num);
    if(that.data.isFirst){
    	that.sendTime(that.data.playId,that.data.playTime);
    };
    arr.forEach(function(val,index){
    	val.gifShow = false;
      if(index==num){
        val.hidden = false;
      }else{
        val.hidden = true;
      }
    });
    let  idx = e.target.dataset.ids;
    console.log(that.videoContext);
    this.setData({
      videoList:arr,
      isFirst:true
    },function(){
      that.videoContext.pause();      
      that.videoContext = wx.createVideoContext(idx);
      that.videoContext.play();
    });  
  }
})
