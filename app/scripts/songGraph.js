var d3 = require('d3'),
    $ = require('jQuery'),
    tip = require('d3-tip'),
    tooltipLib = require('./tooltip.js')
    constants = require('./constants.js');

require('../styles/songGraph.scss');

var x, y, tooltip;

var boxHeight = 50
    rectHeight = 15;

function songGraph(data,dateRange) {
  // process data
  var ukData, usData;
  for(var i=0;i<data.length;i++){
    if(data[i].key === 'us')
      usData = data[i].values;
    else if(data[i].key === 'uk')
      ukData = data[i].values;
  }

  // Split data up
  var usSongs = usData.map(function(d){ return d.key; }),
      ukSongs = ukData.map(function(d){ return d.key; }),
      allSongs = usSongs.concat(ukSongs.filter(function(item){ return usSongs.indexOf(item)<0; }));

  // // initialize
  // var x,y,xOverview,yOverview,
  //   xAxis,yAxis,xOverviewAxis,
  //   tooltip,brush,
  //   margin,width,height,marginOverview,heightOverview,
  //   svg,content,overview,
  //   defs;

  var gradientPairs=[['#9E0101','#F85C5C'], ['#3E6D86','#7FC9FF']]

  // Sizing
  var cWidth = document.body.clientWidth,
      margin =  { top: cWidth*0.05, right: cWidth*0.1, bottom: cWidth*0.1, left: cWidth*0.1 },
      width = document.body.clientWidth*0.5 - margin.left - margin.right,
      height = boxHeight*allSongs.length;

  // Scales
  x = d3.scaleTime()
    .range([0,width]);

  y = d3.scaleBand()
    .rangeRound([0,height])

  // Container
  $("<div id='songGraph'></div>").appendTo("#vis-parent");

  // Song grpah svg
  var svg = d3.select("#songGraph").append("svg")
      .attr("id", "song-graph-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

  // Graph contents
  var content = svg.append("g")
    .attr('id', 'song-graph-content')
    .attr('class','content')
    .attr("transform", translate(margin.left, margin.top))
    .attr('clip-path', 'url(#plotAreaClip)')

  content.append('clipPath')
    .attr('id', 'plotAreaClip')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

  // Axes
  var xAxis = svg.append("g")
    .attr("id", "song-graph-x-axis")
    .attr("class", "x axis")
    .attr("transform", translate(margin.left,margin.top))

  var yAxis = svg.append("g")
    .attr("id", "song-graph-y-axis")
    .attr("class", "y axis")
    .attr("transform", translate(margin.left,margin.top))

  // Tooltip
  tooltip = tip()
    .direction('e')
    .attr('class', 'd3-tip')
    .offset([80,0])
    .html(function(d){return tooltipLib.songGraphTooltip(d)});

  // Add tooltip
  svg.call(tooltip);

  // Set x/y domain
  x.domain([dateRange.endDate,dateRange.startDate])
  y.domain(allSongs)

  // Color scales
  var ukColor = d3.scaleLinear()
    .domain([1,100])
    .interpolate(d3.interpolateRgb)
    .range([d3.color(gradientPairs[0][0]), d3.color(gradientPairs[0][1])])

  var usColor = d3.scaleLinear()
    .domain([1,100])
    .interpolate(d3.interpolateRgb)
    .range([d3.color(gradientPairs[1][0]), d3.color(gradientPairs[1][1])])

  // Add axes
  var xAxis = d3.axisTop(x),
      yAxis = d3.axisLeft(y);

  d3.select('#song-graph-x-axis').call(xAxis);
  d3.select('#song-graph-y-axis').call(xAxis);

  var bases = content.selectAll(".base")
    .data(allSongs);

  // Add base between us/uk
  bases.exit().remove();
  bases.enter().append("rect")
    .attr("class", "base")
    .merge(bases)
      .attr("transform", function(d,i){
        return translate(0,(y(d)+boxHeight/2));
      })
      .attr("height", rectHeight/2)
      .attr("width", width)
      .attr("fill", "rgba(200,200,200,.2)");

  // Add bars
  createBars(ukData, ukColor, 'uk');
  createBars(usData, usColor, 'us');

  //add zoom function
  var zoom = d3.zoom()
        .scaleExtent([1,10])
        // .translateExtent([[-100, -100], [width + 90, height + 100]])
        .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed(){
    rects.attr("transform", d3.event.transform)
    xAxis.call(xAxis.scale(d3.event.transform.rescaleX(x)));
  }


  // add Spotify play button
  var playerWidth=640,playerHeight=180;

  // $('<iframe src="https://embed.spotify.com/?uri=spotify:track:5JunxkcjfCYcY7xJ29tLai" width="'+playerWidth+'" height="'+playerHeight+'" frameborder="0" allowtransparency="true"></iframe>').appendTo('body');


  // add us legend
  var legendWidth = 60, legendHeight = 200,
      legendMargin = {top: 20, left:20, bottom: 20, right:20 }

  addGradient(gradientPairs[1][0],gradientPairs[1][1],'usGradient');

  var legend = svg.append('g')
        .attr('class','legend')

  legend.append("rect")
    .attr("width", legendWidth - legendMargin.left - legendMargin.right)
    .attr("height", legendHeight - legendMargin.top-legendMargin.bottom)
    .style("fill", "url(#usGradient)")
    .attr("transform", translate(width+margin.left+legendMargin.left,margin.top));

  var gradientY = d3.scaleLinear()
    .range([legendHeight - legendMargin.top-legendMargin.bottom, 0])
    .domain([100, 0]);

  var gradientYAxis = d3.axisRight(gradientY);

  legend.append("g")
    .attr("class", "gradientYAxis")
    .attr("transform", translate(width+margin.left-legendMargin.right+legendWidth,margin.top))
    .call(gradientYAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 30).attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("US Ranking")
      .attr('fill', 'rgba(0,0,0,1)');



  // add uk legend

  var space = 50;

  addGradient(gradientPairs[0][0],gradientPairs[0][1],'ukGradient');


  legend.append("rect")
    .attr("width", legendWidth - legendMargin.left - legendMargin.right)
    .attr("height", legendHeight - legendMargin.top-legendMargin.bottom)
    .style("fill", "url(#ukGradient)")
    .attr("transform", translate(width+margin.left+legendMargin.left,margin.top+space+legendHeight));


  legend.append("g")
    .attr("class", "gradientYAxis")
    .attr("transform", translate(width+margin.left-legendMargin.right+legendWidth,margin.top+space+legendHeight))
    .call(gradientYAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 30).attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("UK Ranking")
      .attr('fill', 'rgba(0,0,0,1)');
}

function createBars(data, color, country) {
  if (country == 'uk') {
    var factor = 0.5;
  }
  else {
    var factor = -1.0
  }

  var groupsClass = country+'Groups',
      groupClass = country+'Group',
      barClass = country+'Bar';

  // Groups
  var groups = d3.select('#song-graph-content')
    .selectAll('.'+groupClass)
    .data(data);

  groups.enter().append("g")
    .attr("class", groupsClass)
    .merge(groups)
      .attr("transform", function(d,i){
        return translate(0,(y(d.key)+boxHeight/2+rectHeight*factor));
      })
  groups.exit().remove();

  // Bars
  var bars = d3.select('#song-graph-svg')
    .selectAll('.'+groupsClass)
    .selectAll('.'+barClass)
      .data(function(d){return d.values; });

  bars.enter().append("rect")
    .merge(bars)
      .attr('class',barClass)
      .attr("height", rectHeight)
      .attr("width", function(d){
        var thisWeek = new Date(d.chart_week);
        var nextWeek = new Date(d.chart_week);
        nextWeek.setDate(nextWeek.getDate()+7);

        return x(thisWeek)-x(nextWeek);

      })
      .attr("x", function(d){
        return x(new Date(d.chart_week));
      })
      .attr("fill", function(d){
          return color(d.rank);
      })
      .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide)
      .on('click',function(d){
        if(d.spotify_id){
          console.log(d)
          var src = 'https://embed.spotify.com/?uri='+d.spotify_id;
          $('iframe').attr('src',src);
        }
        else{
          alert('This song does not have a Spotify link');
        }
      });
  bars.exit().remove()
}

function translate(x,y){
  return "translate(" + x + "," + y + ")";
}

function addGradient(color1, color2, id){
  var gradient = d3.select('#song-graph-svg').append("defs")
    .append("linearGradient")
    .attr("id", id)
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", color1)
    .attr("stop-opacity", 1);

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", color2)
    .attr("stop-opacity", 1);
}

module.exports = {
  songGraph: songGraph
}
