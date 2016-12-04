// JS toolkits
var d3 = require('d3'),
    apiCalls = require('./apiCalls.js'),
    tip = require('d3-tip'),
    $ = require('jQuery'),
    utils = require('./utilities.js'),
    constants = require('./constants.js');

// Css
require('../styles/streamGraph.scss');

// Constants
var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

// Global vars
var startDate,
    endDate,
    xScale,
    yScale,
    tooltip,
    tipCircle,
    margin,
    width,
    containerHeight,
    height;

function streamGraphInit(parent) {
  // Graph container
  var graphContainer = $("<div id='stream-graph-parent' class='stream-chart'></div>").appendTo(parent)

  // Add controls
  createControls(graphContainer);

  // Sizing
  margin = {top: 10, right: 40, bottom: 0, left: 40},
  width = document.body.clientWidth - margin.left - margin.right,
  containerHeight = window.innerHeight - $('#controls').height() - margin.top - margin.bottom,
  streamPadding = 40,
  height = (containerHeight/2) - (10) - streamPadding;

  // Main container
  var svg = d3.select("#stream-graph-parent").append("svg")
      .attr('id', 'stream-graph-svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", containerHeight+margin.top+margin.bottom)

  // Hover tooltip
  tooltip = tip()
      .attr('class', 'd3-tip')
      .html(function(d) {
        return tooltipHtml(d.artist, d.count, d.week);
      })
      .offset([-10,0]);

  // Hidden circle for tooltip on mouse
  tipCircle = svg.append("circle")
      .attr('id', 'tip-circle');

  // Move circle to mouse
  svg.on('mousemove', function(d,i) {
    tipCircle.attr('cx', d3.mouse(this)[0])
      .attr('cy', d3.mouse(this)[1]);
  })

  // Layer group for us and uk streams
  d3.select("#stream-graph-svg")
    .append("g")
      .attr("id", "stream-graph-stream-us")
      .attr("transform", "translate("+margin.left+","+margin.top+")")
      .call(tooltip);
  d3.select("#stream-graph-svg")
    .append("g")
      .attr("id", "stream-graph-stream-uk")
      .attr("transform", "translate("+margin.left+","+(margin.top+height+(streamPadding*2))+")")
      .call(tooltip);

  // Axes section
  svg.append("g")
      .attr("id", "x-axis")
      .attr("class", "x axis")
      .attr("transform", "translate("+margin.left/2+"," + (height+streamPadding) + ")")
}

// Create streamgraph for dates/rank
function createStreamGraph(start, end, rank) {
  var dateRange = {
    "startDate": start,
    "endDate": end
  }
  apiCalls.getChartRangeCountry('both', dateRange, function(data) {
    renderStreamGraph(data, 'body');
  }, rank);
}

// Remove all of the streamgraph
function removeStreamGraph() {
  $('#stream-graph-parent').remove();
}

// Render a streamgraph
function renderStreamGraph(rawData, parent) {
  // Prep data
  var preppedData = prepData(rawData),
      combinedData = preppedData.us.concat(preppedData.uk);

  // Stack
  var stack = d3.stack()
      .keys(preppedData.artists)
      .offset(d3.stackOffsetSilhouette);

  // Create layered data from stack
  var layers = stack(combinedData);

  // Scales x & y
  xScale = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(combinedData, function(d) {
      var dateObj = new Date(d.key);
      dateObj = new Date( dateObj.getTime() + ( dateObj.getTimezoneOffset() * 60000 ) );
      return dateObj;
    }));

  // Update axis
  d3.select("#x-axis")
    .call(d3.axisBottom().scale(xScale))

  yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([
      d3.min(layers, function(layer) {
        return d3.min(layer, function(d) {
          return d[1];
        })
      }),
      d3.max(layers, function(layer) {
        return d3.max(layer, function(d) {
          return d[1];
        })
      })
    ]);

  // Area function
  var area = d3.area()
    .curve(d3.curveNatural)
    .x(function(d) {
      dateObj = new Date(d.data.key);
      return xScale(dateObj);
    })
    .y0(function(d) {
      return yScale(d[0]);
    })
    .y1(function(d) {
      return yScale(d[1]);
    });

  // Render layers for us and uk
  renderLayers(stack(preppedData.us), area, d3.scaleOrdinal(constants.streamColors1), '#stream-graph-stream-us');
  renderLayers(stack(preppedData.uk), area, d3.scaleOrdinal(constants.streamColors2), '#stream-graph-stream-uk');

  // Add in tooltip interaction
  addToolTip();
 }

// Render layers of streamgraph
function renderLayers(layersData, area, color, parent) {
  // Render layers from layer data with area function
  var layers = d3.select(parent)
    .selectAll("path")
    .data(layersData);

  // Add new layers
  layers.enter().append("g")
    .attr('class', 'layer')
    .append("path")
      .attr("class", "area")
    .merge(layers)
      .style("fill", function(d, i) { return color(i); })
      .attr("d", area)


  // Remove old layers
  layers.exit().remove();
}

// Prep data for stream graph
function prepData(data) {
  // Aggregate weeks into months
  var artists = [];
  var i = 0;

  // Keep up with all artists
  data.forEach(function(d){
    if ($.inArray(d.artist, artists) == -1) {
      artists.push(d.artist);
    }
  })

  // Split up data
  var countrySplit = {
    "us": data.filter(function(d) {if (d.country == 'us') return d;}),
    "uk": data.filter(function(d) {if (d.country == 'uk') return d;})
  }

  // Create totals
  var returnData = {
    "us": createTotals(countrySplit.us, artists),
    "uk": createTotals(countrySplit.uk, artists),
    "artists": artists
  }

  return returnData;
}

