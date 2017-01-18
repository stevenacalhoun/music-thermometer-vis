var d3 = require('d3'),
    $ = require('jQuery'),
    tip = require('d3-tip'),
    tooltipLib = require('./tooltip.js'),
    colors = require('./colors.js'),
    utilities = require('./utilities.js'),
    constants = require('./constants.js');

require('../styles/songGraph.scss');
require('../styles/axes.scss');

var currentSong = '';

function songGraph(data, dateRange) {
  // Song graph size
  var margin =  { top: 0, right: 20, bottom: 0, left: 0 },
      width = document.body.clientWidth*0.5 - margin.right,
      height = window.innerHeight - $('#app-header').outerHeight();

  // Legend size
  var legendHeight = 60;

  // Axis size
  var axisHeight = 30;

  // Content size
  var contentHeight = height - legendHeight - axisHeight;

  // Scales
  var x = d3.scaleTime()
    .range([0,width-margin.right-margin.left-15])
    .domain([dateRange.startDate,dateRange.endDate])

  // Container
  var parent = $("<div id='song-graph-container' class='container' />").appendTo("#vis-parent");

  // Add each component
  addLegend(legendHeight, width);
  addContent(contentHeight, width, data, x);
  addAxis(axisHeight, width, x);
}

function addLegend(height, width) {
  // Container
  var container = $("<div />").appendTo("#song-graph-container");
  container.css("height", height);

  // Song graph svg
  var svg = d3.select(container.get(0)).append("svg")
    .attr("id", "song-graph-legend-svg")
    .attr("width", width)
    .attr("height", height)

  addGradientLegend('US', colors.usGradientPair, width);
  addGradientLegend('UK', colors.ukGradientPair, width);
}

function addGradientLegend(country, color, width){
  var textOffset = 2,
      padding = 50,
      barHeight = 15,
      barWidth = (width-(2*padding))/2,
      textPadding = 5;

  var gradientScale = d3.scaleLinear()
    .range([barWidth, 0])
    .domain([100, 1]);

  // Shift UK legends
  var xShift = country == 'UK' ? barWidth + padding + 3 : 3;

  // Add gradient defs
  var gradient = d3.select('#song-graph-legend-svg').append("defs")
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

  // SVG Container
  var svg = d3.select('#song-graph-legend-svg')
    .append("g")
    .attr("transform", utilities.translate(xShift,12.5))

  // Label
  svg.append("text")
    .attr("y", textOffset)
    .text(country+" Ranking")

  // Gradient
  svg.append("rect")
    .attr("width", barWidth)
    .attr("height", barHeight)
    .style("fill", "url(#"+country+"-gradient)")
    .attr("transform", utilities.translate(0, textOffset+textPadding))

  // Axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", utilities.translate(0, (barHeight+textOffset+textPadding)))
    .call(d3.axisBottom(gradientScale).tickSize(0).tickValues([1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]))
}

function addContent(height, width, data, x) {
  // Constants for each song section
  var rectHeight = 20,
      sectionPaddingTop = 15,
      labelPadding = 5,
      textHeight = 21.5,
      separatorHeight = 2,
      sectionSize = 80;

  // Calculate rect width
  var thisWeek = new Date(data[0].dates[0].chart_week),
      nextWeek = new Date(data[0].dates[0].chart_week);
  nextWeek.setDate(nextWeek.getDate()+7);
  var rectWidth = x(nextWeek)-x(thisWeek);

  // Height of svg
  var contentHeight = (data.length)*sectionSize

  // Container
  var container = $("<div class='song-graph-content' />").appendTo("#song-graph-container");
  container.css("height", height);

  // SVG element
  var svg = d3.select(container.get(0))
    .append("svg")
      .attr("height", contentHeight)
      .attr("width", width-15);

  var content = svg.append("g")
    .attr('class','content');

  // Tooltip
  var tooltip = tip()
    .direction('e')
    .attr('class', 'd3-tip')
    .offset([0,-240])
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

  // Song sections
  var songs = content.selectAll("g")
    .data(data).enter()
      .append("g")
        .attr("class", "song-section")
        .attr("transform", function(d,i) {
          return utilities.translate(0,(i*(rectHeight)*4));
        })

  // Add separator
  songs.append("rect")
    .attr("class", "base")
    .attr("height", separatorHeight)
    .attr("width", width)
    .attr("fill", colors.accentColor)
    .attr("transform", utilities.translate(0,sectionPaddingTop+rectHeight+labelPadding))

  // Song label
  songs.append("text")
    .text(function(d) { return d.title; })
    .attr("transform", utilities.translate(0, sectionPaddingTop))
    .attr('class', 'song-text');

  // Add entries
  songs.selectAll(".bar")
    .data(function(d) {
      var data = d.dates;
      data.forEach(function(e) {
        e.album_art_link = d.album_art_link;
        e.title = d.title;
        e.artist = d.artist;
        e.preview_url = d.preview_url;
      })
      return data;
    }).enter()
    .append("rect")
      .attr("class", "bar")
      .attr("height", rectHeight)
      .attr("transform", utilities.translate(0,sectionPaddingTop))
      .attr("width", rectWidth)
      .attr("x", function(d){
        return x(new Date(d.chart_week));
      })
      .attr("y", function(d){
        if (d.country == "uk") {
          return rectHeight+separatorHeight+labelPadding;
        }
        else {
          return labelPadding;
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

}

function addAxis(height, width, x) {
  // Container
  var container = $("<div />").appendTo("#song-graph-container");

  // SVG element
  var svg = d3.select(container.get(0)).append("svg")
    .attr("width", width)
    .attr("height", height)

  // Axes
  var xAxis = svg.append("g")
    .attr("class", "x axis")
    .call(d3.axisBottom(x))
}

module.exports = {
  songGraph: songGraph
}
