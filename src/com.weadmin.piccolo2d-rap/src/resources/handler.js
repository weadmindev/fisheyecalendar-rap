var PICCOLO2D_BASEPATH = "rwt-resources/piccolo2djs/";

(function() {
	'use strict';


	rap.registerTypeHandler("eclipsesource.piccolo2djs", {

		factory : function(properties) {
			return new eclipsesource.piccolo2djs(properties);
		},

		destructor : "destroy",
		methods : ['showText'],
		properties : [ "size"],
		events:[]

	});

	if (!window.eclipsesource) {
		window.eclipsesource = {};
	}

	eclipsesource.piccolo2djs = function(properties) {
		console.log("piccolo2djs....." + properties)
		bindAll(this, [ "layout", "onReady", "onSend", "onRender"]);
		this.parent = rap.getObject(properties.parent);
    console.log("this.parent:",this.parent);
		this.addCalendarHeader(this.parent);
		this.element = document.createElement("div");
		this.canvasElement = document.createElement("canvas");
		this.parent.append(this.element);
		this.parent.append(this.canvasElement);
		this.parent.addListener("Resize", this.layout);

		this._size = properties.size ? properties.size : {
			width : 300,
			height : 300
		};
		this.element.style.width = this._size.width+"px";
    this.element.style.height = (this._size.height-20)+"px";

		this._canvas = new PCanvas(this.canvasElement);
		this._layer = this._canvas.camera.layers[0];

		rap.on("render", this.onRender);
	};

	eclipsesource.piccolo2djs.prototype = {

		ready : false,

		onReady : function() {
			// TODO [tb] : on IE 7/8 the iframe and body has to be made
			// transparent explicitly
			this.ready = true;
			this.layout();
			console.log("piccolo2djs...onReady..")

		},

		onRender : function() {
      var _this = this;
			if (this.element.parentNode) {
				rap.off("render", this.onRender);
				// Creates the graph inside the given container
				this.fishEyeCalendar = new FishEyeCalendar({
					basePath:PICCOLO2D_BASEPATH,
					container:_this.element
				});
        /////////////////////
				rap.on("send", this.onSend);

				this.ready = true;
				this.layout();
			}
		},
		onSend : function() {
			// if( this.editor.checkDirty() ) {
			// rap.getRemoteObject( this ).set( "text", this.editor.getData() );
			// this.editor.resetDirty();
			// }

			//rap.getRemoteObject( this ).set( "model", xml);
			//console.log("mxgraph...onSend..")
		},
		addCalendarHeader:function(parent){ //增加日历头
			var ele = document.createElement('div');
			var $ele = $(ele);
			$ele.append("<span>年：</span><select class='calendarYear'>\
				<option value='2013'>2013</option>\
				<option value='2014'>2014</option>\
				<option value='2015'>2015</option>\
				<option value='2016'>2016</option>\
				<option value='2017'>2017</option>\
        <option value='2018'>2018</option>\
      </select><span>月：</span><select class='calendarMonth'>\
        <option value='1'>1</option>\
				<option value='2'>2</option>\
				<option value='3'>3</option>\
				<option value='4'>4</option>\
				<option value='5'>5</option>\
				<option value='6'>6</option>\
				<option value='7'>7</option>\
				<option value='8'>8</option>\
				<option value='9'>9</option>\
				<option value='10'>10</option>\
				<option value='11'>11</option>\
        <option value='12'>12</option>\
      </select>");
			$ele.on('change','.calendarYear',function(){
				var $this = $(this);
				console.log("selected calendar year:",$this.val());

			});
			$ele.on('change','.calendarMonth',function(){

			});
			parent.append($ele[0]);
		},

		showText:function(obj){
			var ptxt = new PText(obj.text);
			this._layer.addChild(ptxt);
		},
		setSize : function(size) {
			if (this.ready) {
				async(this, function() { // Needed by IE for some reason
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
