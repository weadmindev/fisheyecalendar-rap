var PICCOLO2D_BASEPATH = "rwt-resources/piccolo2djs/";

(function() {
	'use strict';


	rap.registerTypeHandler("eclipsesource.piccolo2djs", {

		factory : function(properties) {
			return new eclipsesource.piccolo2djs(properties);
		},

		destructor : "destroy",
		methods : ['showList'],
		properties : [ "size",'date'],
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
		this.element.style.width = this._size.width+"px";
    this.element.style.height = (this._size.height-20)+"px";

		// calendar chart container
		this.fishEyeContainer = document.createElement('div');
		this.fishEyeContainer.style.width = "100%";
		this.fishEyeContainer.style.height = "100%";
		this.element.appendChild(this.fishEyeContainer);
		//
		this.detailChartContainer = document.createElement('div');
		// this.detailChartContainer.style.width = "100%";
		// this.detailChartContainer.style.height = "100%";
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
				var dt = new Date(this._date);
				rap.off("render", this.onRender);
				// Creates the graph inside the given container
				this.fishEyeCalendar = new FishEyeCalendar({
					year:dt.getFullYear(),
					month:dt.getMonth()+1,
					// todayIndex:this._currentDay,
					dataList:this.dataList,
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
			// if( this.editor.checkDirty() ) {
			// rap.getRemoteObject( this ).set( "text", this.editor.getData() );
			// this.editor.resetDirty();
			// }
			rap.getRemoteObject( this ).set( "model", "123456789"); //设置后端的值，还有其他两个方法:call(method,properties):调用后端的方法,notify(event,properties);
			// rap.getRemoteObject( this ).call( "handleCallRefreshData", "123456789"); //设置后端的值，还有其他两个方法:call(method,properties):调用后端的方法,notify(event,properties);
			console.log("mxgraph...onSend..")
		},
		// addCalendarHeader:function(parent){ //增加日历头
		// 	var that = this;
		// 	var ele = document.createElement('div');
		// 	var $ele = $(ele);
		// 	$ele.append("<span>年：</span><select class='calendarYear'>\
		// 		<option value='2013'>2013</option>\
		// 		<option value='2014'>2014</option>\
		// 		<option value='2015'>2015</option>\
		// 		<option value='2016'>2016</option>\
		// 		<option value='2017'>2017</option>\
    //     <option value='2018'>2018</option>\
    //   </select><span>  月：</span><select class='calendarMonth'>\
    //     <option value='1'>1</option>\
		// 		<option value='2'>2</option>\
		// 		<option value='3'>3</option>\
		// 		<option value='4'>4</option>\
		// 		<option value='5'>5</option>\
		// 		<option value='6'>6</option>\
		// 		<option value='7'>7</option>\
		// 		<option value='8'>8</option>\
		// 		<option value='9'>9</option>\
		// 		<option value='10'>10</option>\
		// 		<option value='11'>11</option>\
    //     <option value='12'>12</option>\
    //   </select>");
		// 	$ele.find('.calendarYear').val(2016);
		// 	$ele.find('.calendarMonth').val(10);
		// 	$ele.on('change','.calendarYear',function(){
		// 		var $this = $(this);
		// 		console.log("selected calendar year:",$this.val());
		// 		that.fishEyeCalendar.refreshShapeByYearMonth($this.val(),$this.closest('div').find('.calendarMonth').val());
		// 	});
		// 	$ele.on('change','.calendarMonth',function(){
		// 		var $this = $(this);
		// 		that.fishEyeCalendar.refreshShapeByYearMonth($this.closest('div').find('.calendarYear').val(),$this.val());
		// 	});
		// 	parent.append($ele[0]);
		// },
		setDate:function(obj){
			this._date = obj.date;
			this._currentDay = obj.currentDay;
			console.log('date:',obj);
		},
		showList:function(obj){
			console.log('showList:',obj);
			this.dataList = obj.current;
		},
		setSize : function(size) {
			var _this = this;
			if (this.ready) {
				async(this, function() { // Needed by IE for some reason
					_this._size = size;
					_this.element.style.width = size.width+"px";
			    _this.element.style.height = (size.height-20)+"px";
					_this.fishEyeCalendar.refreshAll();
				});
			} else {
				this._size = size;
			}
		},

		destroy : function() {
			rap.off("send", this.onSend);
			this.element.parentNode.removeChild(this.element);
		},

		layout : function() {
			console.log("piccolo2djs...layout..")
			if (this.ready) {
				var area = this.parent.getClientArea();
        console.log("this.parent.getClientArea():",area);
				this.element.style.left = area[0] + "px";
				this.element.style.top = area[1] + "px";
				this.element.style.width = area[2] + "px";
				this.element.style.height = area[3] + "px";
				this._size = {width:area[2],height:area[3]};
				this.fishEyeCalendar.refreshAll();
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
