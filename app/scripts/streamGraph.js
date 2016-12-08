// JS Libraries
var d3 = require('d3'),
    tip = require('d3-tip'),
    spin = require('spin'),
    $ = require('jQuery');

// Other JS files
var tooltipLib = require('./tooltip.js'),
    apiCalls = require('./apiCalls.js'),
    controls = require('./controls.js'),
    utilities = require('./utilities.js'),
    colors = require('./colors.js'),
    songGraph = require('./songGraph.js'),
    constants = require('./constants.js');

// Css
require('../styles/streamGraph.scss');
require('../styles/axes.scss');

// Global vars
var xScale,
    yScale,
    axisYScale,
    tooltip,
    currentTipArtist,
    currentTipDate,
    dateRange,
    globalData;

//******************************************************************************
// Public functions
//******************************************************************************
function initVis() {
  $('#stream-search').on('input', function(d) {
    filterAndRerender($('#stream-search').val());
  })

  // Graph container
  var visContainer = $("<div id='vis-parent' class='vis-parent'></div>").appendTo('body');
  var streamParent = $("<div id='stream-graph-parent' class='stream-chart'></div>").appendTo(visContainer);

  // Hover tooltip
  tooltip = tip()
      .attr('class', 'd3-tip')
      .attr('id', 'stream-tip')
      .html(function(d) {
        return tooltipLib.streamGraphTooltip(d.artist, d.count, 1, d.week);
      })
      .offset([-120,0]);
}
function streamGraphInit(startDate, endDate, minRank, minTotal, halfMode, dataLoaded) {
  // Sizing
  var margin = {top: 10, right: 20, bottom: 0, left: 150};
      streamPadding = 30,
      containerHeight = window.innerHeight - $('#app-header').outerHeight() - margin.top - margin.bottom,
      axisHeight = 10,
      height = (containerHeight/2) - axisHeight - streamPadding,
      labelOffset = 50,
      width = document.body.clientWidth - margin.left - margin.right;

  if (halfMode) {
    width = (document.body.clientWidth/2) - margin.left - margin.right;
  }

  var streamWidth = width - labelOffset;

  $("#stream-graph-svg").remove();

  var svg = d3.select("#stream-graph-parent")
    .append("svg")
      .attr('id', 'stream-graph-svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", containerHeight+margin.top+margin.bottom)

  // Hidden circle for tooltip on mouse
  var tipCircle = svg.append("circle")
    .attr('id', 'tip-circle')
    .attr('class', 'tip-circle');

  // Move circle to mouse
  svg.on('mousemove', function(d,i) {
    tipCircle.attr('cx', d3.mouse(this)[0])
      .attr('cy', d3.mouse(this)[1]);
  })

  // Layer group for us and uk streams
  d3.select("#stream-graph-svg")
    .append("g")
      .attr("id", "stream-graph-us")
      .attr("transform", "translate(0,"+margin.top+")")
      .append("g")
        .attr("id", "stream-graph-stream-us")
        .attr("transform", "translate("+margin.left+",0)")
        .call(tooltip)

  d3.select("#stream-graph-svg")
    .append("g")
      .attr("id", "stream-graph-uk")
      .attr("transform", "translate(0,"+(margin.top+height+(streamPadding*2))+")")
    .append("g")
      .attr("id", "stream-graph-stream-uk")
      .attr("transform", "translate("+margin.left+",0)")
      .call(tooltip)

  // Stream labels
  d3.select("#stream-graph-us")
    .append("g")
      .attr("transform", "translate("+(labelOffset)+","+(8+height/2)+")")
      .append("text")
        .text("US")
        .attr("class", "stream-label")

  d3.select("#stream-graph-uk")
    .append("g")
      .attr("transform", "translate("+(labelOffset)+","+(8+height/2)+")")
      .append("text")
        .text("UK")
        .attr("class", "stream-label")

  // Axes section
  svg.append("g")
      .attr("id", "x-axis")
      .attr("class", "x axis")
      .attr("transform", "translate("+margin.left+"," + (height+streamPadding) + ")")

  svg.append("g")
      .attr("id", "y-axis-top")
      .attr("class", "y axis")
      .attr("transform", "translate("+(width+margin.left-labelOffset)+"," + (margin.top) + ")")

  svg.append("g")
      .attr("id", "y-axis-bot")
      .attr("class", "y axis")
      .attr("transform", "translate("+(width+margin.left-labelOffset)+"," + (margin.top+height+(streamPadding*2)) + ")")

  // x/y Scales
  xScale = d3.scaleTime()
    .range([0, streamWidth])

  yScale = d3.scaleLinear()
    .range([height, 0])

  axisYScale = d3.scaleLinear()
    .range([height, 0])

  // Pull data and create stream
  // renderStreamGraph(globalData);
  createStreamGraph(startDate, endDate, minRank, minTotal, dataLoaded)
}

// Create streamgraph
function createStreamGraph(startDate, endDate, rank, minTotal, dataLoaded) {
  dateRange = {
    "startDate": startDate,
    "endDate": endDate
  }

  var spinnerOptions = {
    className: 'spinner',
    color: "#39B54A",
    top: '50%',
    left: '50%',
    trail: 60,
    lines: 10,
    length: 6,
    radius: 12,
    width: 3
  }

  // Add spinner
  var spinner = new spin(spinnerOptions).spin();
  $('#spinner-container').append(spinner.el);

  if (dataLoaded) {
    // Render graph
    renderStreamGraph(globalData);
  }
  else {
    apiCalls.getChartRangeCountry('both', dateRange, function(data) {
      // Prepdata
      globalData = prepData(data, minTotal)

      // Render graph
      renderStreamGraph(globalData);

      // Remove spinner
      $('#spinner-container').html('');
    }, rank);
  }
}

// Remove streamgraph
function removeStreamGraph() {
  $('#stream-graph-parent').remove();
}

// Load some data at the beginning
function initialLoad(start, end, rank, minTotal) {
  var dateRange = {
    "startDate": start,
    "endDate": end
  }
  apiCalls.getChartRangeCountry('both', dateRange, function(data) {
    var preppedData = prepData(data, minTotal)
    globalData = preppedData;
  }, rank);
}

//******************************************************************************
// Stream Graph Helper functions
//******************************************************************************

// Render a streamgraph
function renderStreamGraph(preppedData) {
  // Data
  var combinedData = preppedData.us.concat(preppedData.uk);

  // Stack
  var stack = d3.stack()
      .keys(preppedData.artists)
      .offset(d3.stackOffsetSilhouette);

  // Create layered data from stack
  var layers = stack(combinedData);

  // Adjust x/y domains
  xScale.domain(d3.extent(combinedData, function(d) {
      var dateObj = new Date(d.key);
      dateObj = new Date( dateObj.getTime() + ( dateObj.getTimezoneOffset() * 60000 ) );
      return dateObj;
    }));

  var minCount = d3.min(layers, function(layer) {
    return d3.min(layer, function(d) {
      return d[0];
    })
  });

  var maxCount = d3.max(layers, function(layer) {
    return d3.max(layer, function(d) {
      return d[1];
    })
  });

  yScale.domain([minCount, maxCount]);
  axisYScale.domain([0, (maxCount + (-minCount))]);

  // Update axes
  d3.select("#x-axis")
    .call(d3.axisBottom().scale(xScale))

  d3.select("#y-axis-top")
    .call(d3.axisRight().scale(axisYScale))
  d3.select("#y-axis-bot")
    .call(d3.axisRight().scale(axisYScale))

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
  renderLayers(stack(preppedData.us), area, d3.scaleOrdinal(colors.streamColors1), 'us');
  renderLayers(stack(preppedData.uk), area, d3.scaleOrdinal(colors.streamColors2), 'uk');

  // Add in tooltip interaction
  addToolTip();

  // Click to transition to other view
  d3.selectAll("path")
    .on("click", function(d, i) {
      // Here's where we transition to the bar chart
      // Get slider selection
      var sliderSelection = d3.brushSelection(d3.select('#stream-graph-brush').node());

      // Invert slider dates
      var startDate = controls.reverseScale(sliderSelection[0]),
          endDate = controls.reverseScale(sliderSelection[1]);

      var dateRange = {
        "startDate": startDate,
        "endDate": endDate
      }

      $('#stream-search').val(d.key)

      transitionToSplitView(dateRange, d.key);
      filterAndRerender($('#stream-search').val());
      tooltip.hide();
    })
}

// Render layers of streamgraph
function renderLayers(layersData, area, color, country) {
  // Render layers from layer data with area function
  var layers = d3.select('#stream-graph-stream-'+country)
    .selectAll("path")
    .data(layersData)

  // Add new layers
  layers.enter()
    .append("path")
    .merge(layers)
      .attr("id", d => {
        var id = d.key.replace(/ /g, "_") + "_" + country;
        return id;
      })
      .transition()
      .duration(300)
      .ease(d3.easeCubic)
      .attr("class", "layer area")
      .style("fill", function(d, i) { return color(i); })
      .attr("d", area);

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
  var postDate = new Date(endDate.getTime() + 10*(1000*60*60*24));

  // Create all 0s for each artist
  var preData = {};
  artists.forEach(d => {
    preData[d] = 0;
  })
  preData['key'] = preDate;

  var postData = {};
  artists.forEach(d => {
    postData[d] = 0;
  })
  postData['key'] = postDate;

  // Add to our data
  // returnData.us.unshift(preData);
  // returnData.uk.unshift(preData);
  //
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
    "week": constants.monthNames[dateInfo.date.getMonth()] + ", " + dateInfo.date.getFullYear()
  }

  // Render tooltip
  tooltip.show(tooltipData, d3.select('#tip-circle').node());
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

function applyFilters() {
  // Get slider selection
  var sliderSelection = d3.brushSelection(d3.select('#stream-graph-brush').node());

  // Invert slider dates
  var startDate = controls.reverseScale(sliderSelection[0]);
  var endDate = controls.reverseScale(sliderSelection[1]);

  // Create a new graph
  createStreamGraph(startDate, endDate, $('#min-rank-value').val(), $('#min-total-value').val());
}

function filterAndRerender(filterText) {
  var filteredArtists = [];

  // Filter out artists
  for (var i=0;i<globalData.artists.length;i++) {
    if (globalData.artists[i].toLowerCase().includes(filterText.toLowerCase())) {
      filteredArtists.push(globalData.artists[i]);
    }
  }

  // Create data structure
  var filteredData = {
    "artists": filteredArtists,
    "us": filterData(globalData.us, filteredArtists),
    "uk": filterData(globalData.uk, filteredArtists)
  }
  renderStreamGraph(filteredData);
}

function filterData(data, filteredArtists) {
  var filteredData = [];

  // Filter out for each date
  for(var i=0;i<data.length;i++) {
    var filteredDate = {};
    filteredDate["key"] = data[i].key;

    // Copy in each artist that is in the list
    for (artist in data[i]) {
      if (filteredArtists.includes(artist)){
        filteredDate[artist] = data[i][artist];
      }
    }
    filteredData.push(filteredDate);
  }
  return filteredData;
}

function transitionToSplitView(dateRange, artist) {
  // Make streamgraph half width
  streamGraphInit(dateRange.startDate, dateRange.endDate, $('#min-rank-value').val(), $('#min-total-value').val(), true, true);

  // Create song graph
  apiCalls.getArtistSongs(artist, dateRange, function(data) {
    songGraph.songGraph(data,dateRange);

    createSongGraphExitButton()
  })
}

function createSongGraphExitButton(){
  var buttonSize = 30,
      buttonStrokeWidth = 2;

  // Add X button
  var exitButton = d3.select('#song-graph-svg').append("g")
    .attr('id', 'exit-song-graph')
    .attr('class', 'exit-song-graph')
    .attr('cursor', 'pointer')
    .attr('transform', utilities.translate((document.body.clientWidth/2)-buttonSize*2,0))
    .on('click', function(){
      // Get rid of song info
      $('#song-graph-parent').remove();

      // Clear out artist name
      $('#stream-search').val('');

      // Go back to full screen stream
      streamGraphInit(dateRange.startDate, dateRange.endDate, $('#min-rank-value').val(), $('#min-total-value').val(), false, true);
    });

  exitButton.append("rect")
    .attr("width",buttonSize)
    .attr("height", buttonSize)
    .attr("fill", colors.backgroundColor)

  exitButton.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", buttonSize)
    .attr("y2", buttonSize)
    .attr("stroke-width", buttonStrokeWidth)
    .attr("stroke", colors.accentColor);

  exitButton.append("line")
    .attr("x1", buttonSize)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", buttonSize)
    .attr("stroke-width", buttonStrokeWidth)
    .attr("stroke", colors.accentColor);
}

module.exports = {
  streamGraphInit: streamGraphInit,
  createStreamGraph: createStreamGraph,
  removeStreamGraph: removeStreamGraph,
  initVis: initVis,
  initialLoad: initialLoad
}
