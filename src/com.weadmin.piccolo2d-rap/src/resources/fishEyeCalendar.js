// fish eye calendar component
;(function(cxt){
	var FishEyeCalendar = function(){
	    this.init.apply(this, arguments);
	};
	FishEyeCalendar.prototype = {
	    /**
	     *options: {

	     	 }
	     */
	    init: function(options){
        this.zr = null;
        this.width=0;
        this.height=0;
        this.xBoxNum = 7; //the number of days of one week.
        this.yBoxNum = 6;  //the number of row of one month.
        this.boxWidthEnlargeRatio = 0.5;
        this.boxHeightEnlargeRatio = 0.5;
        this.year = options.year || 2016;
        this.month = options.month || 11;
        this.basePath = options.basePath;
				this.container = options.container;
        this.detailContainer = options.detailContainer; //dom container of detail chart
        this.xStart = options.xStart || 10;  //鏁翠釜鍥惧舰鐨剎璧风偣銆�
        this.yStart = options.yStart || 50; //鏁翠釜鍥惧舰鐨剏璧风偣
        this.enlargeBox = {xIndex:-1,yIndex:-1}; //鏀惧ぇ鐨勫皬鏂规鐨勫潗鏍囩储寮曘�備负-1琛ㄧず娌℃湁涓�涓柟妗嗘斁澶�
				this.animationTime = 500; // millisecond.
				this.isAnimating = false;
				this.echarts = null;  //
				this.detailCurveCharts = null;
				this.todayDate = new Date();
        this.initPathsConfig();
        this.initElement();
	    },
      initPathsConfig:function(){
        var _this = this;
        require.config({
            paths:{
							zrender:this.basePath+'zrender',
							echarts:this.basePath+'echarts.min',
                'echarts/component/tooltip':this.basePath+'echarts.min',
								'echarts/chart/line':this.basePath+'echarts.min',
								'echarts/component/legend':this.basePath+'echarts.min',
								'echarts/component/grid':this.basePath+'echarts.min',
								'echarts/component/dataZoomInside':this.basePath+'echarts.min',
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
        this.enlargeBoxWidth = (this.boxWidthEnlargeRatio * this.width); //鏀惧ぇ鏂规鐨勫搴︼紱
        this.enlargeBoxHeight = (this.boxHeightEnlargeRatio * this.height); //鏀惧ぇ鏂规鐨勯珮搴︼紱

        this.xDivision = ((this.width-this.xStart)/this.xBoxNum); //x杞村垎鍓叉垚鍑犱唤锛屾瘡浠界殑瀹藉害銆�
        this.yDivision = ((this.height-this.yStart)/this.yBoxNum); //y杞村垎鍓叉垚鍑犱唤锛屾瘡浠界殑楂樺害銆�
        //鏈夋柟妗嗚鏀惧ぇ鏃讹紝x杞村墿浣欏搴﹀垎鍓叉垚n-1浠斤紝姣忎唤鐨勫搴︺��
        this.xDivisionHasEnlarge = ((this.width-this.enlargeBoxWidth-this.xStart)/this.xBoxNum);
        this.yDivisionHasEnlarge = ((this.height-this.enlargeBoxHeight-this.yStart)/this.yBoxNum); //y杞村墿浣欓珮搴﹀垎鍓叉垚n-1浠斤紝姣忎唤鐨勯珮搴︺��
				this.headerTextList = []; //鏃ュ巻澶寸殑琛ㄧず鏄熸湡鍑犵殑鏂囨湰銆�
				this.colLineShapeList = []; //绔栫嚎鏉″璞″垪琛ㄣ��
        this.rowLineShapeList = []; //妯潃鐨勭嚎鏉″璞″垪琛ㄣ��
        this.boxNumTextList = []; //姣忎釜灏忔柟妗嗗乏涓婅鐨勬暟鍊煎璞°�� 浜岀淮鏁扮粍
        this.leftTopPointArr = []; //姣忎釜灏忔柟妗嗗乏涓婅鐨勫潗鏍囩偣銆� 浜岀淮鏁扮粍
				this.numBoxRectangleList = []; //

				this.monthDays = this.getSumDaysOfMonth(this.year,this.month); //the total number of days of one month.
        this.firstDayWeekIndex = this.getWeekDayByDate(this.year,this.month,1); //the first day of one month is day of the week.
				this.todayIndex = (this.todayDate.getFullYear() == this.year && this.todayDate.getMonth()==this.month-1) ? this.todayDate.getDate()-1 : -1;

				this.detailContainer.setAttribute('id','detailChartContainers');
				this.detailContainer.style.position = 'absolute';
				this.detailContainer.style.border = 'solid 1px #7848F1';
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
            'echarts/chart/line',
            'echarts/component/legend',
            'echarts/component/grid',
            'echarts/component/tooltip'
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

                // _this.initAllLineShape(); //鍒濆鍖栫綉鏍肩嚎鏉�
                _this.initBoxNumShape(); // 鍒濆鍖栧皬鏂规閲岀殑鏁板��
								console.log("leftTopPointArr0000:",_this.leftTopPointArr);
								_this.initCalendarHeader(); //鍒濆鍖栨棩鍘嗙殑澶达紝灏辨槸鏄熸湡鏃ュ埌鏄熸湡鍏�

								//init the box that has number text, and add a rectangle over it.
								// for(var i=0;i<31;i++){ //one month has 31 days at most.
								// 	_this.numBoxRectangleList[i] = _this.drawRectangleShape({x:-100,y:-100,width:1,height:1});
								// 	_this.zr.addShape(_this.numBoxRectangleList[i]);
								// }
								// _this.refreshHasNumBoxRectangleShape(false);
								_this.detailCurveCharts = new DetailCurveCharts({
										xStart:_this.xStart,
										yStart:_this.yStart,
										width:_this.width,
										height:_this.height,
										echarts:echarts,
										container:_this.detailContainer,
										enlargeBox:_this.enlargeBox,
										todayIndex:_this.todayIndex,
										refreshAllOnClick:function(clickXIndex,clickYIndex){
											_this.refreshAllOnClick(clickXIndex,clickYIndex);
										}
									});
								_this.detailCurveCharts.setPosition(_this.leftTopPointArr,true);
								_this.addEvent();
								// 鏈�鍚庡紑濮嬫覆鏌撶敾甯冦��
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
        for(var i = 0; i <= this.xBoxNum; i++) { //鐢荤珫绾裤�傚彉鐨勬槸x杞存柟鍚戠殑鍧愭爣
            var boxXStart = (this.getBoxXStart(i));
            this.colLineShapeList[i] = this.drawLineShape({
							xStart:boxXStart,
							yStart:this.yStart,
							xEnd:boxXStart,
							yEnd:this.height
						});
            this.zr.addShape(this.colLineShapeList[i]);
        }
        for(var i = 0; i <= this.yBoxNum; i++) { //鐢绘í绾裤�傚彉鐨勬槸y杞存柟鍚戠殑鍧愭爣
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
      initBoxNumShape:function(){ //鐢诲皬鏂规宸︿笂瑙掔殑鏁板��
        var i=0,j=0,days=0,textNum='';
        for(i = 0; i < this.yBoxNum; i++) { //杩欒〃绀鸿鍧愭爣
          this.leftTopPointArr.push([]);
          this.boxNumTextList.push([]);
          for(j=0;j< this.xBoxNum;j++){ //杩欐槸鍒楀潗鏍囥��
            var xPoint = (this.getBoxXStart(j));
            var yPoint = (this.getBoxYStart(i));
						var text = this.getBoxNumText(i,j,days);
						days = text ? text : days;
            this.leftTopPointArr[i][j] = {x:xPoint, y:yPoint, text:text};
            // this.boxNumTextList[i][j] = this.drawTextShape({x:xPoint+10, y:yPoint+12, text:text });
            // this.zr.addShape(this.boxNumTextList[i][j]);
          }
        }
        console.log("leftTopPointArr",this.leftTopPointArr);
        console.log("boxNumTextList",this.boxNumTextList);
      },
      addEvent:function(){
				var _this = this;
				// 鍏ㄥ眬浜嬩欢,褰撶偣鍑讳簡鐢诲竷涓婄殑鏌愪釜鐐规椂銆傛妸鐐瑰嚮鐨勫潗鏍囩偣鎵�鍦ㄧ殑灏忔柟妗嗘斁澶ф垨鐐瑰嚮鐨勬槸宸茬粡鏀惧ぇ鐨勫垯澶嶅師銆�
				this.zr.on('click', function(params) {
					console.log('Hello, zrender onClick event obj:',params);
					// _this.zr.refresh();
				});
      },
			getBoxNumText:function(i,j,days){ //寰楀埌姣忎釜灏忔柟妗嗛噷鐨勬暟鍊笺�備細鏍规嵁杩欎釜鏈堟湁澶氬皯澶╋紝1鍙锋槸鏄熸湡鍑犮��
				var text='';
				if((i==0 && this.firstDayWeekIndex<=j) || (i!=0 && days < this.monthDays)){
					text = days+1;
				}
				return text;
			},
			setEnlargeBoxIndex:function(xIndex,yIndex){ //set the xIndex and yIndex of being enlarged box
				if(xIndex == this.enlargeBox.xIndex && yIndex == this.enlargeBox.yIndex){ //鍒ゆ柇鏄惁鏄偣鍑荤殑褰撳墠姝ｅ湪鏀惧ぇ鐨勯偅涓柟妗�
					this.enlargeBox.xIndex = -1;
					this.enlargeBox.yIndex = -1;
				}else{
					this.enlargeBox.xIndex = xIndex;
					this.enlargeBox.yIndex = yIndex;
				}
			},
      hasEnlargeBox:function(){ //褰撳墠鏄惁鏈夋斁澶х殑鏂规
        return (this.enlargeBox.xIndex >= 0 && this.enlargeBox.yIndex >= 0) ? true : false;
      },
      getBoxXStart:function(index){ //寰楀埌灏忔柟妗嗙殑x杞寸殑璧风偣銆�
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
      getBoxYStart:function(index){ //寰楀埌灏忔柟妗嗙殑y杞寸殑璧风偣銆�
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
				_this.isAnimating = true;
				_this.setEnlargeBoxIndex(clickXIndex,clickYIndex);
				_this.refreshTextShape(false);
				// _this.refreshLineShape();
				// _this.refreshHasNumBoxRectangleShape(true);
				_this.detailCurveCharts.setPosition(_this.leftTopPointArr);
			},
			refreshLineShape:function(){
				var _this = this;
				for(var i = 0; i <= this.xBoxNum; i++){ // 鏇存柊绾电嚎鐨勫潗鏍囷紱
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
				for(var i = 0; i <= this.yBoxNum; i++){ // 鏇存柊妯嚎鐨勫潗鏍囷細
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
					for(var j=0;j< this.xBoxNum;j++){ //杩欐槸鍒楀潗鏍囥��
						var xPoint = (this.getBoxXStart(j));
						var yPoint = (this.getBoxYStart(i));
						var text = this.getBoxNumText(i,j,days);
						days = text ? text : days;
						this.leftTopPointArr[i][j]['x'] = xPoint;
						this.leftTopPointArr[i][j]['y'] = yPoint;
						this.leftTopPointArr[i][j]['text'] = text;
						// var boxNumText = this.boxNumTextList[i][j];
						// if(isNeedChangeNumText){
						// 	boxNumText.style.text = text;
						// 	this.zr.modShape(boxNumText.id, boxNumText);
						// }
						// (function(xPoint,yPoint,boxNumText){
						// 	setTimeout(function(){
						// 		_this.zr.animate(boxNumText.id,'style').when(_this.animationTime,{
						// 			x:xPoint+10,
						// 			y:yPoint+12
						// 		}).done(function(){
						// 			boxNumText.style.x = xPoint+10;
						// 			boxNumText.style.y = yPoint+12;
						// 			_this.zr.modShape(boxNumText.id, boxNumText);
						// 		}).start();
						// 	},10);
						// })(xPoint,yPoint,boxNumText);
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
      //鏍规嵁鏌愬勾鏌愭湀鏌愭棩绠楀嚭杩欏ぉ鏄槦鏈熷嚑銆傛瘡鍛ㄤ粠鍛ㄦ棩寮�濮嬶紝绱㈠紩index涓�0.
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
      getSumDaysOfMonth:function(year,month){ //鑾峰彇鏌愬勾鏌愭湀鐨勫綋鏈堟�诲ぉ鏁般��
        var  tempDate = new Date(year,month,0);
        return tempDate.getDate();
      }


	};
	cxt.FishEyeCalendar = FishEyeCalendar;
})(window);
