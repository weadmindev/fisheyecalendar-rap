// 鱼眼日历的插件
;(function(cxt){
	var FishEyeCalendar = function(){
	    this.init.apply(this, arguments);
	};
	FishEyeCalendar.prototype = {
	    /** 可配置参数：
	     *options: {

	     	 }
	     */
	    init: function(options){
        this.zr = null; //zrender实例对象。
        this.width=0;
        this.height=0;
        this.xBoxNum = 7; //x方向被分割的小方块的个数。就是一个星期的天数。
        this.yBoxNum = 6;  //y方向被分割的小方块的个数。一个月最多可以占几行。
        this.boxWidthEnlargeRatio = 0.4;  //放大的方框的宽度所占比例。
        this.boxHeightEnlargeRatio = 0.3;  //放大的方框的高度所占比例。
        this.year = options.year || 2016;
        this.month = options.month || 11;
        this.basePath = options.basePath;
				this.container = options.container;
        this.detailContainer = options.detailContainer; //dom container of detail chart
        this.xStart = options.xStart || 10;  //整个图形的x起点。
        this.yStart = options.yStart || 50; //整个图形的y起点
        this.enlargeBox = {xIndex:-1,yIndex:-1}; //放大的小方框的坐标索引。为-1表示没有一个方框放大
				this.animationTime = 200; // millisecond.
				this.isAnimating = false;
				this.echarts = null;
				this.detailCurveCharts = null;
        this.initPathsConfig();
        this.initElement();
	    },
      initPathsConfig:function(){
        var _this = this;
        require.config({
            paths:{
							zrender:this.basePath+'zrender',
							echarts:this.basePath+'echarts.simple',
                'echarts/component/tooltip':this.basePath+'echarts.simple',
                'zrender/shape/Rectangle' : this.basePath+'zrender',
                'zrender/shape/Line' : this.basePath+'zrender',
                'zrender/shape/Text' : this.basePath+'zrender'
            }
        });
        // require([
        //     'zrender',
        //     'zrender/tool/guid',
        //     'zrender/tool/color',
        //
        //     ],function(){
        //       // _this.color = require('zrender/tool/color');
        //       // _this.guid = require('zrender/tool/guid');
        //       // _this.RectangleShape = require('zrender/shape/Rectangle');
        //       // _this.LineShape = require('zrender/shape/Line');
        //       // _this.TextShape = require('zrender/shape/Text');
        //   });
      },
      initParamsConfig:function(){
        this.width = Math.ceil(this.zr.getWidth())-10;
        this.height = Math.ceil(this.zr.getHeight())-50;
        this.enlargeBoxWidth = (this.boxWidthEnlargeRatio * this.width); //放大方框的宽度；
        this.enlargeBoxHeight = (this.boxHeightEnlargeRatio * this.height); //放大方框的高度；

        this.xDivision = ((this.width-this.xStart)/this.xBoxNum); //x轴分割成几份，每份的宽度。
        this.yDivision = ((this.height-this.yStart)/this.yBoxNum); //y轴分割成几份，每份的高度。
        //有方框被放大时，x轴剩余宽度分割成n-1份，每份的宽度。
        this.xDivisionHasEnlarge = ((this.width-this.enlargeBoxWidth-this.xStart)/this.xBoxNum);
        this.yDivisionHasEnlarge = ((this.height-this.enlargeBoxHeight-this.yStart)/this.yBoxNum); //y轴剩余高度分割成n-1份，每份的高度。
				this.headerTextList = []; //日历头的表示星期几的文本。
				this.colLineShapeList = []; //竖线条对象列表。
        this.rowLineShapeList = []; //横着的线条对象列表。
        this.boxNumTextList = []; //每个小方框左上角的数值对象。 二维数组
        this.leftTopPointArr = []; //每个小方框左上角的坐标点。 二维数组
				this.numBoxRectangleList = []; //

				this.monthDays = this.getSumDaysOfMonth(this.year,this.month); //得到某个月有多少天。
        this.firstDayWeekIndex = this.getWeekDayByDate(this.year,this.month,1); //获取某个月的第一天是星期几。

				this.detailContainer.setAttribute('id','detailChartContainers');
				this.detailContainer.style.position = 'absolute';
				this.detailContainer.style.border = 'solid 2px red';
				this.detailContainer.style.width = (this.width-10)+'px';
				this.detailContainer.style.height = (this.height-50)+'px';
				this.detailContainer.style.left = this.xStart+'px';
				this.detailContainer.style.top = this.yStart+'px';
      },
	    initElement:function(){
        var _this = this;
        require(['zrender',
            'zrender/shape/Rectangle',
            'zrender/shape/Line',
            'zrender/shape/Text',
						'echarts',
            // 'echarts/chart/line',
            // 'echarts/component/legend',
            // 'echarts/component/grid',
            'echarts/component/tooltip'
                // 'echarts/component/dataZoomInside'
          ],function(zrender,RectangleShape,LineShape,TextShape,echarts) {
								_this.echarts = echarts;
                _this.zr = zrender.init(_this.container);
                _this.color = require('zrender/tool/color');
                _this.guid = require('zrender/tool/guid');
                _this.RectangleShape = RectangleShape;//require('zrender/shape/Rectangle');
                _this.LineShape = LineShape;//require('zrender/shape/Line');
                _this.TextShape = TextShape;//require('zrender/shape/Text');
                var colorIdx = 0;
                var color=_this.color;
                // var RectangleShape=_this.RectangleShape;
                var guid=_this.guid;
                var zr=_this.zr,xBoxNum = _this.xBoxNum, yBoxNum = _this.yBoxNum;
                var xStart=_this.xStart,yStart=_this.yStart;
                _this.initParamsConfig();

                _this.initAllLineShape(); //初始化网格线条
                _this.initBoxNumShape(); // 初始化小方框里的数值
								console.log("leftTopPointArr0000:",_this.leftTopPointArr);
								_this.initCalendarHeader(); //初始化日历的头，就是星期日到星期六

								//init the box that has number text, and add a rectangle over it.
								for(var i=0;i<31;i++){ //one month has 31 days at most.
									_this.numBoxRectangleList[i] = _this.drawRectangleShape({x:-100,y:-100,width:1,height:1});
									_this.zr.addShape(_this.numBoxRectangleList[i]);
								}
								_this.refreshHasNumBoxRectangleShape(false);
								_this.detailCurveCharts = new DetailCurveCharts({
										xStart:_this.xStart,
										yStart:_this.yStart,
										width:_this.width,
										height:_this.height,
										echarts:echarts,
										container:_this.detailContainer,
										refreshAllOnClick:function(clickXIndex,clickYIndex){
											_this.refreshAllOnClick(clickXIndex,clickYIndex);
										}
									});
								_this.detailCurveCharts.setPosition(_this.leftTopPointArr);
								_this.addEvent();
								// 最后开始渲染画布。
                _this.zr.render(function(){
                  // after render callback!!
                });
            }
        )

	    },
			initCalendarHeader:function(){
				var firstRowPointArr = this.leftTopPointArr[0];
				var calendarHeaderDescArr = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
				for(var i = 0; i < firstRowPointArr.length; i++){
					var endPoint = (i==firstRowPointArr.length-1) ? this.width : firstRowPointArr[i+1]['x'];
					var offsetX = (endPoint-firstRowPointArr[i]['x'])/2;
					this.headerTextList[i] = this.drawTextShape({
						x:firstRowPointArr[i]['x'] + offsetX,
						y:firstRowPointArr[i]['y']-15,
						text: calendarHeaderDescArr[i],
						textAlign:'center',
						textFont:'bold 16px verdana'
					});
					this.zr.addShape(this.headerTextList[i]);
				}
			},
      initAllLineShape:function(){
        for(var i = 0; i <= this.xBoxNum; i++) { //画竖线。变的是x轴方向的坐标
            var boxXStart = (this.getBoxXStart(i));
            this.colLineShapeList[i] = this.drawLineShape({
							xStart:boxXStart,
							yStart:this.yStart,
							xEnd:boxXStart,
							yEnd:this.height
						});
            this.zr.addShape(this.colLineShapeList[i]);
        }
        for(var i = 0; i <= this.yBoxNum; i++) { //画横线。变的是y轴方向的坐标
          var boxYStart = (this.getBoxYStart(i));
					this.rowLineShapeList[i] = this.drawLineShape({
						xStart:this.xStart,
						yStart:boxYStart,
						xEnd:this.width,
						yEnd:boxYStart
					});
          this.zr.addShape(this.rowLineShapeList[i]);
        }
      },
      initBoxNumShape:function(){ //画小方框左上角的数值
        var i=0,j=0,days=0,textNum='';
        for(i = 0; i < this.yBoxNum; i++) { //这表示行坐标
          this.leftTopPointArr.push([]);
          this.boxNumTextList.push([]);
          for(j=0;j< this.xBoxNum;j++){ //这是列坐标。
            var xPoint = (this.getBoxXStart(j));
            var yPoint = (this.getBoxYStart(i));
						var text = this.getBoxNumText(i,j,days);
						days = text ? text : days;
            this.leftTopPointArr[i][j] = {x:xPoint, y:yPoint, text:text};
            this.boxNumTextList[i][j] = this.drawTextShape({x:xPoint+10, y:yPoint+12, text:text });
            this.zr.addShape(this.boxNumTextList[i][j]);
          }
        }
        console.log("leftTopPointArr",this.leftTopPointArr);
        console.log("boxNumTextList",this.boxNumTextList);
      },
      addEvent:function(){
				var _this = this;
				// 全局事件,当点击了画布上的某个点时。把点击的坐标点所在的小方框放大或点击的是已经放大的则复原。
				this.zr.on('click', function(params) {
					console.log('Hello, zrender onClick event obj:',params);
					// _this.zr.refresh();
				});
      },
			getBoxNumText:function(i,j,days){ //得到每个小方框里的数值。会根据这个月有多少天，1号是星期几。
				var text='';
				if((i==0 && this.firstDayWeekIndex<=j) || (i!=0 && days < this.monthDays)){
					text = days+1;
				}
				return text;
			},
			setEnlargeBoxIndex:function(xIndex,yIndex){ //set the xIndex and yIndex of being enlarged box
				if(xIndex == this.enlargeBox.xIndex && yIndex == this.enlargeBox.yIndex){ //判断是否是点击的当前正在放大的那个方框
					this.enlargeBox.xIndex = -1;
					this.enlargeBox.yIndex = -1;
				}else{
					this.enlargeBox.xIndex = xIndex;
					this.enlargeBox.yIndex = yIndex;
				}
			},
      hasEnlargeBox:function(){ //当前是否有放大的方框
        return (this.enlargeBox.xIndex >= 0 && this.enlargeBox.yIndex >= 0) ? true : false;
      },
      getBoxXStart:function(index){ //得到小方框的x轴的起点。
        var boxXStart = 0;
        if(this.hasEnlargeBox()){
          if(index <= this.enlargeBox.yIndex){
            boxXStart = this.xDivisionHasEnlarge*index+this.xStart;
          }else{
            boxXStart = this.xDivisionHasEnlarge*index+this.xStart+this.enlargeBoxWidth;
          }
        }else{
          boxXStart = this.xDivision*index+this.xStart;
        }
        return boxXStart;
      },
      getBoxYStart:function(index){ //得到小方框的y轴的起点。
        var boxYStart = 0;
        if(this.hasEnlargeBox()){
          if(index <= this.enlargeBox.xIndex){
            boxYStart = this.yDivisionHasEnlarge*index+this.yStart;
          }else{
            boxYStart = this.yDivisionHasEnlarge*index+this.yStart+this.enlargeBoxHeight;
          }
        }else{
          boxYStart = this.yDivision*index+this.yStart;
        }
        return boxYStart;
      },
			refreshAllOnClick:function(clickXIndex,clickYIndex){
				var _this = this;
				// 获得点击的方框的坐标索引。
				var i=0,j=0;
				// var clickX = params.event.offsetX; //鼠标点击的x坐标。
				// var clickY = params.event.offsetY; // 鼠标点击的y坐标。
				// var clickXIndex = 0, clickYIndex = 0; //鼠标点击的坐标对应的小方框的索引。
				// for(i = 0;i < _this.yBoxNum; i++){
				// 	for(j = 0; j < _this.xBoxNum; j++){
				// 		if(clickX >= _this.leftTopPointArr[i][j]['x'] && clickY >= _this.leftTopPointArr[i][j]['y']){
				// 			clickXIndex = i; //行坐标索引；
				// 			clickYIndex = j; //列坐标索引；
				// 		}
				// 	}
				// }
				console.log("clickXIndex:",clickXIndex);
				console.log("clickYIndex:",clickYIndex);
				if(!_this.leftTopPointArr[clickXIndex][clickYIndex]['text']){
					return;
				}
				_this.isAnimating = true;
				_this.setEnlargeBoxIndex(clickXIndex,clickYIndex);
				// 跟新数值的坐标
				_this.refreshTextShape(false);
				// 更新图形参数。
				_this.refreshLineShape();
				_this.refreshHasNumBoxRectangleShape(true);
				_this.detailCurveCharts.setPosition(_this.leftTopPointArr);
			},
			refreshLineShape:function(){
				var _this = this;
				for(var i = 0; i <= this.xBoxNum; i++){ // 更新纵线的坐标；
					var boxXStart = (this.getBoxXStart(i));
					var colLine = this.colLineShapeList[i];
					(function(boxXStart,colLine){
						setTimeout(function(){
							_this.zr.animate(colLine.id,'style').when(_this.animationTime,{
								xStart:boxXStart,
								xEnd:boxXStart
							}).done(function(){
								colLine.style.xStart = boxXStart;
								colLine.style.xEnd = boxXStart;
								_this.zr.modShape(colLine.id, colLine);
								// setTimeout(function(){_this.zr.refresh()},10);
							}).start();
						},10);
					})(boxXStart,colLine);
				}
				for(var i = 0; i <= this.yBoxNum; i++){ // 更新横线的坐标：
					var boxYStart = (this.getBoxYStart(i));
					var rowLine = this.rowLineShapeList[i];
					(function(boxYStart,rowLine){
						setTimeout(function(){
							_this.zr.animate(rowLine.id,'style').when(_this.animationTime,{
								yStart:boxYStart,
								yEnd:boxYStart
							}).done(function(){
								rowLine.style.yStart = boxYStart;
								rowLine.style.yEnd = boxYStart;
								_this.zr.modShape(rowLine.id, rowLine);
								// setTimeout(function(){_this.zr.refresh()},10);
							}).start();
						},10);
					})(boxYStart,rowLine);
				}
			},
			refreshTextShape:function(isNeedChangeNumText){
				var _this = this;
				var i=0, j=0, days=0, text='';
				for(i = 0; i < this.yBoxNum; i++) {
					for(var j=0;j< this.xBoxNum;j++){ //这是列坐标。
						var xPoint = (this.getBoxXStart(j));
						var yPoint = (this.getBoxYStart(i));
						var text = this.getBoxNumText(i,j,days);
						days = text ? text : days;
						this.leftTopPointArr[i][j]['x'] = xPoint;
						this.leftTopPointArr[i][j]['y'] = yPoint;
						this.leftTopPointArr[i][j]['text'] = text;
						var boxNumText = this.boxNumTextList[i][j];
						if(isNeedChangeNumText){
							boxNumText.style.text = text;
							this.zr.modShape(boxNumText.id, boxNumText);
						}
						(function(xPoint,yPoint,boxNumText){
							setTimeout(function(){
								_this.zr.animate(boxNumText.id,'style').when(_this.animationTime,{
									x:xPoint+10,
									y:yPoint+12
								}).done(function(){
									boxNumText.style.x = xPoint+10;
									boxNumText.style.y = yPoint+12;
									_this.zr.modShape(boxNumText.id, boxNumText);
									// setTimeout(function(){_this.zr.refresh()},10);
								}).start();
							},10);
						})(xPoint,yPoint,boxNumText);
					}
				}
				//refresh calendar header's position of week text.
				var firstRowPointArr = this.leftTopPointArr[0];
				for(i = 0; i < firstRowPointArr.length; i++){
					var endPoint = (i==firstRowPointArr.length-1) ? this.width : firstRowPointArr[i+1]['x'];
					var offsetX = (endPoint-firstRowPointArr[i]['x'])/2;
					var xPoint = firstRowPointArr[i]['x'] + offsetX;
					this.zr.animate(this.headerTextList[i].id,'style').when(_this.animationTime,{
						x:xPoint
					}).start();
				}
				isNeedChangeNumText ? this.zr.refresh() : null;
			},
			refreshHasNumBoxRectangleShape:function(isNeedAnimation){
				var _this = this;
				var rowNum = this.leftTopPointArr.length;
				var colNum = this.leftTopPointArr[0].length;
				for(var i=0;i<rowNum;i++){
					var rowList = this.leftTopPointArr[i];
					var curPointY = this.leftTopPointArr[i][0]['y'];
					var nextPointY = (i==rowNum-1) ? this.height : this.leftTopPointArr[i+1][0]['y']; //next Y point coordinate
					for(var j=0;j<colNum;j++){
						var curPointX = rowList[j]['x']; //current X point coordinate.
						var nextPointX = (j==colNum-1) ? this.width : rowList[j+1]['x']; //next X point coordinate.
						if(rowList[j]['text']){
							var boxRectangleShape = this.numBoxRectangleList[rowList[j]['text']-1];
							if(isNeedAnimation){
								(function(curPointX,curPointY,nextPointX,nextPointY,boxRectangleShape){
									setTimeout(function(){
										_this.zr.animate(boxRectangleShape.id,'style').when(_this.animationTime,{
											x:curPointX,
											y:curPointY,
											width:nextPointX - curPointX,
											height:nextPointY - curPointY
										}).done(function(){
											boxRectangleShape.style.x = curPointX;
											boxRectangleShape.style.y = curPointY;
											boxRectangleShape.style.width = nextPointX - curPointX;
											boxRectangleShape.style.height = nextPointY - curPointY;
											setTimeout(function(){
												_this.zr.refresh();
												_this.isAnimating = false;
												_this.detailCurveCharts.setAnimationState(_this.isAnimating);
											},10);
										}).start();
									},10);
								})(curPointX,curPointY,nextPointX,nextPointY,boxRectangleShape);
							}else{
								boxRectangleShape.style.x = curPointX;
								boxRectangleShape.style.y = curPointY;
								boxRectangleShape.style.width = nextPointX - curPointX;
								boxRectangleShape.style.height = nextPointY - curPointY;
							}

						}
					}
				}
			},
			refreshShapeByYearMonth:function(year,month){  //change the calendar shape by change the year or month.
				var _this = this;
				this.year = +year;
				this.month = +month;
				this.enlargeBox.xIndex = -1;
				this.enlargeBox.yIndex = -1;
				this.monthDays = this.getSumDaysOfMonth(this.year,this.month);
        this.firstDayWeekIndex = this.getWeekDayByDate(this.year,this.month,1);
				this.refreshLineShape();
				this.refreshTextShape(true);
				// this.refreshHasNumBoxRectangleShape(false);

				var rowNum = this.leftTopPointArr.length;
				var colNum = this.leftTopPointArr[0].length;
				for(var i=0;i<31;i++){ //one month has 31 days at most.
					_this.zr.delShape(_this.numBoxRectangleList[i].id); //first delete old rectangle shape,then add a new.
					_this.numBoxRectangleList[i] = _this.drawRectangleShape({x:-100,y:-100,width:1,height:1});
					_this.zr.addShape(_this.numBoxRectangleList[i]);
				}
				for(var i=0;i<rowNum;i++){
					var rowList = this.leftTopPointArr[i];
					var curPointY = this.leftTopPointArr[i][0]['y'];
					var nextPointY = (i==rowNum-1) ? this.height : this.leftTopPointArr[i+1][0]['y']; //next Y point coordinate
					for(var j=0;j<colNum;j++){
						var curPointX = rowList[j]['x']; //current X point coordinate.
						var nextPointX = (j==colNum-1) ? this.width : rowList[j+1]['x']; //next X point coordinate.
						if(rowList[j]['text']){
							var boxRectangleShape = this.numBoxRectangleList[rowList[j]['text']-1];
							boxRectangleShape.style.x = curPointX;
							boxRectangleShape.style.y = curPointY;
							boxRectangleShape.style.width = nextPointX - curPointX;
							boxRectangleShape.style.height = nextPointY - curPointY;
							_this.zr.modShape(_this.numBoxRectangleList[i].id, _this.numBoxRectangleList[i]);
						}
					}
				}
				this.zr.refresh();
			},

			// draw the base line shape.
			drawLineShape:function(config){
				return new this.LineShape({
						id : this.guid(),
						style : {
							xStart:config.xStart,
							yStart:config.yStart,
							xEnd:config.xEnd,
							yEnd:config.yEnd,
							strokeColor: this.color.getColor(5),
							lineType :'solid',
							zlevel:1,
							lineWidth:1
						}
				});
			},
      drawTextShape:function(config){
        return new this.TextShape({
					hoverable : false,
          style:{
            x:config.x,
            y:config.y,
            color:'black',
            text:config.text,
            textAlign:config.textAlign || 'left',
						textFont:config.textFont||null,
            textBaseLine:'bottom'
          },
          // hoverable:true,
          zlevel:2
        });
      },
      drawRectangleShape:function(config){
				var _this=this;
				return new this.RectangleShape({
					clickable : true,
					// hoverable:false,
            style : {
                x : config.x,
                y : config.y,
                width : config.width,
                height: config.height,
								text:config.text,
                brushType : 'stroke',
                // color : 'white',
								lineWidth : 1,
                strokeColor : '#7848F1',
                // lineJoin : 'round',
                zlevel:3
            },
						highlightStyle:{
							shadowBlur:1,
							shadowColor:'#DAA520',
							lineWidth : 0.7,
	            strokeColor : '#FFD700'
	          },
						// onmouseover: function(param) {
				    //     _this.zr.addHoverShape(new _this.RectangleShape({
				    //         style: {
						// 					x:0,
						// 					y:0,
						// 					brushType : 'stroke',
						// 					lineWidth : 0.8,
						// 					strokeColor : '#FFD700',
						// 					zlevel:4
				    //         },
						// 				highlightStyle:{
						// 					shadowBlur:1,
						// 					shadowColor:'#DAA520',
						// 					lineWidth : 0.7,
					  //           strokeColor : '#FFD700'
					  //         }
				    //     }));
				    // },
            draggable : false
        });
      },
      //根据某年某月某日算出这天是星期几。每周从周日开始，索引index为0.
      getWeekDayByDate:function(year,month,day){
        var w=0,y=0,c=0,m=0,d=0;
        if(month<3){
          m = month + 12;
          year = year-1;
        }else{
          m = month;
        }
        y = (year%100);
        c = parseInt(year/100);
        d = day;
        w=y+(y/4)+(c/4)-2*c+(26*(m+1)/10)+d-1;
        return w<0 ? (7+w) : Math.floor(w%7)%7;
      },
      getSumDaysOfMonth:function(year,month){ //获取某年某月的当月总天数。
        var  tempDate = new Date(year,month,0);
        return tempDate.getDate();
      }


	};
	cxt.FishEyeCalendar = FishEyeCalendar;
})(window);
