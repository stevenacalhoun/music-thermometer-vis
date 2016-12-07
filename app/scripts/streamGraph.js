// JS toolkits
var d3 = require('d3'),
    apiCalls = require('./apiCalls.js'),
    tip = require('d3-tip'),
    $ = require('jQuery'),
    tooltipLib = require('./tooltip.js'),
    controls = require('./controls.js')
    utilities = require('./utilities.js'),
    constants = require('./constants.js');

// Css
require('../styles/streamGraph.scss');

// Constants
var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

// Global vars
var dateRange,
    xScale,
    yScale,
    tooltip,
    tipCircle,
    margin,
    width,
    containerHeight,
    height,
    currentTipArtist,
    currentTipDate,
    globalData;

function streamGraphInit(parent, earlyStartingDate, lateStartingDate, startingRank, startingMinTotal) {
  // Graph container
  var graphContainer = $("<div id='stream-graph-parent' class='stream-chart'></div>").appendTo(parent)

  // Add controls
  createControls(graphContainer, earlyStartingDate, lateStartingDate, startingRank, startingMinTotal);

  // Sizing
  margin = {top: 10, right: 40, bottom: 0, left: 150},
  width = document.body.clientWidth - margin.left - margin.right,
  containerHeight = window.innerHeight - $('#header').outerHeight() - $('#controls').outerHeight() - margin.top - margin.bottom,
  streamPadding = 40,
  height = (containerHeight/2) - (10) - streamPadding
  labelOffset = -100;

  // Main container
  var svg = d3.select("#stream-graph-parent").append("svg")
      .attr('id', 'stream-graph-svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", containerHeight+margin.top+margin.bottom)

  // Hover tooltip
  tooltip = tip()
      .attr('class', 'd3-tip')
      .attr('id', 'stream-tip')
      .html(function(d) {
        return tooltipLib.streamGraphTooltip(d.artist, d.count, 1, d.week);
      })
      .offset([-120,0]);

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
      .call(tooltip)
    .append("text")
      .text("US")
      .attr("class", "stream-label")
      .attr("transform", "translate("+labelOffset+","+(height/2 + 10)+")")

  d3.select("#stream-graph-svg")
    .append("g")
      .attr("id", "stream-graph-stream-uk")
      .attr("transform", "translate("+margin.left+","+(margin.top+height+(streamPadding*2))+")")
      .call(tooltip)
    .append("text")
      .attr("class", "stream-label")
      .text("UK")
      .attr("transform", "translate("+labelOffset+","+(height/2 + 10)+")")

  // Axes section
  svg.append("g")
      .attr("id", "x-axis")
      .attr("class", "x axis")
      .attr("transform", "translate("+margin.left/2+"," + (height+streamPadding) + ")")

  createStreamGraph(earlyStartingDate, lateStartingDate, startingRank, startingMinTotal)
}

// Create streamgraph for dates/rank
function createStreamGraph(start, end, rank, minTotal) {
  dateRange = {
    "startDate": start,
    "endDate": end
  }
  apiCalls.getChartRangeCountry('both', dateRange, function(data) {
    renderStreamGraph(data, 'body', minTotal);
  }, rank);
}

// Remove all of the streamgraph
function removeStreamGraph() {
  $('#stream-graph-parent').remove();
}

// Render a streamgraph
function renderStreamGraph(rawData, parent, minTotal) {
  // Prep data
  var preppedData = prepData(rawData, minTotal),
      combinedData = preppedData.us.concat(preppedData.uk);

  globalData = preppedData;

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
    .curve(d3.curveBasis)
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

  d3.selectAll("path")
    .on("click", function(d, i) {
      // Here's where we transition to the bar chart
      console.log(dateRange);
      console.log(d.key);
    })
}

// Render layers of streamgraph
function renderLayers(layersData, area, color, parent) {
  // Render layers from layer data with area function
  var layers = d3.select(parent)
    .selectAll("path")
    .data(layersData);

  layers.attr("class", "update");

  // Add new layers
  layers.enter().append("g")
    .attr('class', 'layer')
    .append("path")
    .merge(layers)
      .attr("class", "area")
      .style("fill", function(d, i) { return color(i); })
      .attr("d", area)

  // Remove old layers
  layers.exit().remove();
}

// Prep data for stream graph
function prepData(data, minTotal) {
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

  // Actual earliest and latest date
  var startDate = d3.min(data, function(d) {
    return new Date(d.chart_week);
  })
  var endDate = d3.max(data, function(d) {
    return new Date(d.chart_week);
  })

  // Create totals
  var returnData = {
    "us": createTotals(countrySplit.us, artists, startDate, endDate, minTotal),
    "uk": createTotals(countrySplit.uk, artists, startDate, endDate, minTotal),
    "artists": artists
  }

  // Taper off streams
  // Create a date a bit after the first/last date
  var preDate = new Date(startDate.getTime() - 40*(1000*60*60*24));
  // var postDate = new Date(endDate.getTime() + 40*(1000*60*60*24));
  console.log(startDate)
  console.log(preDate)

  // Create all 0s for each artist
  var preData = {};
  artists.forEach(d => {
    preData[d] = 0;
  })
  preData['key'] = preDate;

  // var postData = {};
  // artists.forEach(d => {
  //   postData[d] = 0;
  // })
  // postData['key'] = postDate;

  // Add to our data
  returnData.us.unshift(preData);
  returnData.uk.unshift(preData);

  // returnData.us.push(postData);
  // returnData.uk.push(postData);

  return returnData;
}

// Create totals
function createTotals(data, artists, startDate, endDate, minTotal) {

  var startDate = d3.min(data, function(d) {
    return new Date(d.chart_week);
  })

  var endDate = d3.max(data, function(d) {
    return new Date(d.chart_week);
  })

  var aggregateData = d3.nest()
    .key(function(d) {
      // month/year key
      var dateObj = new Date(d.chart_week);
      dateObj = new Date( dateObj.getTime() + ( dateObj.getTimezoneOffset() * 60000 ) );
      return utilities.createDateAggregateKey(startDate, endDate, dateObj)
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
          if (leaves.length > minTotal) {
            return leaves.length
          }
          else {
            return 0
          }
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
function addToolTip() {
  // Setup hover interaction
  d3.selectAll("path")
    .on("mouseover", function(d, i) {
      // Lower opacity of all layers but hovered 1
      d3.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(e, j) {
          if (e == d) {
            return 1;
          }
          return e.key != d.key ? 0.2 : 1;
      });

      // Get dateinfo and render tooltip
      var dateInfo = getMouseDate(d, this);
      renderTooltip(d, dateInfo);
    })
    .on("mousemove", function(d, i) {
      // Check if we've moved to a new artist/date
      var dateInfo = getMouseDate(d, this);
      if ((d.key != currentTipArtist) || (dateInfo.date != currentTipDate)) {
        // Get dateinfo and render tooltip
        renderTooltip(d, dateInfo);
      }
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

function renderTooltip(d, dateInfo) {
  var usValue = globalData.us[dateInfo.index][d.key];
      ukValue = globalData.uk[dateInfo.index][d.key];

  // Set up tool tip data
  tooltipData = {
    "us": usValue,
    "uk": ukValue,
    "artist": d.key,
    "week": monthNames[dateInfo.date.getMonth()] + ", " + dateInfo.date.getFullYear()
  }

  // Render tooltip
  tooltip.show(tooltipData, tipCircle.node());
  tooltipLib.addStreamgraphTooltipGraph(tooltipData);

  currentTipArtist = d.key;
  currentTipDate = dateInfo.date;
}

function getMouseDate(d, e) {
  // Find correct info
  var mouseDate = xScale.invert(d3.mouse(e)[0]);

  // Create date array (should be a better way)
  var datearray = [];
  for (var k = 0; k < d.length; k++) {
    date = new Date(d[k].data.key);
    datearray[k] = date.getFullYear() + "/" + date.getMonth();
  }

  // Get value at date
  var mouseDateIndex = datearray.indexOf(mouseDate.getFullYear() + "/" + mouseDate.getMonth());
  return {"index": mouseDateIndex, "date": mouseDate};
}

// Streamgraph controls
function createControls(parent, earlyStartingDate, lateStartingDate, startingRank, startingTotal) {
  var controlsContainer = $("<div id='controls' class='controls'></div>").appendTo(parent)

  // Add date slider
  controls.createSlider(controlsContainer, earlyStartingDate, lateStartingDate);

  // Add filter for min rank
  var rankInput = controls.createNumberInput("Min. Song Rank", 1, 100, startingRank, "min-rank-value");
  controlsContainer.append(rankInput);

  // Add filter for min total
  var totalInput = controls.createNumberInput("Min. Total Count", 1, 100, startingTotal, "min-total-value");
  controlsContainer.append(totalInput);

  // Add search bar
  var searchBar = controls.createSearchBar('stream-search');
  controlsContainer.append(searchBar);

  var button = controls.createButton("Update");
  button.on("click", function(){
    // Get slider selection
    var sliderSelection = d3.brushSelection(d3.select('#stream-graph-brush').node());

    // Invert slider dates
    var startDate = controls.reverseScale(sliderSelection[0]);
    var endDate = controls.reverseScale(sliderSelection[1]);

    // Create a new graph
    createStreamGraph(startDate, endDate, $('#min-rank-value').val());
  })

  controlsContainer.append(button);
}

module.exports = {
  streamGraphInit: streamGraphInit,
  createStreamGraph: createStreamGraph,
  removeStreamGraph: removeStreamGraph
}
