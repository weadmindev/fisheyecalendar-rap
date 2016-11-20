// 鱼眼日历的插件
;(function($, cxt){
	var FishEyeCalendar = function(){
	    this.init.apply(this, arguments);
	};
	FishEyeCalendar.prototype = {
	    /** 可配置参数：
	     *options: {
	     		callback:function, // 删除成功后的回调函数。
	     		dataTable:dataTable, //数据表格组件对象。
	     		dataTablePagination:dataTablePagination, //分页组件对象。
	     		deleteItemCls:deleteItemCls,  //单个形式删除的按钮的类名。
	     		deleteAllCls:deleteAllCls, //批量形式删除的按钮的类名。
	     		statusKey :"status", // 表示激活状态的字段，大多数情况下是status字段，如有特殊就传入。
	     		parentKey :"xxx"    //status字段的父级字段。大多数情况是直接在第一级下的，如果又封装了一级，则要传入这个父级字段。
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
        this.month = options.month || 1;
        this.basePath = options.basePath;
        this.container = options.container;
        this.xStart = options.xStart || 10;  //整个图形的x起点。
        this.yStart = options.yStart || 50; //整个图形的y起点
        this.enlargeBox = {xIndex:-1,yIndex:-1}; //放大的小方框的坐标索引。为-1表示没有一个方框放大
        this.initPathsConfig();
        this.initElement();
	    },
      initPathsConfig:function(){
        var _this = this;
        require.config({
            paths:{
                zrender:this.basePath+'/zrender',
                'zrender/shape/Rectangle' : this.basePath+'/zrender',
                'zrender/shape/Line' : this.basePath+'/zrender',
                'zrender/shape/Text' : this.basePath+'/zrender'
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
        this.height = Math.ceil(this.zr.getHeight())-10;
        this.enlargeBoxWidth = this.boxWidthEnlargeRatio * this.width; //放大方框的宽度；
        this.enlargeBoxHeight = this.boxHeightEnlargeRatio * this.height; //放大方框的高度；

        this.xDivision = (this.width-this.xStart)/this.xBoxNum; //x轴分割成几份，每份的宽度。
        this.yDivision = (this.height-this.yStart)/this.yBoxNum; //y轴分割成几份，每份的高度。
        //有方框被放大时，x轴剩余宽度分割成n-1份，每份的宽度。
        this.xDivisionHasEnlarge = (this.width-this.enlargeBoxWidth-this.xStart)/this.xBoxNum;
        this.yDivisionHasEnlarge = (this.height-this.enlargeBoxHeight-this.xStart)/this.yBoxNum; //y轴剩余高度分割成n-1份，每份的高度。
				this.headerTextList = []; //日历头的表示星期几的文本。
				this.colLineShapeList = []; //竖线条对象列表。
        this.rowLineShapeList = []; //横着的线条对象列表。
        this.boxNumTextList = []; //每个小方框左上角的数值对象。 二维数组
        this.leftTopPointArr = []; //每个小方框左上角的坐标点。 二维数组

				this.monthDays = this.getSumDaysOfMonth(this.year,this.month); //得到某个月有多少天。
        this.firstDayWeekIndex = this.getWeekDayByDate(this.year,this.month,1); //获取某个月的第一天是星期几。
      },
	    initElement:function(){
        var _this = this;
        require(['zrender',
            'zrender/shape/Rectangle',
            'zrender/shape/Line',
            'zrender/shape/Text'
          ],function(zrender,RectangleShape,LineShape,TextShape) {
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
                // _this.drawRectangleContainer(zr,RectangleShape,{x:xStart,y:yStart,width:(width-20),height:(height-20)});
                _this.initAllLineShape(); //初始化网格线条
                _this.initBoxNumShape(); // 初始化小方框里的数值。
								_this.initCalendarHeader(); //初始化日历的头，就是星期日到星期六

                console.log("leftTopPointArr:",_this.leftTopPointArr);
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
            var boxXStart = this.getBoxXStart(i);
            this.colLineShapeList[i] = new this.LineShape({
                id : this.guid(),
                style : {
                  xStart:boxXStart,
                  yStart:this.yStart,
                  xEnd:boxXStart,
                  yEnd:this.height,
                  strokeColor: this.color.getColor(8),
                  lineType :'solid',
                  zlevel:1,
                  lineWidth:1
                }
            });
            this.zr.addShape(this.colLineShapeList[i]);
        }
        for(var i = 0; i <= this.yBoxNum; i++) { //画横线。变的是y轴方向的坐标
          var boxYStart = this.getBoxYStart(i);
            this.rowLineShapeList[i] = new this.LineShape({
                id : this.guid(),
                style : {
                  xStart:this.xStart,
                  yStart:boxYStart,
                  xEnd:this.width,
                  yEnd:boxYStart,
                  strokeColor: this.color.getColor(8),
                  lineType :'solid',
                  zlevel:1,
                  lineWidth:1
                }
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
            var xPoint = this.getBoxXStart(j);
            var yPoint = this.getBoxYStart(i);
						var text = this.getBoxNumText(i,j,days);
						days = text ? text : days;
            this.leftTopPointArr[i][j] = {x:xPoint, y:yPoint, text:text};
            this.boxNumTextList[i][j] = this.drawTextShape({x:xPoint+5, y:yPoint+10, text:text });
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
					// 获得点击的方框的坐标索引。
					var i=0,j=0;
					var clickX = params.event.offsetX; //鼠标点击的x坐标。
					var clickY = params.event.offsetY; // 鼠标点击的y坐标。
					var clickXIndex = 0, clickYIndex = 0; //鼠标点击的坐标对应的小方框的索引。
					for(i = 0;i < _this.yBoxNum; i++){
						for(j = 0; j < _this.xBoxNum; j++){
							if(clickX >= _this.leftTopPointArr[i][j]['x'] && clickY >= _this.leftTopPointArr[i][j]['y']){
								clickXIndex = i; //行坐标索引；
								clickYIndex = j; //列坐标索引；
							}
						}
					}
					console.log("clickXIndex:",clickXIndex);
					console.log("clickYIndex:",clickYIndex);
					if(clickXIndex == _this.enlargeBox.xIndex && clickYIndex == _this.enlargeBox.yIndex){ //判断是否是点击的当前正在放大的那个方框
						_this.enlargeBox.xIndex = -1;
						_this.enlargeBox.yIndex = -1;
					}else{
						_this.enlargeBox.xIndex = clickXIndex;
						_this.enlargeBox.yIndex = clickYIndex;
					}
					// 更新图形参数。
					for(i = 0; i <= _this.xBoxNum; i++){ // 更新纵线的坐标；
						var boxXStart = _this.getBoxXStart(i);
						var colLine = _this.colLineShapeList[i];
						_this.zr.animate(colLine.id,'style').when(500,{
							xStart:boxXStart,
							xEnd:boxXStart
						}).start();
					}
					for(i = 0; i <= _this.yBoxNum; i++){
						// 更新横线的坐标：
						var boxYStart = _this.getBoxYStart(i);
						var rowLine = _this.rowLineShapeList[i];
						_this.zr.animate(rowLine.id,'style').when(500,{
							yStart:boxYStart,
							yEnd:boxYStart
						}).start();
					}
					// 跟新数值的坐标
					var days = 0,text='';
					for(i = 0; i < _this.yBoxNum; i++) {
						for(var j=0;j< _this.xBoxNum;j++){ //这是列坐标。
							var xPoint = _this.getBoxXStart(j);
							var yPoint = _this.getBoxYStart(i);
							var text = _this.getBoxNumText(i,j,days);
							days = text ? text : days;
							// var text = i*(xBoxNum) + j+1;
							_this.leftTopPointArr[i][j]['x'] = xPoint;
							_this.leftTopPointArr[i][j]['y'] = yPoint;
							var boxNumText = _this.boxNumTextList[i][j];
							_this.zr.animate(boxNumText.id,'style').when(500,{
								x:xPoint+5,
								y:yPoint+10
							}).start();
						}
					}
					//
					var firstRowPointArr = _this.leftTopPointArr[0];
					for(i = 0; i < firstRowPointArr.length; i++){
						var endPoint = (i==firstRowPointArr.length-1) ? _this.width : firstRowPointArr[i+1]['x'];
						var offsetX = (endPoint-firstRowPointArr[i]['x'])/2;
						var xPoint = firstRowPointArr[i]['x'] + offsetX;
						_this.zr.animate(_this.headerTextList[i].id,'style').when(500,{
							x:xPoint
						}).start();
					}
				});
      },
			getBoxNumText:function(i,j,days){ //得到每个小方框里的数值。会根据这个月有多少天，1号是星期几。
				var text='';
				if((i==0 && this.firstDayWeekIndex<=j) || (i!=0 && days < this.monthDays)){
					text = days+1;
				}
				return text;
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
      drawTextShape:function(config){
        return new this.TextShape({
          style:{
            x:config.x,
            y:config.y,
            color:'black',
            text:config.text,
            textAlign:config.textAlign || 'left',
						textFont:config.textFont||null,
            textBaseLine:'bottom'
          },
          highlightStyle:{
            opacity:0
          },
          hoverable:true,
          zlevel:2
        });
      },
      drawRectangleContainer:function(config){
        // 矩形
        this.zr.addShape(new this.RectangleShape({
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
      //根据某年某月某日算出这天是星期几。每周从周日开始，索引index为0.
      getWeekDayByDate:function(year,month,day){
        var w=0,y=0,c=0,m=0,d=0;
        if(month<3){
          m = month + 12;
          year = year-1;
        }else{
          m = month;
        }
        y = parseInt(year%100);
        c = parseInt(year/100);
        d = day;
        w=y+parseInt(y/4)+parseInt(c/4)-2*c+parseInt(26*(m+1)/10)+d-1;
        return (w%7);
      },
      getSumDaysOfMonth:function(year,month){ //获取某年某月的当月总天数。
        var  tempDate = new Date(year,month,0);
        return tempDate.getDate();
      }

	};
	cxt.FishEyeCalendar = FishEyeCalendar;
})(jQuery, window);
