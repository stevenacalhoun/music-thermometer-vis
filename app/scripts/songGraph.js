var d3 = require('d3'),
    $ = require('jQuery'),
    tip = require('d3-tip'),
    tooltipLib = require('./tooltip.js'),
    colors = require('./colors.js'),
    utilities = require('./utilities.js'),
    constants = require('./constants.js');

require('../styles/songGraph.scss');
require('../styles/axes.scss');

var x, y, tooltip, margin, legendWidth, legendHeight, legendMargin, dateRange;

var minimumRectHeight = 20;

var currentSong = '';

var boxHeight = 50
    rectHeight = 15;

function songGraph(data, passedDateRange) {
  dateRange = passedDateRange;
  // process data
  var ukData = [],
      usData = [];

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

  // Sizing
  var cWidth = document.body.clientWidth;
  // margin =  { top: cWidth*0.05, right: cWidth*0.05, bottom: cWidth*0.1, left: cWidth*0.1 };
  margin =  { top: 50, right: 50, bottom: 50, left: 50 };

  var width = document.body.clientWidth*0.5 - margin.left - margin.right,
      height = window.innerHeight - $('#app-header').outerHeight() - margin.top - margin.bottom;

  legendWidth = width-margin.right;
  legendHeight = 50;
  legendMargin = {top: 20, left:20, bottom: 20, right:20 };
  totalLegendHeight =  legendHeight + legendMargin.top + legendMargin.bottom;

  var contentHeight = height - legendHeight;
  var contentWidth = width - margin.right;

  var xAxisShift = contentHeight;

  rectHeight = contentHeight/allSongs.length/3;

  if (rectHeight<minimumRectHeight) {
    // rectHeight = minimumRectHeight;
  }

  // Scales
  x = d3.scaleTime()
    .range([0,contentWidth])
    .domain([dateRange.startDate,dateRange.endDate])

  y = d3.scaleBand()
    .rangeRound([0,contentHeight])
    .domain(allSongs)

  // Container
  $("<div id='song-graph-parent-container' class='song-graph'></div>").appendTo("#vis-parent");

  // Song grpah svg
  var svg = d3.select("#song-graph-parent-container").append("svg")
      .attr("id", "song-graph-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

  // Graph contents
  var parent = svg.append("g")
    .attr('id', 'song-graph-parent')
    .attr("transform", utilities.translate(margin.left, totalLegendHeight));

  var content = parent.append("g")
    .attr('id', 'song-graph-content')
    .attr('class','content')
    .attr('width', contentWidth)
    .attr('height', contentHeight)
    .attr("transform", utilities.translate(margin.left,0))
    .attr('clip-path', 'url(#plotAreaClip)')

  content.append('clipPath')
    .attr('id', 'plotAreaClip')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

  // Axes
  var xAxis = parent.append("g")
    .attr("id", "song-graph-x-axis")
    .attr("class", "x axis")
    .attr("transform", utilities.translate(margin.left,contentHeight))

  var yAxis = parent.append("g")
    .attr("id", "song-graph-y-axis")
    .attr("class", "transparent y axis")
    .attr("transform", utilities.translate(margin.left,-rectHeight/4))

  // Tooltip
  tooltip = tip()
    .direction('e')
    .attr('class', 'd3-tip')
    .offset([-100,-325])
    .html(function(d){return tooltipLib.songGraphTooltip(d)});

  // Add tooltip
  svg.call(tooltip);

  // Set x/y domain

  // Color scales
  var ukColor = d3.scaleLinear()
    .domain([1,100])
    .interpolate(d3.interpolateRgb)
    .range([d3.color(colors.ukGradientPair[0]), d3.color(colors.ukGradientPair[1])])

  var usColor = d3.scaleLinear()
    .domain([1,100])
    .interpolate(d3.interpolateRgb)
    .range([d3.color(colors.usGradientPair[0]), d3.color(colors.usGradientPair[1])])

  // Add axes
  var xAxis = d3.axisBottom(x),
      yAxis = d3.axisLeft(y).tickSize(0);

  d3.select('#song-graph-x-axis').call(xAxis);
  d3.select('#song-graph-y-axis').call(yAxis);

  var bases = content.selectAll(".base")
    .data(allSongs);

  // Add base between us/uk
  bases.exit().remove();
  bases.enter().append("rect")
    .attr("class", "base")
    .merge(bases)
      .attr("transform", function(d,i){
        return utilities.translate(0,(y(d)+rectHeight));
      })
      .attr("height", rectHeight/2)
      .attr("width", contentWidth)
      .attr("fill", "rgba(200,200,200,.2)");

  // Add bars
  createBars(usData, usColor, 'us');
  createBars(ukData, ukColor, 'uk');

  createLegend();
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
        return utilities.translate(0,(y(d.key)+(rectHeight)+(rectHeight*factor)));
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
        var thisWeek = new Date(d.chart_week),
            nextWeek = new Date(d.chart_week);
        nextWeek.setDate(nextWeek.getDate()+7);

        return x(nextWeek)-x(thisWeek);

      })
      .attr("x", function(d){
        return x(new Date(d.chart_week));
      })
      .attr("fill", function(d){
        return color(d.rank);
      })
      .on('mouseover',  function(d) {
        // Show tooltip
        tooltip.show(d);

        if ((d.preview_url != null) && (d.preview_url != currentSong)){
          currentSong = d.preview_url;
          // Add track and play
          $('#audio-box-parent').append($("<audio controls id='audio-control'></audio>"));
          $("#audio-control").append($("<source id='audio-track' src='"+d.preview_url+"' type='audio/mpeg'>"))
          $("#audio-control")[$("#audio-control").length-1].play();
        }
      })
      .on('mouseout', function() {
        // Hide tooltip
        tooltip.hide();

        currentSong = '';

        // Pause audio
        $("#audio-control")[0].pause();

        // Clear track
        $('#audio-control').remove();
        $('#audio-track').remove();
      })
      .on('click',function(d){
        if(d.spotify_id){
          var src = 'https://embed.spotify.com/?uri='+d.spotify_id;
          $('iframe').attr('src',src);
        }
        else{
          alert('This song does not have a Spotify link');
        }
      });
  bars.exit().remove()
}

