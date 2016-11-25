
;(function(cxt){
  var DetailCurveCharts = function(){
    this.init.apply(this, arguments);
  }
  DetailCurveCharts.prototype = {
    init:function(options){
      this.zrender = options.zrender;
      this.echarts = options.echarts;
      this.container = options.container;
      this.dataList = options.dataList;
      this.xBoxNum = options.xBoxNum;
      this.yBoxNum = options.yBoxNum;
      this.xStart = options.xStart;
      this.yStart = options.yStart;
      this.width = options.width;
      this.height = options.height;
      this.refreshAllOnClick = options.refreshAllOnClick;
      this.leftTopPointArr = options.leftTopPointArr || [];
      this.enlargeBox = options.enlargeBox || {xIndex:-1,yIndex:-1};
      this.todayIndex = options.todayIndex; //from 0 start. min value is 0.
      this.firstDayWeekIndex = options.firstDayWeekIndex;
      this.chartContainerArr = []; //the div container
      this.lineChartsArr = [];
      this.parseDataList = [];
      this.canClickEnlarge = true;
      this.animationTime = options.animationTime || 1000; // millisecond.
      this.formatParseData(this.dataList);
      this.initElement();
      this.addEvent();
    },
    initElement:function(){
      var i=0,j=0;
      for(i = 0; i < this.yBoxNum; i++) {
        this.chartContainerArr.push([]);
        this.lineChartsArr.push([]);
        var rowList = this.leftTopPointArr[i];
        var nextPointY = ((i==this.yBoxNum-1) ? this.height : this.leftTopPointArr[i+1][0]['y']) -this.yStart; //next Y point coordinate
        for(j=0;j< this.xBoxNum;j++){
          var ele = document.createElement('div');
          var leftTop = this.leftTopPointArr[i][j];
          var nextPointX = ((j==this.xBoxNum-1) ? this.width : rowList[j+1]['x']) -this.xStart; //next X point coordinate.
          ele.style.padding = '2px';
          ele.style.position = 'absolute';
          ele.style.backgroundColor = '#D8DBE4';
          ele.style.boxSizing = 'border-box';
          ele.style.border = '1px solid #888A8E';
          ele.style.left = leftTop.x-this.xStart+'px';
          ele.style.top = leftTop.y-this.yStart+'px';
          ele.style.width = (nextPointX - leftTop.x + this.xStart)+'px';
          ele.style.height = (nextPointY - leftTop.y + this.yStart)+'px';
          this.chartContainerArr[i][j] = ele;
          this.container.appendChild(ele);
          var dayNum = leftTop['text'];
          if(dayNum){
            ele.setAttribute('data-index',dayNum);
            ele.style.backgroundColor = '#fff';
            this.lineChartsArr[i][j] = this.echarts.init(ele, null, {renderer: 'canvas'});
            this.lineChartsArr[i][j].setOption(this.getChartData(dayNum));
          }
        }
      }
      this.setTodayBoxBorderColor();
    },
    setPosition:function(leftTopPointArr,isInit){
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
          var curPointX = rowList[j]['x']-this.xStart; //current X point coordinate.
          var nextPointX = ((j==colNum-1) ? this.width : rowList[j+1]['x']) -this.xStart; //next X point coordinate.
          var chartContainer = this.chartContainerArr[i][j];
          var lineCharts = this.lineChartsArr[i][j];
          (function(chartContainer,curPointX,curPointY,nextPointX,nextPointY,lineCharts,animationTime,i,j){
            setTimeout(function(){
              $(chartContainer).animate({
                left:curPointX+'px',
                top:curPointY+'px',
                width:(nextPointX - curPointX)+'px',
                height:(nextPointY - curPointY)+'px'
              },animationTime,'linear');
              setTimeout(function(){
                lineCharts && lineCharts.resize({
                  width:(nextPointX - curPointX),
                  height:(nextPointY - curPointY)
                });
              },20);
            },20*i);
          })(chartContainer,curPointX,curPointY,nextPointX,nextPointY,lineCharts,_this.animationTime,i,j);
          (function(lineCharts,i,j){
            setTimeout(function(){
              if(hasEnlargeBox && _this.enlargeBox.xIndex != i && _this.enlargeBox.yIndex!=j){
                _this.setLineChartsSeriesShow(lineCharts,false);
              }else{
                _this.setLineChartsSeriesShow(lineCharts,true);
              }
            },10*i+10*j);
          })(lineCharts,i,j);
        }
      }
    },
    addEvent:function(){
      var _this = this;
      for(var i = 0; i < this.yBoxNum; i++) {
        for(var j=0;j< this.xBoxNum;j++){
          this.chartContainerArr[i][j].onmouseenter = function(e){
            var index = e.currentTarget.getAttribute('data-index');
            if(!index || index-1 >= _this.todayIndex){return;}
            e.currentTarget.style.border = '2px solid #ff7227';
          };
          this.chartContainerArr[i][j].onmouseleave = function(e){
            var index = e.currentTarget.getAttribute('data-index');
            if(!index || index-1 >= _this.todayIndex){return;}
            e.currentTarget.style.border = '1px solid #888A8E';
          };
          this.chartContainerArr[i][j].onclick = function(e){
            var index = +e.currentTarget.getAttribute('data-index');
            if(!index || index-1 > _this.todayIndex){return;}
            if(!_this.canClickEnlarge){
              return;
            }
            var rowNum = _this.leftTopPointArr.length;
            var colNum = _this.leftTopPointArr[0].length;
            var clickXIndex=_this.enlargeBox.xIndex,clickYIndex=_this.enlargeBox.yIndex;
            var oldDayIndex = clickXIndex>=0 ? _this.leftTopPointArr[clickXIndex][clickYIndex]['text'] : '';
            if(oldDayIndex){
              _this.setLineChartsOptionShow(clickXIndex,clickYIndex,false);
            }
            for(var i=0;i<rowNum;i++){
              for(var j=0;j<colNum;j++){
                if(+_this.leftTopPointArr[i][j]['text'] == index){
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
          });
          //////////other event
        }
      }
    },
    setEnlargeBox:function(enlargeBox){
      this.enlargeBox = enlargeBox;
    },
    hasEnlargeBox:function(){
      return (this.enlargeBox.xIndex >= 0 && this.enlargeBox.yIndex >= 0) ? true : false;
    },
    setTodayBoxBorderColor:function(){
      if(this.todayIndex>=0){
        var i = parseInt((this.todayIndex+this.firstDayWeekIndex)/this.xBoxNum);
        var j = parseInt((this.todayIndex+this.firstDayWeekIndex)%this.xBoxNum);
        this.chartContainerArr[i][j].style.border = '1px solid #C3CC3D';
        this.chartContainerArr[i][j].style.boxShadow = '0 0 6px 2px #C1EA1C';
        this.chartContainerArr[i][j].style.zIndex = '99999';
      }
    },
    setLineChartsOptionShow:function(xIndex, yIndex, isShow){
      this.lineChartsArr[xIndex][yIndex].setOption({
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
    },
    setLineChartsSeriesShow:function(lineCharts,isShow){
      lineCharts && lineCharts.setOption({
        series: [
            {
                showSymbol :isShow,
                lineStyle:{
                  normal:{
                    opacity:isShow?1:0
                  }
                }
            },
            {
                showSymbol :isShow,
                lineStyle:{
                  normal:{
                    opacity:isShow?1:0
                  }
                }
            }
        ]
      });
    },
    formatParseData:function(dataList){
        for(var dayNum in dataList){
          var arr = dataList[dayNum];
          var obj = {'package':[],'retime':[]};
          for(var i=0;i<arr.length;i++){
            obj.package.push(arr[i].package);
            obj.retime.push(arr[i].retime);
          }
          this.parseDataList.push(obj);
        }
        console.log('this.parseDataList:',this.parseDataList);
    },
    getChartData:function(dayTxt){
        var chartData = {
          // backgroundColor:'#F10113',
          animationDurationUpdate:this.animationTime,
          animationEasingUpdate:'cubicInOut',
          title: {
              text: dayTxt+'',
              textStyle: {
                color: '#2d78f4',
                // fontStyle: 'normal',
                fontWeight: 'bolder',
                fontFamily:'STCaiyun'
                // fontSize: 18,
                }
          },
          // tooltip: {
          //     trigger: 'axis'
          // },
          legend: {
            show:false,
              data:['包成功率(%)', '数据往返时间(ms)']
          },
          dataZoom: [
              {
                  id: 'dataZoomX',
                  type: 'inside',
                  xAxisIndex: [0],
                  filterMode: 'filter'
              },
              {
                  id: 'dataZoomY',
                  type: 'inside',
                  yAxisIndex: [0],
                  filterMode: 'empty'
              }
          ],
          xAxis: [
              {
                  type: 'value',
                  boundaryGap: true,
                  min:0,
                  max:1440,
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
                  axisLabel:{
                    show:false
                  }
              }
          ],
          series: [
              {
                  name:'包成功率(%)',
                  type:'line',
                  hoverAnimation:false,
                  symbolSize :1,
                  showSymbol :false,
                  data:this.parseDataList[dayTxt-1]['package']
              },
              {
                  name:'数据往返时间(ms)',
                  type:'line',
                  symbolSize :1,
                  hoverAnimation:false,
                  showSymbol :false,
                  data:this.parseDataList[dayTxt-1]['retime']
              }
          ]
        };
        return chartData;
      }
  };
  cxt.DetailCurveCharts = DetailCurveCharts;
})(window);
