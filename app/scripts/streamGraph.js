var d3 = require('d3'),
    apiCalls = require('./apiCalls.js'),
    tip = require('d3-tip'),
    $ = require('jQuery'),
    constants = require('./constants.js');

require('../styles/streamGraph.scss');
var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
var startDate;
var endDate;

function displayStreamGraph(start, end, rank) {
  var dateRange = {
    "startDate": start,
    "endDate": end
  }
  apiCalls.getChartRangeCountry('both', dateRange, function(data) {
    streamGraph(data, 'body');
  }, rank);
}

function streamGraphInit(parent) {
  // Graph container
  var graphContainer = $("<div id='stream-graph-parent' class='stream-chart'></div>").appendTo(parent)

  // Add controls
  createControls(graphContainer);

  // Sizing
  var margin = {top: 10, right: 40, bottom: 0, left: 40},
      width = document.body.clientWidth - margin.left - margin.right,
      containerHeight = window.innerHeight - $('#slider-parent').height(),
      height = (containerHeight/2);

  // Main container
  var svg = d3.select("#stream-graph-parent").append("svg")
      .attr('id', 'stream-graph-svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", containerHeight)

  // Hover tooltip
  var tooltip = tip()
      .attr('class', 'd3-tip')
      .html(function(d) {
        return tooltipHtml(d.artist, d.count, d.week);
      })
      .offset([-10,0]);


  // Hidden circle for tooltip on mouse
  var tipCircle = svg.append("circle")
      .attr('id', 'tip-circle');

  // Layer group for us and uk streams
  d3.select("#stream-graph-svg")
    .append("g")
      .attr("id", "stream-graph-stream-us")
      .attr("transform", "translate("+margin.left+","+margin.top+")")
      .call(tooltip);
  d3.select("#stream-graph-svg")
    .append("g")
      .attr("id", "stream-graph-stream-uk")
      .attr("transform", "translate("+margin.left+","+(margin.top+height)+")")
      .call(tooltip);

  // Axes section
  svg.append("g")
      .attr("id", "x-axis")
      .attr("class", "x axis")
      .attr("transform", "translate("+margin.left/2+"," + height + ")")

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
      var mouseDate = x.invert(d3.mouse(this)[0]);

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

  svg.on('mousemove', function(d,i) {
    // Move circle to mouse
    tipCircle.attr('cx', d3.mouse(this)[0])
      .attr('cy', d3.mouse(this)[1]);
  })
}

function streamGraph(rawData, parent) {
  // Split up data
  var countrySplit = {
    "us": rawData.filter(function(d) {if (d.country == 'us') return d;}),
    "uk": rawData.filter(function(d) {if (d.country == 'uk') return d;})
  }

  // Prep data
  var usData = aggregateData(countrySplit.us),
      ukData = aggregateData(countrySplit.uk)
      combinedData = usData.data.concat(ukData.data)
      combinedArtists = usData.artists.concat(ukData.artists);

  // Stack
  var stack = d3.stack()
      .keys(combinedArtists)
      .offset(d3.stackOffsetSilhouette);

  // Create layered data from stack
  var layers = stack(combinedData);

  // Sizing
  var margin = {top: 10, right: 40, bottom: 0, left: 40},
      width = document.body.clientWidth - margin.left - margin.right,
      containerHeight = window.innerHeight - $('#slider-parent').height(),
      height = (containerHeight/2);

  // Scales: x, y, color
  var x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(usData.data, function(d) {
      var dateObj = new Date(d.key);
      dateObj = new Date( dateObj.getTime() + ( dateObj.getTimezoneOffset() * 60000 ) );
      return dateObj;
    }));

  var y = d3.scaleLinear()
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

  // Time axis
  d3.select("#x-axis")
    .call(d3.axisBottom().scale(x))

  // Area function
  var area = d3.area()
    .curve(d3.curveNatural)
    .x(function(d) {
      dateObj = new Date(d.data.key);
      return x(dateObj);
    })
    .y0(function(d) {
      return y(d[0]);
    })
    .y1(function(d) {
      return y(d[1]);
    });

  renderLayers(usData, area, constants.streamColors1, 'us');
  renderLayers(ukData, area, constants.streamColors2, 'uk');
 }

function renderLayers(data, area, colorOptions, country) {
  // Stack
  var stack = d3.stack()
    .keys(data.artists)
    .offset(d3.stackOffsetSilhouette);

  // Layer data and creat colors
  var layersData = stack(data.data),
      color = d3.scaleOrdinal(colorOptions);

  // Render layers from layer data with area function
  var layers = d3.select("#stream-graph-stream-"+country)
    .selectAll(".layer")
    .data(layersData);

  // Add new layers
  layers.enter().append("g")
    .attr('class', 'layer')
    .append("path")
      .attr("class", "area")
      .style("fill", function(d, i) { return color(i); })
      .attr("d", area)
    .merge(layers)

  // Remove old layers
  layers.exit().remove();
}

// This is function is nasty, could likely be improved/sped up
function aggregateData(data) {
  // Aggregate weeks into months
  var artists = [];
  var i = 0;

  // Keep up with all artists
  data.forEach(function(d){
    if ($.inArray(d.artist, artists) == -1) {
      artists.push(d.artist);
    }
  })

  data.forEach(function(d){
    if ($.inArray(d.artist, artists) == -1) {
      artists.push(d.artist);
    }
  })

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

  return {
    "data": aggregateDatanew,
    "artists": artists
  };
}

function tooltipHtml(artist, count, week) {
  var container = $('<div class="tooltip-container"></div>');
  container.append('<div class="week">'+week+'</div>');
  container.append('<div class="artist_count">'+artist+': '+count+'</div>');
  return container.html();
}

function createControls(parent) {
  var controlsContainer = $("<div id='controls' class='controls'></div>").appendTo(parent)

  // Add date slider
  createSlider(controlsContainer);
  createApplyButton(controlsContainer);
}

function createApplyButton(parent) {
  var button = $("<div class='button' id='filter-button'>Filter</div>").appendTo(parent);
  button.on("click", function(){
    displayStreamGraph(startDate, endDate, 10);
  })
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
  displayStreamGraph: displayStreamGraph
}
