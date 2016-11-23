// 所有的曲线详情图表的插件
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
      this.chartContainerArr = [];
      this.lineChartsArr = [];
      this.leftTopPointArr = null;

      this.initElement();
      this.addEvent();
    },
    initElement:function(){
      for(var i=0;i<31;i++){
        var ele = document.createElement('div');
        ele.style.padding = '4px';
        ele.style.position = 'absolute';
        ele.style.boxSizing = 'border-box';
        // ele.style.border = '1px solid #4370EC';
        // ele.style.marginLeft='-1px';
        ele.setAttribute('data-index',i+1);
        this.chartContainerArr[i] = ele;
        this.container.appendChild(ele);
      }
      for(var i=0;i<31;i++){
        this.lineChartsArr[i] = this.echarts.init(this.chartContainerArr[i], null, {
                    renderer: 'canvas'
                });
        this.lineChartsArr[i].setOption(this.getChartData());
      }
    },
    setPosition:function(leftTopPointArr){
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
            chartContainer.style.left = curPointX+'px';
            chartContainer.style.top = curPointY+'px';
            chartContainer.style.width = (nextPointX - curPointX)+'px';
            chartContainer.style.height = (nextPointY - curPointY)+'px';
          }
        }
      }
      for(var i=0;i<31;i++){
        this.lineChartsArr[i].resize();
      }
      // this.lineChartsArr[i].resize();
    },
    addEvent:function(){
      var _this = this;
      for(var i=0;i<31;i++){
        this.chartContainerArr[i].onmouseenter = function(e){
          var index = e.currentTarget.getAttribute('data-index');
          if(_this.isAnimating){
            return;
          }
          e.currentTarget.style.border = '2px solid #ff7227';
        };
        this.chartContainerArr[i].onmouseleave = function(e){
          var index = e.currentTarget.getAttribute('data-index');
          // e.currentTarget.style.border = '1px solid #4370EC';
          e.currentTarget.style.border = '0px solid #000';
        };

        this.chartContainerArr[i].onclick = function(e){
          console.log("click e:",e);
          var index = e.currentTarget.getAttribute('data-index');
          var rowNum = _this.leftTopPointArr.length;
          var colNum = _this.leftTopPointArr[0].length;
          var clickXIndex=0,clickYIndex=0;
          for(var i=0;i<rowNum;i++){
            for(var j=0;j<colNum;j++){
              if(+_this.leftTopPointArr[i][j]['text'] == index){
                clickXIndex = i;
                clickYIndex = j;
              }
            }
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
    getChartData:function(){
        var chartData = {
          // backgroundColor:'#F10113',
          animationDurationUpdate:500,
          title: {
              text: '动态数据',
              subtext: '纯属虚构'
          },
          tooltip: {
              trigger: 'axis'
          },
          legend: {
              data:['最新成交价', '预购队列']
          },
          toolbox: {
              show: true,
              feature: {
                  dataView: {readOnly: false},
                  restore: {},
                  saveAsImage: {}
              }
          },
          dataZoom: {
              show: false,
              start: 0,
              end: 100
          },
          xAxis: [
              {
                  type: 'category',
                  boundaryGap: true,
                  data: (function (){
                      var now = new Date();
                      var res = [];
                      var len = 10;
                      while (len--) {
                          res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                          now = new Date(now - 2000);
                      }
                      return res;
                  })()
              },
              {
                  type: 'category',
                  boundaryGap: true,
                  data: (function (){
                      var res = [];
                      var len = 10;
                      while (len--) {
                          res.push(len + 1);
                      }
                      return res;
                  })()
              }
          ],
          yAxis: [
              {
                  type: 'value',
                  scale: true,
                  name: '价格',
                  max: 30,
                  min: 0,
                  boundaryGap: [0.2, 0.2]
              },
              {
                  type: 'value',
                  scale: true,
                  name: '预购量',
                  max: 1200,
                  min: 0,
                  boundaryGap: [0.2, 0.2]
              }
          ],
          series: [
              {
                  name:'预购队列',
                  type:'line',
                  // xAxisIndex: 1,
                  // yAxisIndex: 1,
                  data:(function (){
                      var res = [];
                      var len = 10;
                      while (len--) {
                          res.push((Math.random()*10 + 5).toFixed(1) - 0);
                      }
                      return res;
                  })()
              },
              {
                  name:'最新成交价',
                  type:'line',
                  data:(function (){
                      var res = [];
                      var len = 0;
                      while (len < 10) {
                          res.push((Math.random()*10 + 5).toFixed(1) - 0);
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
