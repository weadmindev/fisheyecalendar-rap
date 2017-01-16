var PICCOLO2D_BASEPATH = "rwt-resources/piccolo2djs/";

(function() {
	'use strict';
	rap.registerTypeHandler("eclipsesource.piccolo2djs", {

		factory : function(properties) {
			return new eclipsesource.piccolo2djs(properties);
		},
		destructor : "destroy",
		methods : ['showList','updateCalendarByDate'],
		properties : [ "size","dataJson","date","lineColor","isDefaulOpenToday"],
		events:[]

	});

	if (!window.eclipsesource) {
		window.eclipsesource = {};
	}

	eclipsesource.piccolo2djs = function(properties) {
		bindAll(this, [ "layout", "onReady", "onSend", "onRender","refreshSize","debounce","showListOrigin"]);
		this.parent = rap.getObject(properties.parent); //获取java端的一个图形容器。
		this.element = document.createElement("div");
		this.parent.append(this.element);
		this.parent.addListener("Resize", this.layout);
		this._date = new Date();
		this._currentDay = new Date();
		this._isDefaulOpenToday = false;
		this._lineColor = {};
		this._dataObj = {current:{},prev:{},next:{}};

		this._size = properties.size ? properties.size : {
			width : 300,
			height : 300
		};
		var area = this.parent.getClientArea();
		this._size = {width:area[2]||300,height:area[3]||300};
		this.element.style.width = '100%';//this._size.width+"px";
    this.element.style.height = '100%';//(this._size.height)+"px";
		// calendar chart container
		this.fishEyeContainer = document.createElement('div');
		this.fishEyeContainer.style.width = "100%";
		this.fishEyeContainer.style.height = "100%";
		this.element.appendChild(this.fishEyeContainer);
		//
		this.detailChartContainer = document.createElement('div');
		this.detailChartContainer.style.width = "100%";
		this.detailChartContainer.style.height = "100%";
		this.element.appendChild(this.detailChartContainer);
		
		this.refreshSize = this.debounce(this.refreshSizeOrigin,500,true);
		this.showListDebounce = this.debounce(this.showListOrigin,300,true);
		rap.on("render", this.onRender);
	};
	eclipsesource.piccolo2djs.prototype = {
		ready : false,
		onReady : function() {
			// TODO [tb] : on IE 7/8 the iframe and body has to be made
			// transparent explicitly
			this.ready = true;
			this.layout();
			console.log("piccolo2djs...onReady..");
		},

		onRender : function() {
      var _this = this;
			if (this.element.parentNode) {
				rap.off("render", this.onRender);
				console.log("piccolo2djs...onRender..");
				// Creates the graph inside the given container
				this.fishEyeCalendar = new FishEyeCalendar({
					year:this._date.getFullYear(),
					month:this._date.getMonth()+1,
					currentDay:this._currentDay,
					isDefaulOpenToday:this._isDefaulOpenToday,
					dataObj:this._dataObj,
					lineColor:this._lineColor,
					basePath:PICCOLO2D_BASEPATH,
					container:this.fishEyeContainer,
					detailContainer:this.detailChartContainer
				});
        /////////////////////
				// rap.on("send", this.onSend);
				this.ready = true;
				// this.layout();
			}
		},
		onSend : function() {
			// rap.getRemoteObject( this ).set( "model", "123456789"); //设置后端的值，还有其他两个方法:call(method,properties):调用后端的方法,notify(event,properties);
			// rap.getRemoteObject( this ).call( "handleCallRefreshData", "123456789"); //设置后端的值，还有其他两个方法:call(method,properties):调用后端的方法,notify(event,properties);
			// console.log("mxgraph...onSend..")
		},
		setDate:function(obj){
			this._date = new Date(obj.date.replace(/\-/g,'/'))
			this._currentDay = new Date(obj.currentDay.replace(/\-/g,'/')); //today date string.
			// console.log('setDate:',obj);
		},
		setLineColor:function(obj){
			this._lineColor = obj;
			// console.log('lineColor:',obj);
		},
		setDataJson:function(obj){
			this._dataObj = obj;
			// console.log('setDataJson:',obj);
		},
		setIsDefaulOpenToday:function(isOpen){
			this._isDefaulOpenToday = isOpen;
			// console.log('_isDefaulOpenToday:',isOpen);
		},
		showList:function(){  //update calendar call
			this.showListDebounce();
		},
		showListOrigin:function(){
			var _this = this;
			// this._dataObj = obj;
			setTimeout(function(){
				// console.log('showList:-----',_this._dataObj);
				_this.fishEyeCalendar && _this.fishEyeCalendar.updateCalendarByDateAndData(
					_this._date.getFullYear(),
					_this._date.getMonth()+1,
					_this._dataObj,
					_this._isDefaulOpenToday,
					_this._lineColor);
			},10);
		},
		setSize : function(size) {
			var _this = this;
			if (this.ready) {
				if(Math.abs(size.width-_this._size.width)<5 && Math.abs(size.height-_this._size.height)<5){ return; }
				console.log('async:size',size);
				async(this, function() { // Needed by IE for some reason
					_this.refreshSize(0,0,size.width,size.height);
				});
			} else {
				this._size = size;
			}
		},
		destroy : function() {
			// rap.off("send", this.onSend);
			(this.element && this.element.parentNode) ? this.element.parentNode.removeChild(this.element): null;
		},

		layout : function() {
			// console.log("piccolo2djs...layout..")
			if (this.ready) {
				var area = this.parent.getClientArea();
				if(Math.abs(area[2]-this._size.width)<5 && Math.abs(area[3]-this._size.height)<5){ return; }
				// console.log("this.parent.getClientArea():",area);
				this.refreshSize(area[0],area[1],area[2],area[3]);
			}
		},
		refreshSizeOrigin:function(left,top,width,height){
			console.log("piccolo2djs...refreshSize..");
			this._size = {width:width,height:height};
			this.element.style.left = left + "px";
			this.element.style.top = top + "px";
			this.element.style.width = width + "px";
			this.element.style.height = height + "px";

			this.fishEyeCalendar.refreshBySize(this._size);
		},
		debounce :function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };
	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  }

	};

	var bind = function(context, method) {
		return function() {
			return method.apply(context, arguments);
		};
	};

	var bindAll = function(context, methodNames) {
		for (var i = 0; i < methodNames.length; i++) {
			var method = context[methodNames[i]];
			context[methodNames[i]] = bind(context, method);
		}
	};

	var async = function(context, func) {
		window.setTimeout(function() {
			func.apply(context);
		}, 0);
	};

	var now = Date.now || function() {
    return new Date().getTime();
  };

}());
