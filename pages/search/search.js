const Util = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    userInfo: {},
    page:1,
    allPage:1,
    showTrue:1,
    hisArr:[],
    isGo:false,
    title:'',
    loadTrue:true,
    videoList:[],
    videoContent:[],
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function (){
  	let that = this;
    wx.getStorage({
    	key:'his',
    	success: function(res) {
		    console.log(res.data);
		    let arr = res.data.split(',');
		    that.setData({
		  		hisArr:arr
		  	});
		  },
		  fail:function(res){
		  	that.setData({
		  		hisArr:[]
		  	});
		  }
    });
  },
  onShow:function(){
      let that = this;
      console.log(that.data.isGo);
      if(that.data.isGo){
      	console.log(1);
	      wx.getStorage({
	        key:'operation',
	        success: function(res) { 
	        	console.log(res);
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
	            })     
	        } 
	      });
      };          
  },
  goBack:function(){
  	wx.navigateBack({
		  delta:1
		});
  },
  dianSearch:function(e){
  	let that = this;
  	let titles = e.target.dataset.val;
  	let pages = 1;
  	this.setData({
  		title:titles,
  		page:pages
  	},function(){
  		that.loadVideo(pages,titles,1);
  	});  	
  	
  },
  clearHis:function(){
  	let that = this;
  	wx.removeStorage({
		  key:'his',
		  success: function(res) {
		    that.setData({
		  		hisArr:[]
		  	});
		  } 
		});  	
  },
  loadSearch:function(e){
  	console.log(e);
  	let titles = e.detail.value;
  	if(titles==''){
  		wx.showModal({
			  title: '提示',
			  content: '请输入要搜索的字',
			  showCancel:false,
			  success: function(res) {
			    /*if (res.confirm) {
			      console.log('用户点击确定')
			    } else if (res.cancel) {
			      console.log('用户点击取消')
			    }*/
			  }
			});
  	}else{
  		let that = this;
	  	let pages = 1;
	  	let arr = that.data.hisArr;
	  	arr.unshift(titles);
	  	let arr2 = that.dedupe(arr);
	  	this.setData({
	  		title:titles,
	  		page:pages,
	  		hisArr:arr2
	  	},function(){
	  		let str = arr2.join(',');
	  		console.log(str);
	  		wx.setStorage({
	  			key:"his",
	  			data:str
	  		},);
	  		that.loadVideo(pages,titles,1);
	  	});  	
  	};
  	
  },
  dedupe:function (array){
 		return Array.from(new Set(array));
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
  //url:`../details/details?video_id=${obj.video_id}&inx=${index}&video_path=${obj.video_path}&name=${obj.name}&like=${obj.like}&like_num=${obj.like_num}&time=${obj.time}&video_time=${obj.video_time}&content=${obj.content}&video_activity_id=${obj.video_activity_id}&video_class_id=${obj.video_class_id}&isList=1`,  
  //下拉刷新
  onPullDownRefresh:function(){
  	 wx.stopPullDownRefresh();
  },
  //加载视频
  loadVideo:function(pages,titles,search){
  	let that = this;
  	if (that.data.loadTrue){
  		that.setData({
				loadTrue:false
			});
			console.log(app.ajaxApi.indexLoad);
			let times = parseInt(new Date().getTime()/1000);
  		wx.request({
			  url:app.ajaxApi.indexLoad,
			  data:{
			  	appid:app.defaultTou.appid,
					appsecret:app.defaultTou.appsecret,
					time:times,
					user_id:app.globalData.userInfo.user_id,
			    page:pages,
			    title:titles
			  },
			  method:"GET",
			  header: {
			     'content-type': 'application/json'
			  },
			  success: function(res) {
			    if(res.data.code==1000){
			    		that.videoContext = wx.createVideoContext('myVideo0');			    		
			    		let arr1 = res.data.data?res.data.data:[];
			    		let allPage = res.data.all_page;
			    		let obj = {};
			    		new Promise(function(resolve,reject){
			    			arr1.forEach(function(val){
			    				val.hidden = true;
			    				val.close = true;
			    				val.gifShow = false;
			    				val.gif_path = app.defaultTou.path+val.gif_path;
			    				val.thum_path = app.defaultTou.path+val.thum_path;
			    				val.time = Util.getTime1(val.time);
			    				val.video_time = Util.getVideoTime(val.video_time);
			    				let num = Number(val.like_num)+Number(val.like_num_help);
			    				if(num>10000){
			    					let num1 = parseInt(num/10000);
			    					val.like_shu = `${num1}万+`;
			    				}else{
			    					val.like_shu = num;
			    				};
			    			});
			    			resolve(arr1);
			    			reject();
			    		}).then(function(obj){
		    				let arr = that.data.videoList;
		    				let newVideo = search==1?obj:arr.concat(obj);
		    				that.setData({
				    			page:pages,
				    			loadTrue:true,
				    			showTrue:0,
				    			allPage:allPage,			    			
				    			videoList:newVideo,
				    			
				    		});
			    				
			    		});
			    		//console.log(promas);
			    		
			    }
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
		    console.log(res.data);
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
  		let titles = that.data.title;
  		if(pages<that.data.allPage){
				pages++;
				that.loadVideo(pages,titles,0);
			};
  },
  //点击播放视频
  playVideo:function(e){
    let that = this;
    let arr = this.data.videoList;
    let num = e.target.dataset.idx;
    arr.forEach(function(val,index){
    	val.gifShow = false;
      if(index==num){
        val.hidden = false;
      }else{
        val.hidden = true;
      }
    });
    let  idx = e.target.dataset.ids;
    this.setData({
      videoList:arr
    },function(){
      that.videoContext.pause();
      that.videoContext = wx.createVideoContext(idx);
      that.videoContext.play();
    });
    
    
    
  }
})
