var PICCOLO2D_BASEPATH = "rwt-resources/piccolo2djs/";

(function() {
	'use strict';
	rap.registerTypeHandler("eclipsesource.piccolo2djs", {

		factory : function(properties) {
			return new eclipsesource.piccolo2djs(properties);
		},
		destructor : "destroy",
		methods : ['showList','updateCalendarByDate'],
		properties : [ "size",'date','lineColor'],
		events:[]

	});

	if (!window.eclipsesource) {
		window.eclipsesource = {};
	}

	eclipsesource.piccolo2djs = function(properties) {
		console.log("piccolo2djs....." , properties)
		bindAll(this, [ "layout", "onReady", "onSend", "onRender"]);
		this.parent = rap.getObject(properties.parent); //获取java端的一个图形容器。
    console.log("this.parent:",this.parent);
		this.element = document.createElement("div");
		this.parent.append(this.element);
		this.parent.addListener("Resize", this.layout);

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
				console.log("have the parentNode onRender!!!!");
				rap.off("render", this.onRender);
				// Creates the graph inside the given container
				this.fishEyeCalendar = new FishEyeCalendar({
					year:dt.getFullYear(),
					month:dt.getMonth()+1,
					// todayIndex:this._currentDay,
					dataObj:this.dataObj,
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
		onSend : function() { //要浏览器客户端任何一个操作就会触发。
			// rap.getRemoteObject( this ).set( "model", "123456789"); //设置后端的值，还有其他两个方法:call(method,properties):调用后端的方法,notify(event,properties);
			// rap.getRemoteObject( this ).call( "handleCallRefreshData", "123456789"); //设置后端的值，还有其他两个方法:call(method,properties):调用后端的方法,notify(event,properties);
			console.log("mxgraph...onSend..")
		},
		setDate:function(obj){
			this._date = obj.date;
			console.log('setDate:',obj);
		},
		setLineColor:function(obj){
			console.log('lineColor:',obj);
		},
		showList:function(obj){
			console.log('showList:',obj);
			this.dataObj = obj;
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
					_this.fishEyeCalendar.refreshAll(_this._size);
				});
			} else {
				this._size = size;
			}
		},
		updateCalendarByDate:function(obj){
			this._date = obj.date;
			var dt = new Date(obj.date);
			this.fishEyeCalendar.refreshCalendarByYearMonth(dt.getFullYear(),dt.getMonth()+1);
		},
		destroy : function() {
			rap.off("send", this.onSend);
			this.element.parentNode.removeChild(this.element);
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
				this.fishEyeCalendar.refreshAll(this._size);
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
