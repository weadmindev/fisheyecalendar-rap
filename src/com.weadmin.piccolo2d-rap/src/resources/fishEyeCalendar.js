// fish eye calendar component
;(function(cxt){
	var FishEyeCalendar = function(){
	    this.init.apply(this, arguments);
	};
	FishEyeCalendar.prototype = {
	    /***options: {
	     	 }
	     */
	    init: function(options){
        this.zr = null;
        this.width=0;
        this.height=0;
        this.xBoxNum = 7; //the number of days of one week.
        this.yBoxNum = 6;  //the number of row of one month.
        this.boxWidthEnlargeRatio = 0.6; //放大的小格子的宽占最外层容器宽的比例
        this.boxHeightEnlargeRatio = 0.6; //放大的小格子的高度占最外层容器高度的比例
        this.year = options.year;
        this.month = options.month;
				this.isDefaulOpenToday = options.isDefaulOpenToday;
        this.basePath = options.basePath;
				this.container = options.container;
				this.dataObj = options.dataObj;
        this.detailContainer = options.detailContainer; //dom container of detail chart
        this.xStart = options.xStart || 10;
        this.yStart = options.yStart || 50;
        this.enlargeBox = {xIndex:-1,yIndex:-1}; //
				this.headerTextList = []; //
				this.leftTopPointArr = []; //the left and top point of each box ,and the day number of the month.
				this.animationTime = 700; // millisecond.
				this.echarts = null;  //
				this.detailCurveCharts = null;
				this.todayDate = options.currentDay;
				this.todayIndex = {xIndex:-1,yIndex:-1};
				// this.calendarHeaderDescArr = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
				this.calendarHeaderDescArr = ['日','一','二','三','四','五','六'];
				this.lineColor = ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'];
				this.setLineColor(options.lineColor || {});
				this.initPathsConfig();
				this.initParamsConfig();
				this.initCalendarHeader();
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
								// 'echarts/component/series':this.basePath+'echarts.min',
								'echarts/component/dataZoomInside':this.basePath+'echarts.min'
            }
        });
      },
	    initElement:function(){
        var _this = this;
        require(['zrender',
						'echarts',
            'echarts/chart/line',
            'echarts/component/legend',
						'echarts/component/grid',
            // 'echarts/component/series',
            'echarts/component/tooltip'
          ],function(zrender,echarts) {
								_this.echarts = echarts;
								_this.detailCurveCharts = new DetailCurveCharts({
										dataObj:_this.dataObj,
										xBoxNum:_this.xBoxNum,
										yBoxNum:_this.yBoxNum,
										xStart:_this.xStart,
										yStart:_this.yStart,
										width:_this.width,
										height:_this.height,
										echarts:echarts,
										container:_this.detailContainer,
										enlargeBox:_this.enlargeBox,
										animationTime:_this.animationTime,
										firstDayWeekIndex:_this.firstDayWeekIndex,
										todayIndex:_this.todayIndex,
										leftTopPointArr:_this.leftTopPointArr,
										lineColor:_this.lineColor,
										refreshAllOnClick:function(clickXIndex,clickYIndex){
											_this.refreshAllOnClick(clickXIndex,clickYIndex);
										}
									});
            }
        )
	    },
			initParamsConfig:function(){
        this.width = Math.ceil($(this.container).width())-10;
        this.height = Math.ceil($(this.container).height())-10;
				this.updateParamsAboutSize();
        this.updateParamsAboutDate();
				this.setCoordinateAndDayNum();
				this.detailContainer.setAttribute('id','detailChartContainers');
				this.detailContainer.style.position = 'absolute';
				this.detailContainer.style.width = (this.width-this.xStart)+'px';
				this.detailContainer.style.height = (this.height-this.yStart)+'px';
				this.detailContainer.style.left = this.xStart+'px';
				this.detailContainer.style.top = this.yStart+'px';
      },
			updateParamsAboutSize:function(){
				this.enlargeBoxWidth = this.boxWidthEnlargeRatio * this.width; //the width of the enlarged box
        this.enlargeBoxHeight = this.boxHeightEnlargeRatio * this.height; //the height of the enlarged box
        this.xDivision = (this.width-this.xStart)/this.xBoxNum;
        this.yDivision = (this.height-this.yStart)/this.yBoxNum;
        this.xDivisionHasEnlarge = (this.width-this.enlargeBoxWidth-this.xStart)/this.xBoxNum;
        this.yDivisionHasEnlarge = (this.height-this.enlargeBoxHeight-this.yStart)/this.yBoxNum;
			},
			updateParamsAboutDate:function(){
				this.prevMonthDays = this.getSumDaysOfMonth(this.year,this.month-1); //the total number of days of one month.
				this.monthDays = this.getSumDaysOfMonth(this.year,this.month); //the total number of days of one month.
        this.firstDayWeekIndex = this.getWeekDayByDate(this.year,this.month,1); //the first day of one month is day of the week.
			},
			setLineColor:function(lineColorOpt){
				var i=0;
				for(var key in lineColorOpt){
					this.lineColor[i] = lineColorOpt[key];
					i++;
				}
			},
			setCoordinateAndDayNum:function(){
				this.leftTopPointArr = [];
				this.todayIndex = {xIndex:-1,yIndex:-1};
				var todayInFlag = '';
				var todayNum = this.todayDate.getDate();
				if(this.todayDate.getFullYear() == this.year){
					if(this.todayDate.getMonth() == this.month-1){
						todayInFlag = 'current';
					}else if(this.todayDate.getMonth()-(this.month-1) ==1){ //今天所在月份如果只比当前显示的月份大一个月，则表示今天就在next month.
						todayInFlag = 'next';
					}
				}
				var i=0,j=0,days=0,dayObj={};
				for(i = 0; i < this.yBoxNum; i++) {
          this.leftTopPointArr.push([]);
          for(j=0;j< this.xBoxNum;j++){
						dayObj = this.getBoxNumText(i,j,days);
						days = dayObj.flag=='current'? dayObj.text : days;
						if(todayInFlag==dayObj.flag && todayNum==dayObj.text ){ //判断今天是否在当前显示日历里。
							this.todayIndex = {xIndex:i,yIndex:j};
						}
            this.leftTopPointArr[i][j] = {
							x:this.getBoxXStart(j),
							y:this.getBoxYStart(i),
							flag:dayObj.flag,
							text:dayObj.text
						};
          }
        }
				if(this.isDefaulOpenToday && this.todayIndex.xIndex>=0){ //if enlarge today box default, and todayIndex in current show calendar, then update coordinate.
					this.enlargeBox = {xIndex:this.todayIndex.xIndex,yIndex:this.todayIndex.yIndex};
					for(i = 0; i < this.yBoxNum; i++) {
	          for(j=0;j< this.xBoxNum;j++){
							this.leftTopPointArr[i][j]['x'] = this.getBoxXStart(j);
	            this.leftTopPointArr[i][j]['y'] = this.getBoxYStart(i);
	          }
	        }
				}
				this.detailCurveCharts && this.detailCurveCharts.setEnlargeBox(this.enlargeBox);
				this.detailCurveCharts && this.detailCurveCharts.setTodayIndex(this.todayIndex);
				// console.log("leftTopPointArr0000:",this.leftTopPointArr);
			},
			initCalendarHeader:function(){
				var firstRowPointArr = this.leftTopPointArr[0];
				for(var i = 0; i < firstRowPointArr.length; i++){
					var $el = $('<div class="calendarHeader">'+this.calendarHeaderDescArr[i]+'</div>');
					var endPoint = (i==firstRowPointArr.length-1) ? this.width : firstRowPointArr[i+1]['x'];
					var offsetX = (endPoint-firstRowPointArr[i]['x'])/2;
					$el.css('left',(firstRowPointArr[i]['x'] + offsetX)+'px');
					this.container.appendChild($el[0]);
					this.headerTextList[i] = $el;
				}
			},
			getBoxNumText:function(i,j,days){ //get the day number in some box.
				if(i==0 && this.firstDayWeekIndex>j){
					return {flag:'prev',text:this.prevMonthDays-this.firstDayWeekIndex+j+1};
				}
				if((i==0 && this.firstDayWeekIndex<=j) || (i!=0 && days < this.monthDays)){
					return {flag:'current',text:i*this.xBoxNum+j-this.firstDayWeekIndex+1};
				}
				if(i!=0 && days >= this.monthDays){
					return {flag:'next',text:i*this.xBoxNum+j+1-this.firstDayWeekIndex-this.monthDays};
				}
				return {flag:'',text:''};
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
      hasEnlargeBox:function(){ //Whether has the enlarged box.
        return (this.enlargeBox.xIndex >= 0 && this.enlargeBox.yIndex >= 0) ? true : false;
      },
      getBoxXStart:function(index){ //get the x axis of box start point by box index.
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
      getBoxYStart:function(index){ //
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
				this.setEnlargeBoxIndex(clickXIndex,clickYIndex);
				this.refreshTextShape();
				this.refreshCalendarHeader();
				this.detailCurveCharts.setPosition(this.leftTopPointArr);
			},
			refreshTextShape:function(){
				var _this = this;
				var i=0, j=0, days=0, dayObj={flag:'',text:''};
				for(i = 0; i < this.yBoxNum; i++) {  //update the box x and y coordinate point.
					for(var j=0;j< this.xBoxNum;j++){
						dayObj = this.getBoxNumText(i,j,days);
						days = dayObj.flag=='current'? dayObj.text : days;
						this.leftTopPointArr[i][j]['x'] = this.getBoxXStart(j);
						this.leftTopPointArr[i][j]['y'] = this.getBoxYStart(i);
						this.leftTopPointArr[i][j]['flag'] = dayObj.flag;
						this.leftTopPointArr[i][j]['text'] = dayObj.text;
					}
				}
			},
			refreshCalendarHeader:function(animationTime){
				//refresh calendar header's position of week text.
				var firstRowPointArr = this.leftTopPointArr[0];
				for(i = 0; i < firstRowPointArr.length; i++){
					var endPoint = (i==firstRowPointArr.length-1) ? this.width : firstRowPointArr[i+1]['x'];
					var offsetX = (endPoint-firstRowPointArr[i]['x'])/2;
					var xPoint = firstRowPointArr[i]['x'] + offsetX;
					var headerText = this.headerTextList[i];
					headerText.animate({
						left:xPoint+'px'
					},animationTime || this.animationTime,'linear');
				}
			},
			updateCalendarByDateAndData:function(year,month,dataObj,isDefaulOpenToday,lineColor){  //change the calendar shape by change the year/month and data.
				var _this = this;
				this.dataObj = dataObj;
				this.isDefaulOpenToday = isDefaulOpenToday;
				if(this.year != year || this.month != month){ //if don't change year and month,then just refresh curve charts.
					this.year = +year;
					this.month = +month;
					this.enlargeBox.xIndex = -1;
					this.enlargeBox.yIndex = -1;
					this.updateParamsAboutDate();
					this.setCoordinateAndDayNum();
					this.refreshCalendarHeader();
				}
				this.setLineColor(lineColor ||{});
				var interval = setInterval(function(){
					if(_this.detailCurveCharts && !_this.detailCurveCharts.getIsAnimatingState()){ //判断对象是否已经存在。
						clearInterval(interval);
						_this.refreshCurveCharts(dataObj);
					}
				},50);
			},
			refreshCurveCharts:function(dataObj){
				var _this = this;
				this.detailCurveCharts.setFirstDayWeekIndex(this.firstDayWeekIndex);
				this.detailCurveCharts.setLineColor(this.lineColor);
				// this.refreshTextShape();
				this.detailCurveCharts.resetLineChartsByDateOrData(this.leftTopPointArr,dataObj);
				_this.detailCurveCharts.setPosition(_this.leftTopPointArr);
			},
			refreshBySize:function(size){
				var _this = this;
				size.width = size.width<800 ? 800 : size.width;
				size.height = size.height<400 ? 400 : size.height;
				this.width = size.width-10;
				this.height = size.height-10;
				this.updateParamsAboutSize();
				this.refreshTextShape();
				this.refreshCalendarHeader(300);
				this.detailContainer.style.width = (this.width-this.xStart)+'px';
				this.detailContainer.style.height = (this.height-this.yStart)+'px';
				var interval = setInterval(function(){
					if(_this.detailCurveCharts && !_this.detailCurveCharts.getIsAnimatingState()){
						clearInterval(interval);
						_this.detailCurveCharts.updateOptions({width:_this.width,height:_this.height});
						_this.detailCurveCharts.setPosition(_this.leftTopPointArr,null,250);
					}
				},50);
			},
      getWeekDayByDate:function(year,month,day){
        var date = new Date(year+'/'+month+'/'+day);
        return date.getDay();
      },
      getSumDaysOfMonth:function(year,month){
        var  tempDate = new Date(year,month,0);
        return tempDate.getDate();
      }


	};
	cxt.FishEyeCalendar = FishEyeCalendar;
})(window);
