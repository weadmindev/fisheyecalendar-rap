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
		this.element = document.createElement("canvas");
		this.parent.append(this.element);
		this.parent.addListener("Resize", this.layout);

		this._size = properties.size ? properties.size : {
			width : 300,
			height : 300
		};
		
		this._canvas = new PCanvas(this.element);
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
			if (this.element.parentNode) {
				rap.off("render", this.onRender);
				 
				 
				 
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