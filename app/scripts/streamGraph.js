var d3 = require('d3'),
    tip = require('d3-tip'),
    $ = require('jQuery'),
    constants = require('./constants.js');

require('../styles/streamGraph.scss');
var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

module.exports = {
  streamGraph: function(rawData, parent) {
    var countrySplit = {
      "us": rawData.filter(function(d) {if (d.country == 'us') return d;}),
      "uk": rawData.filter(function(d) {if (d.country == 'uk') return d;})
    }


    createSlider(parent, new Date(1960,0,1), new Date(2015,12,31))

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
    var margin = {top: 10, right: 0, bottom: 0, left: 40},
        width = document.body.clientWidth - margin.left - margin.right,
        containerHeight = window.innerHeight - $('#slider-parent').height(),
        height = (containerHeight/2);

    // Graph container
    var graphContainer = $("<div id='stream-graph-parent' class='stream-chart'></div>").appendTo(parent)

    // Hover tooltip
    var tooltip = tip()
        .attr('class', 'd3-tip')
        .html(function(d) {
          return tooltipHtml(d.artist, d.count, d.week);
        })
        .offset([-10,0]);

    // Main container
    var svg = d3.select("#stream-graph-parent").append("svg")
        .attr('id', 'stream-graph-svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", containerHeight)

    // Hidden circle for tooltip on mouse
    var tipCircle = svg.append("circle")
        .attr('id', 'tip-circle');

    svg.on('mousemove', function(d,i) {
      // Move circle to mouse
      tipCircle.attr('cx', d3.mouse(this)[0])
        .attr('cy', d3.mouse(this)[1]);
    })

    // Scales: x, y, color
    var x = d3.scaleTime()
        .range([0, width])
        .domain(d3.extent(usData.data, function(d) { return new Date(d.key); }));

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

    // Axes
    var xAxis = d3.axisBottom()
        .scale(x);

    // Axes render
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+margin.left/2+"," + height + ")")
        .call(xAxis);

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

    renderLayers(usData, area, constants.streamColors1, tooltip, margin);
    margin.top = margin.top + height;
    renderLayers(ukData, area, constants.streamColors2, tooltip, margin);

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
   }
}

function renderLayers(data, area, colorOptions, tooltip, margin) {
  // Stack
  var stack = d3.stack()
    .keys(data.artists)
    .offset(d3.stackOffsetSilhouette);

  // Create layered data from stack
  var layers = stack(data.data);

  var streamGraphEle = d3.select("#stream-graph-svg")
    .append("g")
      .call(tooltip);

  streamGraphEle.attr("transform", "translate("+margin.left+","+margin.top+")");
  var color = d3.scaleOrdinal(colorOptions);

  // Render layers from layer data with area function
  var g = streamGraphEle.selectAll(".layer")
    .data(layers)
    .enter();

  var layers = g.append("g")
    .attr('class', 'layer')
    .append("path")
    .attr("class", "area")
    .style("fill", function(d, i) { return color(i); })
    .attr("d", area)
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

function createSlider(parent, start, end) {
  var sliderContainer = $("<div id='slider-parent' class='slider'></div>").appendTo(parent)

  // Sizes
  var margin = {top: 10, right: 40, bottom: 20, left: 40},
      width = document.body.clientWidth - margin.left - margin.right,
      height = 50 - margin.top - margin.bottom;

  // Scale
  var xScale = d3.scaleTime()
    .domain([start, end])
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
  var svg = d3.select("#slider-parent").append("svg")
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
  var start = xScale.invert(s[0]),
      end = xScale.invert(s[1]);
};
