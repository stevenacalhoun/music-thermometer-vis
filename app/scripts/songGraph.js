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

var minimumRectHeight = 20,
    maximumRectHeight = 50;

var currentSong = '';

function songGraph(data, passedDateRange) {
  dateRange = passedDateRange;

  // Sizing
  var cWidth = document.body.clientWidth;
  margin =  { top: 50, right: 10, bottom: 50, left: 10 };

  var width = document.body.clientWidth*0.5 - margin.left - margin.right,
      height = window.innerHeight - $('#app-header').outerHeight() - margin.top - margin.bottom;

  legendWidth = width-margin.right;
  legendHeight = 50;
  legendMargin = {top: 20, left:20, bottom: 20, right:20 };
  totalLegendHeight =  legendHeight + legendMargin.top + legendMargin.bottom;

  var contentHeight = height - legendHeight;
  var contentWidth = width - margin.right;

  var xAxisShift = contentHeight;

  rectHeight = contentHeight/data.length;
  var separatorHeight = 2;

  // Rect height bounds
  if (rectHeight<minimumRectHeight) {
    rectHeight = minimumRectHeight;
  }
  else if (rectHeight>maximumRectHeight) {
    rectHeight = maximumRectHeight;
  }

  // Scales
  x = d3.scaleTime()
    .range([0,contentWidth])
    .domain([dateRange.startDate,dateRange.endDate])

  // Container
  $("<div id='song-graph-parent-container' class='song-graph'></div>").appendTo("#vis-parent");

  // var zoom = d3.zoom()
  //     .on("zoom", zoomed);

  // Song graph svg
  var svg = d3.select("#song-graph-parent-container").append("svg")
      .attr("id", "song-graph-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

  // Graph contents
  var parent = svg.append("g")
    .attr('id', 'song-graph-parent')
    .attr("transform", utilities.translate(margin.left, totalLegendHeight))
    .on('scroll', function() {
      console.log("heyo")
    })

  var content = parent.append("g")
    .attr('id', 'song-graph-content')
    .attr('class','content')
    .attr("transform", utilities.translate(margin.left,0))

  // Axes
  var xAxis = parent.append("g")
    .attr("id", "song-graph-x-axis")
    .attr("class", "x axis")
    .attr("transform", utilities.translate(margin.left,contentHeight))

  // Tooltip
  tooltip = tip()
    .direction('e')
    .attr('class', 'd3-tip')
    .offset([-100,-325])
    .html(function(d){return tooltipLib.songGraphTooltip(d)});

  // Add tooltip
  svg.call(tooltip);

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
  var xAxis = d3.axisBottom(x);
  d3.select('#song-graph-x-axis').call(xAxis);

  // Song sections
  var songs = d3.select('#song-graph-content')
      .selectAll("g")
    .data(data).enter()
      .append("g")
        .attr("class", "song-section")
        .attr("transform", function(d,i) {
          return utilities.translate(0,i*rectHeight*3);
        })

  // Add separator
  songs.append("rect")
    .attr("class", "base")
    .attr("height", separatorHeight)
    .attr("width", contentWidth)
    .attr("fill", colors.accentColor)
    .attr("transform", utilities.translate(0,rectHeight))

  // Add entries
  songs.selectAll(".bar")
    .data(function(d) { return d.dates }).enter()
    .append("rect")
      .attr("class", "bar")
      .attr("height", rectHeight)
      .attr("width", rectHeight)
      .attr("width", function(d){
        var thisWeek = new Date(d.chart_week),
            nextWeek = new Date(d.chart_week);
        nextWeek.setDate(nextWeek.getDate()+7);

        return x(nextWeek)-x(thisWeek);

      })
      .attr("x", function(d){
        return x(new Date(d.chart_week));
      })
      .attr("y", function(d){
        if (d.country == "uk") {
          return rectHeight+separatorHeight;
        }
      })
      .attr("fill", function(d){
        if (d.country == "uk") {
          return ukColor(d.rank);
        }
        else {
          return usColor(d.rank);
        }
      })

  createLegend();
}

function scroll() {
  console.log('heyo')
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
