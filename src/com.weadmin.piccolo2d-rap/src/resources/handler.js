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
		bindAll(this, [ "layout", "onReady", "onSend", "onRender"]);
		this.parent = rap.getObject(properties.parent); //获取java端的一个图形容器。
		this.element = document.createElement("div");
		this.parent.append(this.element);
		this.parent.addListener("Resize", this.layout);
		this._isDefaulOpenToday = false;
		this._dataObj = {current:{},prev:{},next:{}};
		this._size = properties.size ? properties.size : {
			width : 300,
			height : 300
		};
		this.element.style.width = '100%';//this._size.width+"px";
    this.element.style.height = '100%'; //(this._size.height-20)+"px";

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
				var dt = new Date(this._date.replace(/\-/g,'/'));
				// Creates the graph inside the given container
				this.fishEyeCalendar = new FishEyeCalendar({
					year:dt.getFullYear(),
					month:dt.getMonth()+1,
					currentDay:this._currentDay,
					isDefaulOpenToday:this._isDefaulOpenToday,
					dataObj:this._dataObj,
					lineColor:this._lineColor,
					basePath:PICCOLO2D_BASEPATH,
					container:_this.fishEyeContainer,
					detailContainer:this.detailChartContainer
				});
        /////////////////////
				rap.on("send", this.onSend);
				this.ready = true;
				// this.layout();
			}
		},
		onSend : function() {
			// rap.getRemoteObject( this ).set( "model", "123456789"); //设置后端的值，还有其他两个方法:call(method,properties):调用后端的方法,notify(event,properties);
			// rap.getRemoteObject( this ).call( "handleCallRefreshData", "123456789"); //设置后端的值，还有其他两个方法:call(method,properties):调用后端的方法,notify(event,properties);
			console.log("mxgraph...onSend..")
		},
		setDate:function(obj){
			this._date = obj.date;
			this._currentDay = obj.currentDay; //today date string.
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
			// this._dataObj = obj;
			var dt = new Date(this._date.replace(/\-/g,'/'));
			this.fishEyeCalendar && this.fishEyeCalendar.updateCalendarByDateAndData(dt.getFullYear(),dt.getMonth()+1,this._dataObj,this._isDefaulOpenToday,this._lineColor);
		},
		setSize : function(size) {
			var _this = this;
			if(size.width == _this._size.width && size.height == _this._size.height){ return; }
			if (this.ready) {
				async(this, function() { // Needed by IE for some reason
					_this._size = size;
					console.log('async:size',size);
					_this.element.style.width = size.width+"px";
					_this.element.style.height = (size.height-20)+"px";
					_this.fishEyeCalendar.refreshBySize(_this._size);
				});
			} else {
				this._size = size;
			}
		},
		destroy : function() {
			rap.off("send", this.onSend);
			(this.element && this.element.parentNode) ? this.element.parentNode.removeChild(this.element): null;
		},

		layout : function() {
			// console.log("piccolo2djs...layout..")
			if (this.ready) {
				var area = this.parent.getClientArea();
        console.log("this.parent.getClientArea():",area);
				this.element.style.left = area[0] + "px";
				this.element.style.top = area[1] + "px";
				this.element.style.width = area[2] + "px";
				this.element.style.height = area[3] + "px";
				this._size = {width:area[2],height:area[3]};
				this.fishEyeCalendar.refreshBySize(this._size);
			}
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

}());