function createLegend() {
  // add us legend
  var gradientBarWidth = legendWidth/2,
      gradientBarHeight = legendHeight - legendMargin.top-legendMargin.bottom;

  // Add legend
  var legend = d3.select('#song-graph-svg')
    .append('g')
      .attr('id', 'song-graph-legend')
      .attr("transform", utilities.translate(margin.left,margin.top));

  var gradientY = d3.scaleLinear()
    .range([gradientBarWidth, 0])
    .domain([100, 1]);

  addGradientLegend('US', gradientBarWidth, gradientBarHeight, gradientY, colors.usGradientPair);
  addGradientLegend('UK', gradientBarWidth, gradientBarHeight, gradientY, colors.ukGradientPair);
}

function addGradientLegend(country, barWidth, barHeight, gradientY, color){
  if (country == 'UK') {
    var xShift = barWidth*1.1;
  }
  else {
    var xShift =0;
  }

  // Add gradient
  var gradient = d3.select('#song-graph-svg').append("defs")
    .append("linearGradient")
      .attr("id", country+"-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", color[0])
    .attr("stop-opacity", 1);

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", color[1])
    .attr("stop-opacity", 1);


  var legendBar = d3.select('#song-graph-legend')
    .append("g")
    .attr("transform", utilities.translate(xShift,0))

  legendBar.append("rect")
    .attr("width", barWidth)
    .attr("height", barHeight)
    .style("fill", "url(#"+country+"-gradient)")

  legendBar.append("g")
    .attr("class", "x axis")
    .attr("transform", utilities.translate(0, barHeight))
    .call(d3.axisBottom(gradientY).tickSize(0))
    .append("text")
      .attr("y", -18)
      .attr("x", 55)
      .style("text-anchor", "end")
      .text(country+" Ranking")
}

module.exports = {
  songGraph: songGraph
}
