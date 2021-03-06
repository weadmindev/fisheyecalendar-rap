
;(function(cxt){
  var DetailCurveCharts = function(){
    this.init.apply(this, arguments);
  }
  DetailCurveCharts.prototype = {
    init:function(options){
      this.echarts = options.echarts;
      this.container = options.container;
      this.dataObj = options.dataObj;
      this.xBoxNum = options.xBoxNum;
      this.yBoxNum = options.yBoxNum;
      this.xStart = options.xStart;
      this.yStart = options.yStart;
      this.width = options.width;
      this.height = options.height;
      this.refreshAllOnClick = options.refreshAllOnClick;
      this.leftTopPointArr = options.leftTopPointArr || [];
      this.enlargeBox = options.enlargeBox || {xIndex:-1,yIndex:-1};
      this.oldEnlargeBox = {xIndex:this.enlargeBox.xIndex,yIndex:this.enlargeBox.yIndex};
      this.todayIndex = options.todayIndex; //from 0 start. min value is 0.
      this.firstDayWeekIndex = options.firstDayWeekIndex;
      this.chartContainerArr = []; //the div container
      this.lineChartsArr = [];
      this.canClickEnlarge = true;
      this.isCtrlKeyDown = false;
      this.isAnimating = false;
      this.animationTime = options.animationTime; // millisecond.
      this.chartAnimation = 700; //generaly, this is same with animationTime.
      this.lineDescMap = {'package':'包成功率(%)','retime':'数据往返时间(ms)'};
      this.lineColor = options.lineColor;
      this.initElement();
      this.addEvent();
    },
    initElement:function(){
      var i=0,j=0;
      var hasEnlargeBox = this.hasEnlargeBox();
      for(i = 0; i < this.yBoxNum; i++) {
        this.chartContainerArr.push([]);
        this.lineChartsArr.push([]);
        var rowList = this.leftTopPointArr[i];
        var nextPointY = ((i==this.yBoxNum-1) ? this.height : this.leftTopPointArr[i+1][0]['y']) -this.yStart; //next Y point coordinate
        for(j=0;j< this.xBoxNum;j++){
          var ele = document.createElement('div');
          var leftTop = this.leftTopPointArr[i][j];
          var nextPointX = ((j==this.xBoxNum-1) ? this.width : rowList[j+1]['x']) -this.xStart; //next X point coordinate.
          ele.style.left = leftTop.x-this.xStart+'px';
          ele.style.top = leftTop.y-this.yStart+'px';
          ele.style.width = (nextPointX - leftTop.x + this.xStart)+'px';
          ele.style.height = (nextPointY - leftTop.y + this.yStart)+'px';
          ele.style.backgroundColor= leftTop.flag=='current' ? '#fff' : '#D8DBE4';
          this.chartContainerArr[i][j] = ele;
          this.container.appendChild(ele);
          ele.setAttribute('class','chartContainer');
          ele.setAttribute('data-flag',leftTop.flag);
          ele.setAttribute('data-index',leftTop.text);
          ele.setAttribute('data-xindex',i);
          ele.setAttribute('data-yindex',j);
          $(ele).append('<span class="chartDayText">'+leftTop.text+'</span>');
          $(ele).append('<div class="chartContent"></div>');
          this.lineChartsArr[i][j] = this.echarts.init($(ele).find('.chartContent')[0], null, {renderer: 'canvas'});
          this.lineChartsArr[i][j].setOption(this.getChartData(leftTop.text,leftTop.flag));
        }
      }
      this.setTodayBoxBorderColor();
    },
    setPosition:function(leftTopPointArr,dataObj,animateTime){

      var _this = this;
      this.leftTopPointArr = leftTopPointArr;
      var hasEnlargeBox = this.hasEnlargeBox();
      var rowNum = leftTopPointArr.length;
      var colNum = leftTopPointArr[0].length;
      for(var i=0;i<rowNum;i++){
        var rowList = leftTopPointArr[i];
        var curPointY = leftTopPointArr[i][0]['y']-this.yStart;
        var nextPointY = ((i==rowNum-1) ? this.height : leftTopPointArr[i+1][0]['y']) -this.yStart; //next Y point coordinate
        for(var j=0;j<colNum;j++){
          var leftTop = this.leftTopPointArr[i][j];
          var curPointX = rowList[j]['x']-this.xStart; //current X point coordinate.
          var nextPointX = ((j==colNum-1) ? this.width : rowList[j+1]['x']) -this.xStart; //next X point coordinate.
          var chartContainer = this.chartContainerArr[i][j];
          var lineCharts = this.lineChartsArr[i][j];
          // this.resetLineChartsByDateOrData(dataObj,hasEnlargeBox,lineCharts,i,j);
          (function(chartContainer,curPointX,curPointY,nextPointX,nextPointY,lineCharts,animationTime,ii,jj){
            $(chartContainer).animate({
              left:curPointX+'px',
              top:curPointY+'px',
              width:(nextPointX - curPointX)+'px',
              height:(nextPointY - curPointY)+'px'
            },animationTime,'linear');
            _this.refreshZoomAnimation(ii,jj,(nextPointX - curPointX),(nextPointY - curPointY));
          })(chartContainer,curPointX,curPointY,nextPointX,nextPointY,lineCharts,animateTime || _this.animationTime,i,j);
          (function(lineCharts,ii,jj){
            if(hasEnlargeBox && (_this.enlargeBox.xIndex != ii || _this.enlargeBox.yIndex!=jj)){
              _this.setLineChartsSeriesShow(lineCharts,false,ii,jj);
            }else{
              _this.setLineChartsSeriesShow(lineCharts,true,ii,jj);
            }
          })(lineCharts,i,j);
        }
      }
      setTimeout(function(){
        _this.setOldEnlargeBox();
      },animateTime || this.animationTime);
    },
    resetLineChartsByDateOrData:function(leftTopPointArr,dataObj){  //if update the date or data,we need clear the charts and reset it.
      var _this = this;
      if(dataObj){
        this.dataObj = dataObj;
        this.setOldEnlargeBox();
      }
      this.leftTopPointArr = leftTopPointArr;
      var hasEnlargeBox = this.hasEnlargeBox();
      var rowNum = leftTopPointArr.length;
      var colNum = leftTopPointArr[0].length;
      for(var i=0;i<rowNum;i++){
        var rowList = leftTopPointArr[i];
        var curPointY = leftTopPointArr[i][0]['y']-this.yStart;
        var nextPointY = ((i==rowNum-1) ? this.height : leftTopPointArr[i+1][0]['y']) -this.yStart; //next Y point coordinate
        for(var j=0;j<colNum;j++){
          var leftTop = this.leftTopPointArr[i][j];
          var ele = this.chartContainerArr[i][j];
          var lineCharts = this.lineChartsArr[i][j];
          lineCharts && lineCharts.clear();
          lineCharts && lineCharts.setOption(this.getChartData(leftTop.text,leftTop.flag));
          (hasEnlargeBox && (this.enlargeBox.xIndex == i && this.enlargeBox.yIndex==j)) && this.setLineChartsOptionShow(i,j,true,1);
          ele.style.backgroundColor= leftTop.flag=='current' ? '#fff' : '#D8DBE4';
          ele.setAttribute('data-flag',leftTop.flag);
          ele.setAttribute('data-index',leftTop.text);
          ele.setAttribute('data-xindex',i);
          ele.setAttribute('data-yindex',j);
          ele.style.boxShadow='0 0 0 0 #fff';
          ele.style.zIndex=99;
          $(ele).find('.chartDayText').text(leftTop.text);
        }
      }
      dataObj ? this.setTodayBoxBorderColor(): null;
    },
    refreshZoomAnimation:function(i,j,width,height){
      var _this = this;
      var chartContainer = this.chartContainerArr[i][j];
      var lineCharts = this.lineChartsArr[i][j];
      var oldx = this.oldEnlargeBox.xIndex, oldy = this.oldEnlargeBox.yIndex;
      var x = this.enlargeBox.xIndex, y = this.enlargeBox.yIndex;
      var className = '';
      var originWidth = lineCharts.getWidth();
      var originHeight = lineCharts.getHeight();
      if(oldx ==-1 && x!=-1){ //old has not enlarge box
        if(x == i && y == j){ //zoom in the box,
          // setTimeout(function(){
          // },10);
          _this.chartZoomIn(chartContainer,lineCharts,width,height,'origin2max');
        }else if(x != i && y != j){
          this.chartZoomOut(chartContainer,lineCharts,width,height,'origin2min');
        }else if(x != i && y == j){
          this.chartZoomOut(chartContainer,lineCharts,width,height,'originY2min');
          this.chartZoomIn(chartContainer,lineCharts,width,height,'originX2max');
        }else if(x == i && y != j){
          this.chartZoomOut(chartContainer,lineCharts,width,height,'originX2min');
          this.chartZoomIn(chartContainer,lineCharts,width,height,'originY2max');
        }else{
          lineCharts.resize({width:width,height:height});
        }
      }else if(oldx !=-1 && x!=-1){ //old has enlarge box,now has enlarge box
        if(oldx == i && oldy == j){//to zoom out
          if(oldx != x && oldy != y){
            className = 'max2min';
          }else if(oldx != x && oldy == y){
            className = 'max2miny';
          }else if(oldx == x && oldy != y){
            className = 'max2minx';
          }
          this.chartZoomOut(chartContainer,lineCharts,width,height,className);
        }else if(x==i&&y==j){ //to zoomin 放大
          if(oldx != x && oldy != y){
            className = 'min2max';
          }else if(oldx != x && oldy == y){
            className = 'min2maxy';
          }else if(oldx == x && oldy != y){
            className ='min2maxx';
          }
          this.chartZoomIn(chartContainer,lineCharts,width,height,className);
        }else if(oldx==x && y!=oldy){ //new and old enlarge box in one row.
          if(j==y){
            this.chartZoomIn(chartContainer,lineCharts,width,height,'min2maxx');
          }else if(j==oldy){
            this.chartZoomOut(chartContainer,lineCharts,width,height,'max2minx');
          }
        }else if(oldx!=x && y==oldy){ //new and old enlarge box in one col.
          if(i==x){
            this.chartZoomIn(chartContainer,lineCharts,width,height,'min2maxy');
          }else if(i==oldx){
            this.chartZoomOut(chartContainer,lineCharts,width,height,'max2miny');
          }
        }else if(oldx!=x && y!=oldy){
          if(i==x){
            this.chartZoomIn(chartContainer,lineCharts,'auto',height,'min2maxy');
          }
          if(j==y){
            this.chartZoomIn(chartContainer,lineCharts,width,'auto','min2maxx');
          }
          if(i==oldx){
            this.chartZoomOut(chartContainer,lineCharts,'auto',height,'max2miny');
            setTimeout(function(){
              lineCharts.resize({width:width,height:height});
            },this.chartAnimation+50);
          }
          if(j==oldy){
            this.chartZoomOut(chartContainer,lineCharts,width,'auto','max2minx');
            setTimeout(function(){
              lineCharts.resize({width:width,height:height});
            },this.chartAnimation+50);
          }
        }else{
          lineCharts.resize({width:width,height:height});
        }
      }else if(oldx !=-1 && x==-1){ // reset all to primary size.
        if(oldx == i && oldy == j){
          this.chartZoomOut(chartContainer,lineCharts,width,height,'max2origin');
        }else if(oldx == i && oldy != j){
          this.chartZoomIn(chartContainer,lineCharts,width,'auto','minX2origin');
          this.chartZoomOut(chartContainer,lineCharts,'auto',height,'maxY2origin');
          setTimeout(function(){
            lineCharts.resize({width:width,height:height});
          },this.chartAnimation+50);
        }else if(oldx != i && oldy == j){
          this.chartZoomIn(chartContainer,lineCharts,'auto',height,'minY2origin');
          this.chartZoomOut(chartContainer,lineCharts,width,'auto','maxX2origin');
          setTimeout(function(){
            lineCharts.resize({width:width,height:height});
          },this.chartAnimation+50);
        }else{
          this.chartZoomIn(chartContainer,lineCharts,width,height,'min2origin');
        }
      }else if(oldx ==-1 && x==-1){ // just change the size without animation.
        lineCharts.resize({width:width,height:height});
      }
    },
    chartZoomOut:function(chartContainer,lineCharts,width,height,className){ //缩小图形。
      $(chartContainer).find('.chartContent').addClass(className);
      setTimeout(function(){
        lineCharts.resize({width:width,height:height});
        $(chartContainer).find('.chartContent').removeClass(className);
      },this.chartAnimation);
    },
    chartZoomIn:function(chartContainer,lineCharts,width,height,className){ //放大图形。
      lineCharts.resize({width:width,height:height});
      $(chartContainer).find('.chartContent').addClass(className);
      setTimeout(function(){
        $(chartContainer).find('.chartContent').removeClass(className);
      },this.chartAnimation);
    },
    updateOptions:function(options){
      for(var key in options){
        this[key] = options[key];
      }
    },
    addEvent:function(){
      var _this = this;
      for(var i = 0; i < this.yBoxNum; i++) {
        for(var j=0;j< this.xBoxNum;j++){
          this.chartContainerArr[i][j].onmouseenter = function(e){
            if(!_this.canResponseEvent(e)){return;}
            e.currentTarget.style.border = '2px solid #ff7227';
          };
          this.chartContainerArr[i][j].onmouseleave = function(e){
            if(!_this.canResponseEvent(e)){return;}
            e.currentTarget.style.border = '1px solid #888A8E';
          };
          this.chartContainerArr[i][j].onclick = function(e){
            if(!_this.canClickEnlarge){return;}
            if(!_this.canResponseEvent(e)){return;}
            if(_this.isAnimating){ return;}
            _this.isAnimating = true;
            setTimeout(function(){_this.isAnimating = false},_this.animationTime+100);
            var flag = e.currentTarget.getAttribute('data-flag');
            var index = +e.currentTarget.getAttribute('data-index');
            var rowNum = _this.leftTopPointArr.length;
            var colNum = _this.leftTopPointArr[0].length;
            var clickXIndex=_this.enlargeBox.xIndex,clickYIndex=_this.enlargeBox.yIndex;
            var oldDayIndex = clickXIndex>=0 ? _this.leftTopPointArr[clickXIndex][clickYIndex]['text'] : '';
            if(oldDayIndex){
              _this.setLineChartsOptionShow(clickXIndex,clickYIndex,false);
            }
            for(var i=0;i<rowNum;i++){
              for(var j=0;j<colNum;j++){
                if(+_this.leftTopPointArr[i][j]['text'] == index && _this.leftTopPointArr[i][j]['flag']==flag){
                  clickXIndex = i;
                  clickYIndex = j;
                }
              }
            }
            if(oldDayIndex != index){
              _this.setLineChartsOptionShow(clickXIndex,clickYIndex,true);
            }
            _this.refreshAllOnClick(clickXIndex,clickYIndex);
          };
          this.lineChartsArr[i][j] && this.lineChartsArr[i][j].on('click', function(params){
            _this.canClickEnlarge = false; //when click the linecharts, for stop the chart 'div' Container click event.
            setTimeout(function(){
              _this.canClickEnlarge = true;
            },100);
          });
          this.lineChartsArr[i][j] && this.lineChartsArr[i][j].on('legendselectchanged',function(params){
            _this.canClickEnlarge = false;
            setTimeout(function(){
              _this.canClickEnlarge = true;
            },100);
            if(!_this.isCtrlKeyDown){
              var selected = params.selected;
              for(var key in selected){
                selected[key] = (key == params.name) ? true : false ;
              }
              _this.lineChartsArr[_this.enlargeBox.xIndex][_this.enlargeBox.yIndex].setOption({
                legend:{
                  selected:selected
                }
              });
            }
          });
          $(document).keydown(function (event) {
            _this.isCtrlKeyDown = event.ctrlKey;
          });
          $(document).keyup(function (event) {
            _this.isCtrlKeyDown = event.ctrlKey;
          });
          //////////other event
        }
      }
    },
    canResponseEvent:function(e){ //if click the day after today,return false, indicate can not click.
      var canResponse = true;
      var xIndex = +e.currentTarget.getAttribute('data-xindex');
      var yIndex = +e.currentTarget.getAttribute('data-yindex');
      if(this.todayIndex.yIndex>=0 && xIndex*this.xBoxNum+yIndex > this.todayIndex.xIndex*this.xBoxNum+this.todayIndex.yIndex){
        canResponse = false;
      }
      return canResponse;
    },
    getIsAnimatingState:function(){
      return this.isAnimating;
    },
    setEnlargeBox:function(enlargeBox){
      this.enlargeBox = enlargeBox;
    },
    setOldEnlargeBox:function(){
      this.oldEnlargeBox = {xIndex:this.enlargeBox.xIndex,yIndex:this.enlargeBox.yIndex};
    },
    setFirstDayWeekIndex:function(index){
      this.firstDayWeekIndex = index;
    },
    setTodayIndex:function(todayIndex){
      this.todayIndex = todayIndex;
    },
    hasEnlargeBox:function(){
      return (this.enlargeBox.xIndex >= 0 && this.enlargeBox.yIndex >= 0) ? true : false;
    },
    setLineColor:function(lineColor){
      this.lineColor = lineColor;
    },
    setTodayBoxBorderColor:function(){
      if(this.todayIndex.xIndex>=0){
        var i = this.todayIndex.xIndex;
        var j = this.todayIndex.yIndex;
        this.chartContainerArr[i][j].style.boxShadow = '0 0 3px 2px #831FF1';
        this.chartContainerArr[i][j].style.zIndex = '99999';
      }
    },
    setLineChartsOptionShow:function(xIndex, yIndex, isShow,animationTime){
      var _this = this;
      setTimeout(function(){
        _this.lineChartsArr[xIndex][yIndex].setOption({
          legend:{
            show:isShow
          },
          xAxis:[{
            axisLabel:{show:isShow}
          }],
          yAxis:[{
            axisLabel:{show:isShow}
          }]
        });
      },animationTime || _this.animationTime/2);
    },
    setLineChartsSeriesShow:function(lineCharts,isShow,i,j){
      var leftTop = this.leftTopPointArr[i][j];
      var seriesList = [];
      if(this.dataObj[leftTop.flag] && this.dataObj[leftTop.flag][leftTop.text]){
        var legendDescArr = this.getlegendListByDay(leftTop.text,leftTop.flag);
        var linesArr = this.dataObj[leftTop.flag][leftTop.text];
        for(var i=0;i<linesArr.length;i++){
          seriesList.push({
            name:legendDescArr[i],
            type:'line',
            showSymbol :isShow,
            lineStyle:{
              normal:{
                opacity:isShow?1:0
              }
            }
          });
        }
      }
      var startTime = this.animationTime+i*10;
      // var startTime = i*50+j*100;
      if(!isShow){
        startTime = 0;
      }
      setTimeout(function(){
        lineCharts && lineCharts.setOption({
          yAxis:[{
            axisTick :{show:isShow},
            axisLine:{show:isShow}
          }],
          xAxis:[{
            axisTick :{show:isShow},
            axisLine:{show:isShow}
          }],
          series: seriesList
        });
      },startTime);
    },
    getlegendListByDay:function(dayTxt,flag){
      var arr = [];
      if(!this.dataObj[flag] || !this.dataObj[flag][dayTxt]){
        return arr;
      }
      var linesArr = this.dataObj[flag][dayTxt];
      for(var i=0;i<linesArr.length;i++){
        var nameCn = this.lineDescMap[linesArr[i]['name']];
        arr.push(nameCn ? nameCn : linesArr[i]['name']);//if have not chinese name, then use name value.
      }
      return arr;
    },
    getLineSeriesData:function(dayTxt,flag,legendDescArr){
      var seriesList = [];
      if(!this.dataObj[flag] || !this.dataObj[flag][dayTxt]){
        return seriesList;
      }
      var linesArr = this.dataObj[flag][dayTxt];
      for(var i=0;i<linesArr.length;i++){
        seriesList.push({
          name:legendDescArr[i],
          type:'line',
          hoverAnimation:false,
          symbolSize :1,
          showSymbol :true,
          lineStyle:{normal:{opacity:1,width:1}},
          data:linesArr[i]['data']
        });
      }
      return seriesList;
    },
    getChartData:function(dayTxt,flag){
      var legendDescArr = this.getlegendListByDay(dayTxt,flag);
      var seriesList = this.getLineSeriesData(dayTxt,flag,legendDescArr);
        var chartData = {
          animationDurationUpdate:this.animationTime/2,
          animationEasingUpdate:'cubicInOut',
          animation:false,
          color:this.lineColor,
          legend: {
            show:false,
            data:legendDescArr
          },
          grid:{
            top:'10%',
            width:'80%',
            height:'80%'
          },
          xAxis: [
              {
                  type: 'value',
                  boundaryGap: true,
                  min:0,
                  max:1440,
                  axisTick :{show:true},
                  axisLine:{show:true},
                  axisLabel:{
                    show:false,
                    formatter:function (value, index) {
                      var hourTxt = parseInt(value/60), minuTxt = parseInt(value%60);
                      if(hourTxt<10){
                        hourTxt = '0'+hourTxt;
                      }
                      if(minuTxt<10){
                        minuTxt = '0'+minuTxt;
                      }
                        return hourTxt+':'+minuTxt;
                    }
                  }

              }
          ],
          yAxis: [
              {
                  type: 'value',
                  axisTick :{show:true},
                  axisLine:{show:true},
                  axisLabel:{
                    show:false
                  }
              }
          ],
          series: seriesList
        };
        return chartData;
      }
  };
  cxt.DetailCurveCharts = DetailCurveCharts;
})(window);