// Create totals
function createTotals(data, artists) {
  var aggregateData = d3.nest()
    .key(function(d) {
      // month/year key
      var dateObj = new Date(d.chart_week);
      dateObj = new Date( dateObj.getTime() + ( dateObj.getTimezoneOffset() * 60000 ) );
      var dateKey = new Date(dateObj.getFullYear(), dateObj.getMonth()-1, 1);
      return dateKey;
    })
    .rollup(function(leaves) {
      // Combine all artist data into one long list
      artistData = [];
      leaves.forEach(function(leaf) {
        artistData.push(leaf.artist);
      });

      // Reduce artist data
      var nestedLeaves = d3.nest()
        .key(function(d) {
          return d
        })
        .rollup(function(leaves) {
          return leaves.length
        })
        .entries(artistData)

      var artistDict = {};
      nestedLeaves.forEach(function(d) {
        artistDict[d.key] = d.value;
      });

      return artistDict
    })
    .entries(data)

  var aggregateDatanew = [];
  aggregateData.forEach(function(d) {
    var dict = {
      "key": d.key
    }
    $.extend(dict, d.value);

    aggregateDatanew.push(dict);
  });

  // Sort by date
  aggregateDatanew.sort(function(a,b) {
    if (new Date(a.key) < new Date(b.key)) {
      return -1;
    }
    else {
      return 1;
    }
  })

  // Add artists that aren't in data yet as 0
  aggregateDatanew.forEach(function(dateEntry) {
    artists.forEach(function(artist){
      if ((artist in dateEntry) == false) {
        dateEntry[artist] = 0;
      }
    })
  })

  return aggregateDatanew;
}

// Tooltips
function tooltipHtml(artist, count, week) {
  var container = $('<div class="tooltip-container"></div>');
  container.append('<div class="week">'+week+'</div>');
  container.append('<div class="artist_count">'+artist+': '+count+'</div>');
  return container.html();
}
function addToolTip() {
  // Setup hover interaction
  d3.selectAll(".layer")
    .on("mouseover", function(d, i) {
      // Lower opacity of all layers but hovered 1
      d3.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(e, j) {
          return e.key != d.key ? 0.2 : 1;
      });

      // Find correct info
      var mouseDate = xScale.invert(d3.mouse(this)[0]);

      // Create date array (should be a better way)
      datearray = [];
      for (var k = 0; k < d.length; k++) {
        date = new Date(d[k].data.key);
        datearray[k] = date.getFullYear() + "/" + date.getMonth();
      }

      // Get value at date
      mouseDateIndex = datearray.indexOf(mouseDate.getFullYear() + "/" + mouseDate.getMonth());
      value = d[mouseDateIndex][1] - d[mouseDateIndex][0];

      tooltipData = {
        "count": value,
        "artist": d.key,
        "week": monthNames[mouseDate.getMonth()] + ", " + mouseDate.getFullYear()
      }
      tooltip.show(tooltipData, tipCircle.node());
    })
    .on("mouseout", function(d, i) {
      // All layers back to full opacity
      tooltip.hide(d);
      d3.selectAll(".layer")
        .transition()
        .duration(250)
        .attr("opacity", "1");
    })
}

// Streamgraph controls
function createControls(parent) {
  var controlsContainer = $("<div id='controls' class='controls'></div>").appendTo(parent)

  // Add date slider
  createSlider(controlsContainer);
  createRankFilter(controlsContainer);
  createApplyButton(controlsContainer);
}

function createApplyButton(parent) {
  var button = $("<div class='button' id='filter-button'>Filter</div>").appendTo(parent);
  button.on("click", function(){
    createStreamGraph(startDate, endDate, $('#rank-value').val());
  })
}

function createRankFilter(parent) {
  var input = $("<input class='rank-input' id='rank-value' type='number' name='rank' min='1' max='100'>").appendTo(parent)
}

function createSlider(parent) {
  var sliderContainer = $("<div id='slider-parent' class='slider'></div>").appendTo(parent)

  // Sizes
  var margin = {top: 10, right: 40, bottom: 20, left: 40},
      width = (document.body.clientWidth/2) - margin.left - margin.right,
      height = 50 - margin.top - margin.bottom;

  // Scale
  var xScale = d3.scaleTime()
    .domain([new Date(1960,0,1), new Date(2015,12,31)])
    .rangeRound([0, width]);

  // Axis object
  var xAxis = d3.axisBottom(xScale)
    .tickSize(-height)
    .tickFormat(function() { return null; });

  // Brush object
  var brush = d3.brushX()
    .extent([[0,0], [width,height]])
    .on("brush", function() {
      brushed(xScale)
    })

  // Main container
  var svg = d3.select('#'+sliderContainer.attr("id")).append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate("+margin.left+","+margin.top+")");

  // Axis at bottom
  svg.append("g")
      .attr("class", "axis axis--grid")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

  // Visual bar
  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)
        .tickPadding(0))
      .attr("text-anchor", null)
    .selectAll("text")
      .attr("x", 6);

  // Append bursh
  svg.append("g")
    .attr("class", "brush")
    .call(brush);
}

function brushed(xScale) {
  // Code to change when brushed
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
  var s = d3.event.selection;
  startDate = xScale.invert(s[0]);
  endDate = xScale.invert(s[1]);
};

module.exports = {
  streamGraphInit: streamGraphInit,
  createStreamGraph: createStreamGraph,
  removeStreamGraph: removeStreamGraph
}
