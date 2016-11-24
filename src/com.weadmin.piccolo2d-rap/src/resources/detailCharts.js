
;(function(cxt){
  var DetailCurveCharts = function(){
    this.init.apply(this, arguments);
  }
  DetailCurveCharts.prototype = {
    init:function(options){
      this.echarts = options.echarts;
      this.container = options.container;
      this.xStart = options.xStart;
      this.yStart = options.yStart;
      this.width = options.width;
      this.height = options.height;
      this.refreshAllOnClick = options.refreshAllOnClick;
      this.isAnimating = options.isAnimating || false;
      this.enlargeBox = options.enlargeBox || {xIndex:-1,yIndex:-1};
      this.todayIndex = options.todayIndex;
      this.chartContainerArr = []; //the div container
      this.lineChartsArr = [];
      this.leftTopPointArr = null;
      this.canClickEnlarge = true;
      this.initElement();
      this.addEvent();
    },
    initElement:function(){
      for(var i=0;i<31;i++){
        var ele = document.createElement('div');
        ele.style.padding = '2px';
        ele.style.position = 'absolute';
        ele.style.left = '-100px';
        ele.style.boxSizing = 'border-box';
        ele.style.border = '1px solid #4370EC';
        // ele.style.marginLeft='-1px';
        ele.setAttribute('data-index',i+1);
        this.chartContainerArr[i] = ele;
        this.container.appendChild(ele);
      }
      for(var i=0;i<31;i++){
        this.lineChartsArr[i] = this.echarts.init(this.chartContainerArr[i], null, {
                    renderer: 'canvas'
                });
        this.lineChartsArr[i].setOption(this.getChartData(i+1));
      }
      this.setTodayBoxBorderColor();
    },
    setPosition:function(leftTopPointArr,isInit){
      var _this = this;
      this.leftTopPointArr = leftTopPointArr;
      var rowNum = leftTopPointArr.length;
      var colNum = leftTopPointArr[0].length;
      for(var i=0;i<rowNum;i++){
        var rowList = leftTopPointArr[i];
        var curPointY = leftTopPointArr[i][0]['y']-this.yStart;
        var nextPointY = ((i==rowNum-1) ? this.height : leftTopPointArr[i+1][0]['y']) -this.yStart; //next Y point coordinate
        for(var j=0;j<colNum;j++){
          var curPointX = rowList[j]['x']-this.xStart; //current X point coordinate.
          var nextPointX = ((j==colNum-1) ? this.width : rowList[j+1]['x']) -this.xStart; //next X point coordinate.
          if(rowList[j]['text']){
            var chartContainer = this.chartContainerArr[rowList[j]['text']-1];
            var lineCharts = this.lineChartsArr[rowList[j]['text']-1];
            if(isInit){
              chartContainer.style.left = curPointX+'px';
              chartContainer.style.top = curPointY+'px';
              chartContainer.style.width = (nextPointX - curPointX)+'px';
              chartContainer.style.height = (nextPointY - curPointY)+'px';
            }
            (function(chartContainer,curPointX,curPointY,nextPointX,nextPointY,lineCharts){
              $(chartContainer).animate({
                left:curPointX+'px',
                top:curPointY+'px',
                width:(nextPointX - curPointX)+'px',
                height:(nextPointY - curPointY)+'px'
              },500,'linear',function(){
                // lineCharts.resize();
              });
              lineCharts.resize({width:(nextPointX - curPointX),height:(nextPointY - curPointY)});
            })(chartContainer,curPointX,curPointY,nextPointX,nextPointY,lineCharts);
          }
        }
      }
      if(isInit){
        for(var i=0;i<31;i++){
          _this.lineChartsArr[i].resize();
        }
      }
      // setTimeout(function(){
        // for(var i=0;i<31;i++){
        //   _this.lineChartsArr[i].resize();
        // }
      // },200);
      // this.lineChartsArr[i].resize();
    },
    addEvent:function(){
      var _this = this;
      for(var i=0;i<31;i++){
        this.chartContainerArr[i].onmouseenter = function(e){
          var index = e.currentTarget.getAttribute('data-index');
          if(index-1 == _this.todayIndex){return;}
          if(_this.isAnimating){
            return;
          }
          e.currentTarget.style.border = '2px solid #ff7227';
        };
        this.chartContainerArr[i].onmouseleave = function(e){
          var index = e.currentTarget.getAttribute('data-index');
          if(index-1 == _this.todayIndex){return;}
          // e.currentTarget.style.border = '1px solid #4370EC';
          e.currentTarget.style.border = '1px solid #4370EC';
        };
        this.lineChartsArr[i].on('click', function(params){
          //console.log("click chart params:",params);
          _this.canClickEnlarge = false;
          setTimeout(function(){
            _this.canClickEnlarge = true;
          },100);
        });
        this.lineChartsArr[i].on('legendselectchanged',function(params){
          //console.log("click legendselectchanged params:",params);
          _this.canClickEnlarge = false;
          setTimeout(function(){
            _this.canClickEnlarge = true;
          },100);
        });
        this.chartContainerArr[i].onclick = function(e){
          //console.log("click e:",e);
          if(!_this.canClickEnlarge){
            return;
          }
          var index = +e.currentTarget.getAttribute('data-index');
          var rowNum = _this.leftTopPointArr.length;
          var colNum = _this.leftTopPointArr[0].length;
          var clickXIndex=_this.enlargeBox.xIndex,clickYIndex=_this.enlargeBox.yIndex;
          var oldDayIndex = clickXIndex>=0 ? _this.leftTopPointArr[clickXIndex][clickYIndex]['text'] : '';
          if(oldDayIndex){
            _this.lineChartsArr[oldDayIndex-1].setOption({
              legend:{
                show:false
              },
              xAxis:[{
                axisLabel:{show:false}
              }]
            });
          }
          if(oldDayIndex != index){
            _this.lineChartsArr[index-1].setOption({
              legend:{
                show:true
              },
              xAxis:[{
                axisLabel:{show:true}
              }]
            });
          }
          for(var i=0;i<rowNum;i++){
            for(var j=0;j<colNum;j++){
              if(+_this.leftTopPointArr[i][j]['text'] == index){
                clickXIndex = i;
                clickYIndex = j;
              }
            }
          }
          //console.log("clickXIndex:",clickXIndex);
  				//console.log("clickYIndex:",clickYIndex);
  				if(!_this.leftTopPointArr[clickXIndex][clickYIndex]['text']){
  					return;
  				}
          _this.refreshAllOnClick(clickXIndex,clickYIndex);
          // _this.lineChartsArr[index-1].setOption({
          //   borderWidth:2,
          //   borderColor:'#ff7227'
          // });
          // _this.lineChartsArr[index-1].resize();
        };
      }
    },
    setAnimationState:function(isAnimating){
      this.isAnimating = isAnimating;
    },
    setEnlargeBox:function(enlargeBox){
      this.enlargeBox = enlargeBox;
    },
    hasEnlargeBox:function(){
      return (this.enlargeBox.xIndex >= 0 && this.enlargeBox.yIndex >= 0) ? true : false;
    },
    setTodayBoxBorderColor:function(){
      if(this.todayIndex>=0){
        this.chartContainerArr[this.todayIndex].style.border = '1px solid #C3CC3D';
        this.chartContainerArr[this.todayIndex].style.boxShadow = '0 0 6px 2px #C1EA1C';
      }
    },
    getChartData:function(dayTxt){
        var chartData = {
          // backgroundColor:'#F10113',
          animationDurationUpdate:500,
          animationEasingUpdate:'cubicInOut',
          title: {
              text: dayTxt+''
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
                  // scale: true,
                  // name: '浠锋牸',
                  // max: 30,
                  // min: 0,
                  // boundaryGap: [0.2, 0.2]
              }
          ],
          series: [
              {
                  name:'包成功率(%)',
                  type:'line',
                  data:(function (){
                      var res = [];
                      var len = 0;
                      while (len<100) {
                          res.push([10+len*5,(Math.random()*100 + 5).toFixed(1) - 0]);
                          len++;
                      }
                      return res;
                  })()
              },
              {
                  name:'数据往返时间(ms)',
                  type:'line',
                  data:(function (){
                      var res = [];
                      var len = 0;
                      while (len < 100) {
                          res.push([10+len*5,(Math.random()*50 + 5).toFixed(1) - 0]);
                          len++;
                      }
                      return res;
                  })()
              }
          ]
        };
        return chartData;
      }
  };
  cxt.DetailCurveCharts = DetailCurveCharts;
})(window);
