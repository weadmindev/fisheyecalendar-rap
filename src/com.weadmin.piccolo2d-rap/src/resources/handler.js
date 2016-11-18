var PICCOLO2D_BASEPATH = "rwt-resources/piccolo2djs/";

(function() {
	'use strict';


	rap.registerTypeHandler("eclipsesource.piccolo2djs", {

		factory : function(properties) {
			return new eclipsesource.piccolo2djs(properties);
		},

		destructor : "destroy",
		methods : [],
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
		this.element = document.createElement("div");
    this.element.style.width="100%";
    this.element.style.height="100%";
		this.parent.append(this.element);
		this.parent.addListener("Resize", this.layout);

		this._size = properties.size ? properties.size : {
			width : 300,
			height : 300
		};



		rap.on("render", this.onRender);
	};

	eclipsesource.piccolo2djs.prototype = {

		ready : false,

		onReady : function() {
			// TODO [tb] : on IE 7/8 the iframe and body has to be made
			// transparent explicitly
			this.ready = true;
			this.layout();
			if (this._text) {
				// this.setText( this._text );
				delete this._text;
			}
			if (this._font) {
				// this.setFont( this._font );
				delete this._font;
			}
			console.log("piccolo2djs...onReady..")

		},

		onRender : function() {
      var _this = this;
			if (this.element.parentNode) {
				rap.off("render", this.onRender);
				// Creates the graph inside the given container
        require.config({
            paths:{
                zrender:PICCOLO2D_BASEPATH+'/js/zrender',
                'zrender/shape/Rectangle' : PICCOLO2D_BASEPATH+'/js/zrender',
                'zrender/shape/Line' : PICCOLO2D_BASEPATH+'/js/zrender',
                'zrender/shape/Text' : PICCOLO2D_BASEPATH+'/js/zrender'
            }
        });
        // Step:4 require zrender and use it in the callback.
        require(
            ['zrender','zrender/shape/Rectangle','zrender/shape/Line','zrender/shape/Text'],
            function(zrender) {
                var zr = zrender.init(_this.element);
                var color = require('zrender/tool/color');
                var RectangleShape = require('zrender/shape/Rectangle');
                var LineShape = require('zrender/shape/Line');
                var TextShape = require('zrender/shape/Text');
                var guid = require('zrender/tool/guid');
                var colorIdx = 0;
                var xStart = 10;  //整个图形的x起点。
                var yStart = 10; //整个图形的y起点
                var enlargeBox = {xIndex:-1,yIndex:-1}; //放大的小方框的坐标索引。为-1表示没有一个方框放大
                var xBoxNum = 7; //x方向被分割的小方块的个数。
                var yBoxNum = 6;  //y方向被分割的小方块的个数。
                var width = Math.ceil(zr.getWidth());
                var height = Math.ceil(zr.getHeight());
                var enlargeBoxWidth = 350; //放大方框的宽度；
                var enlargeBoxHeight = 250; //放大方框的高度；

                var xDivision = (width-20)/xBoxNum; //x轴分割成几份，每份的宽度。
                var yDivision = (height-20)/yBoxNum; //y轴分割成几份，每份的高度。
                var xDivisionHasEnlarge = (width-enlargeBoxWidth-20)/(xBoxNum); //有一个放大的方框时，x轴剩余宽度分割成n-1份，每份的宽度。
                var yDivisionHasEnlarge = (height-enlargeBoxHeight-20)/(yBoxNum); //有一个放大的方框时，y轴剩余高度分割成n-1份，每份的高度。
                // _this.drawRectangleContainer(zr,RectangleShape,{x:xStart,y:yStart,width:(width-20),height:(height-20)});
                var i=0,colLineShapeList = [],rowLineShapeList = [], boxNumTextList = [];
                var leftTopPointArr = []; //每个小方框左上角的坐标点。
                for(i = 0; i <= xBoxNum; i++) { //画竖线。
                    var boxXStart = _this.getBoxXStart(xStart,enlargeBox,i,xDivision,xDivisionHasEnlarge,enlargeBoxWidth);
                    colLineShapeList[i] = new LineShape({
                        id : guid(),
                        style : {
                          xStart:boxXStart,
                          yStart:yStart,
                          xEnd:boxXStart,
                          yEnd:height-10,
                          strokeColor: color.getColor(8),
                          lineType :'solid',
                          zlevel:1,
                          lineWidth:1
                        }
                    });
                    zr.addShape(colLineShapeList[i]);
                }
                for(i = 0; i <= yBoxNum; i++) { //画横线。
                  var boxYStart = _this.getBoxYStart(yStart,enlargeBox,i,yDivision,yDivisionHasEnlarge,enlargeBoxHeight);
                    rowLineShapeList[i] = new LineShape({
                        id : guid(),
                        style : {
                          xStart:xStart,
                          yStart:boxYStart,
                          xEnd:width-10,
                          yEnd:boxYStart,
                          strokeColor: color.getColor(8),
                          lineType :'solid',
                          zlevel:1,
                          lineWidth:1
                        }
                    });
                    zr.addShape(rowLineShapeList[i]);
                }
                for(i = 0; i < yBoxNum; i++) { //画数值
                  leftTopPointArr.push([]); //这表示行坐标
                  boxNumTextList.push([]);
                  for(var j=0;j< xBoxNum;j++){ //这是列坐标。
                    var xPoint = _this.getBoxXStart(xStart,enlargeBox,j,xDivision,xDivisionHasEnlarge,enlargeBoxWidth);
                    var yPoint = _this.getBoxYStart(yStart,enlargeBox,i,yDivision,yDivisionHasEnlarge,enlargeBoxHeight);
                    var text = i*(xBoxNum) + j+1;
                    leftTopPointArr[i][j] = {x:xPoint, y:yPoint, text:text};
                    boxNumTextList[i][j] = _this.drawNumberText(zr, TextShape,{x:xPoint+5, y:yPoint+10, text:text });
                    zr.addShape(boxNumTextList[i][j]);
                  }
                }

                console.log("leftTopPointArr:",leftTopPointArr);
                // 全局事件,当点击了画布上的某个点时。把点击的坐标点所在的小方框放大或点击的是已经放大的则复原。
                zr.on('click', function(params) {
                  console.log('Hello, zrender:',params);
                  // 获得点击的方框的坐标索引。
                  var clickX = params.event.offsetX; //鼠标点击的x坐标。
                  var clickY = params.event.offsetY; // 鼠标点击的y坐标。
                  var clickXIndex = 0, clickYIndex = 0; //鼠标点击的坐标对应的小方框的索引。
                  for(i = 0;i < yBoxNum; i++){
                    for(var j = 0; j < xBoxNum; j++){
                      if(clickX >= leftTopPointArr[i][j]['x'] && clickY >= leftTopPointArr[i][j]['y']){
                        clickXIndex = i; //行坐标索引；
                        clickYIndex = j; //列坐标索引；
                      }
                    }
                  }
                  console.log("clickXIndex:",clickXIndex);
                  console.log("clickYIndex:",clickYIndex);
                  if(clickXIndex == enlargeBox.xIndex && clickYIndex == enlargeBox.yIndex){ //判断是否是点击的当前正在放大的那个方框
                    enlargeBox.xIndex = -1;
                    enlargeBox.yIndex = -1;
                  }else{
                    enlargeBox.xIndex = clickXIndex;
                    enlargeBox.yIndex = clickYIndex;
                  }
                  // 更新图形参数。
                  for(i = 0; i <= xBoxNum; i++){ // 更新纵线的坐标；
                    var boxXStart = _this.getBoxXStart(xStart,enlargeBox,i,xDivision,xDivisionHasEnlarge,enlargeBoxWidth);
                    var colLine = colLineShapeList[i];
                    colLine.style.xStart = boxXStart;
                    colLine.style.xEnd = boxXStart;
                    zr.modShape(colLine.id,colLine);
                  }
                  for(i = 0; i <= yBoxNum; i++){
                    // 更新横线的坐标：
                    var boxYStart = _this.getBoxYStart(yStart,enlargeBox,i,yDivision,yDivisionHasEnlarge,enlargeBoxHeight);
                    var rowLine = rowLineShapeList[i];
                    rowLine.style.yStart = boxYStart;
                    rowLine.style.yEnd = boxYStart;
                    zr.modShape(rowLine.id,rowLine);
                  }
                  // 跟新数值的坐标
                  for(i = 0; i < yBoxNum; i++) {
                    for(var j=0;j< xBoxNum;j++){ //这是列坐标。
                      var xPoint = _this.getBoxXStart(xStart,enlargeBox,j,xDivision,xDivisionHasEnlarge,enlargeBoxWidth);
                      var yPoint = _this.getBoxYStart(yStart,enlargeBox,i,yDivision,yDivisionHasEnlarge,enlargeBoxHeight);
                      var text = i*(xBoxNum) + j+1;
                      leftTopPointArr[i][j]['x'] = xPoint;
                      leftTopPointArr[i][j]['y'] = yPoint;
                      // boxNumTextList[i][j] = _this.drawNumberText(zr, TextShape,{x:xPoint+5, y:yPoint+10, text:text });
                      var boxNumText = boxNumTextList[i][j];
                      boxNumText.style.x = xPoint+5;
                      boxNumText.style.y = yPoint+10;
                      zr.modShape(boxNumText.id,boxNumText);
                    }
                  }
                  zr.refresh();
                });
                // 最后开始渲染画布。
                zr.render(function(){
                  // after render callback!!
                });

            }
        )

        /////////////////////
				rap.on("send", this.onSend);

				this.ready = true;
				this.layout();
			}
		},
    hasEnlargeBox:function(enlargeBox){ //当前是否有放大的方框
      return (enlargeBox.xIndex >= 0 && enlargeBox.yIndex >= 0) ? true : false;
    },
    getBoxXStart:function(xStart,enlargeBox,index,xDivision,xDivisionHasEnlarge,enlargeBoxWidth){ //得到小方框的x轴的起点。
      var boxXStart = 0;
      if(this.hasEnlargeBox(enlargeBox)){
        if(index <= enlargeBox.yIndex){
          boxXStart = xDivisionHasEnlarge*index+xStart;
        }else{
          boxXStart = xDivisionHasEnlarge*index+xStart+enlargeBoxWidth;
        }
      }else{
        boxXStart = xDivision*index+xStart;
      }
      return boxXStart;
    },
    getBoxYStart:function(yStart,enlargeBox,index,yDivision,yDivisionHasEnlarge,enlargeBoxHeight){ //得到小方框的y轴的起点。
      var boxYStart = 0;
      if(this.hasEnlargeBox(enlargeBox)){
        if(index <= enlargeBox.xIndex){
          boxYStart = yDivisionHasEnlarge*index+yStart;
        }else{
          boxYStart = yDivisionHasEnlarge*index+yStart+enlargeBoxHeight;
        }
      }else{
        boxYStart = yDivision*index+yStart;
      }
      return boxYStart;
    },
    drawNumberText:function(zr,TextShape,config){
      return new TextShape({
        style:{
          x:config.x,
          y:config.y,
          color:'black',
          text:config.text,
          textAlign:'left',
          textBaseLine:'bottom'
        },
        highlightStyle:{
          opacity:0
        },
        hoverable:true,
        zlevel:2
      });
    },
    drawRectangleContainer:function(zr,RectangleShape,config){
      // 矩形
      zr.addShape(new RectangleShape({
          style : {
              x : config.x,
              y : config.y,
              width : config.width,
              height: config.height,
              // brushType : 'both',
              color : 'white',
              // strokeColor : color.getColor(colorIdx++),
              // lineWidth : 1,
              // lineJoin : 'round',
              zlevel:0
          },
          draggable : false
      }));
    },
		onSend : function() {
			// if( this.editor.checkDirty() ) {
			// rap.getRemoteObject( this ).set( "text", this.editor.getData() );
			// this.editor.resetDirty();
			// }

			//rap.getRemoteObject( this ).set( "model", xml);
			//console.log("mxgraph...onSend..")
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
