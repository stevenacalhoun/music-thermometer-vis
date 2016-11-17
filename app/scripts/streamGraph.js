var d3 = require('d3'),
    tip = require('d3-tip'),
    constants = require('./constants.js');

require('../styles/streamGraph.scss');

module.exports = {
  streamGraph: function(rawData, parent, graphId) {
    // Prep data
    var preppedData = aggregateData(rawData),
        data = preppedData.data,
        artists = preppedData.artists;

    // Graph container
    $(parent).append("<div id='"+graphId+"' class='stream-chart'></div>");

    // Sizing
    var margin = {top: 20, right: 40, bottom: 30, left: 30};
    var width = document.body.clientWidth - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // Stack
    var stack = d3.stack()
        .keys(artists)
        .offset(d3.stackOffsetSilhouette);

    // Create layered data from stack
    var layersData = stack(data);

    // Scales: x, y, color
    var x = d3.scaleTime()
        .range([0, width])
        .domain(d3.extent(data, function(d) { return new Date(d.key); }));

    var y = d3.scaleLinear()
        .range([height-10, 0])
        .domain([
          d3.min(layersData, function(layer) {
            return d3.min(layer, function(d) {
              return d[1];
            })
          }),
          d3.max(layersData, function(layer) {
            return d3.max(layer, function(d) {
              return d[1];
            })
          })
        ]);

    var color = d3.scaleOrdinal()
        .range(constants.colors);

    // Axes
    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxis = d3.axisLeft()
        .scale(y);

    var yAxisr = d3.axisRight()
        .scale(y);

    // Area function
    var area = d3.area()
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

    // Hover tooltip
    var tooltip = tip()
        .attr('class', 'd3-tip')
        .html(function(d) {
          // Need some better tooltip html
          return d.artist + ": " + d.value;
        })
        .offset([-10,0]);

    // Main container
    var svg = d3.select("#"+graphId).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(tooltip)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Hidden circle for tooltip on mouse
    var tipCircle = svg.append("circle")
      .attr('id', 'tip-circle');

    // Axes render
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxisr);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Render layers from layer data with area function
    svg.selectAll(".layer")
        .data(layersData)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", area)
        .attr("opacity", 1)
        .style("fill", function(d, i) { return color(i); });

    // Mouseover functions
    svg.selectAll(".layer")
      .on("mouseover", function(d, i) {
        // Lower opacity of all layers but hovered 1
        svg.selectAll(".layer").transition()
          .duration(250)
          .attr("opacity", function(d, j) {
            return j != i ? 0.2 : 1;
        })
      })

      .on("mousemove", function(d, i) {
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

        // Move circle to mouse
        tipCircle.attr('cx', d3.mouse(this)[0])
          .attr('cy', d3.mouse(this)[1]);

        // Render tooltip on circle
        tooltipData = {
          "value": value,
          "artist": d.key
        }
        tooltip.show(tooltipData, tipCircle.node());
      })

      .on("mouseout", function(d, i) {
        // Hide tooltip
        tooltip.hide(d);

        // All layers back to full opacity
        svg.selectAll(".layer")
          .transition()
          .duration(250)
          .attr("opacity", "1");
      })
   }
}

// This is function is nasty, could likely be improved/sped up
function aggregateData(data) {
  // Aggregate weeks into months
  var artists = [];
  var i = 0;
  data.forEach(function(d){
    // Keep up with all artists
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
