const Util = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    userInfo: {},
    page:1,
    allPage:1,
    loadTrue:true,
    columnList:[],
    videoContent:[],
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function (){    
    this.loadVideo(1);
  },
  //下拉刷新
  onPullDownRefresh:function(){
  	 wx.stopPullDownRefresh();
  },
  //加载栏目
  loadVideo:function(){
  	let that = this;
  	console.log()
  	if (that.data.loadTrue){
  		that.setData({
				loadTrue:false
			});
			let times = parseInt(new Date().getTime()/1000);
			console.log(app.ajaxApi.activity);
  		wx.request({
			  url:app.ajaxApi.activity,
			  data:{
			    appid:app.defaultTou.appid,
					appsecret:app.defaultTou.appsecret,
					time:times
			  },
			  method:"GET",
			  header: {
			     'content-type': 'application/json'
			  },
			  success: function(res) {
			    console.log(res.data);
			    if(res.data.code==1000){
			    		let arr1 = res.data.data?res.data.data:[];
			    		//详情文字的数组
			    		//let arr4 = that.data.videoContent;
			    		let arr3 = [];
			    		
			    		let obj = {};
			    		new Promise(function(resolve,reject){
			    			arr1.forEach(function(val){
			    				val.hidden = true;
			    				val.close = true;
			    				val.gifShow = false;
			    				val.thum_path = app.defaultTou.path+val.thum_path;
			    				val.updatetime = Util.getTime(val.updatetime);
			    			});
			    			resolve(arr1);
			    			reject();
			    		}).then(function(obj){
			    			console.log(obj);
		    				let arr = that.data.columnList;
		    				let newVideo = arr.concat(obj);
		    				that.setData({
				    			loadTrue:true,		
				    			columnList:newVideo				    			
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
  //前往列表
  goList:function(e){
  	//let num = e.target.dataset.inx;
  	console.log(e);
  	let id = e.target.dataset.cid;
  	wx.navigateTo({
  		url:`../list/list?isColumn=0&id=${id}`
		});
  },
  //显示gif图片
  playGif:function(e){
  	console.log(e);
  	let that = this;
    let arr = this.data.columnList;
    let num = e.target.dataset.idx;
    arr[num].gifShow = true;
    that.setData({
      columnList:arr
    });
  },
  tapClose:function(e){
  	let that = this;
    let arr = this.data.columnList;
    let num = e.target.dataset.idx;
    arr[num].close = !arr[num].close;
    that.setData({
      columnList:arr
    });
  }
  
})

