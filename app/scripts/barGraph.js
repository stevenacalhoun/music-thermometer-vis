var d3 = require('d3'),
    $ = require('jquery'),
    tip = require('d3-tip'),
    constants = require('./constants.js');

require('../styles/streamGraph.scss');

module.exports = {
  showData: function(data) {
  },
  barGraph: function(rawData) {
    // Prep data
  var boxheight = 40;
  var data = [];
  var rangeMonth = 12;
  var today = new Date(Date.now());

  for (i=0; i < 100; i++) {
    data.push({
      a : ((Math.random() * 5) | 0),
      b : ((Math.random() * 2) | 0),
      c : ((Math.random() * 5) | 0),
      date : new Date(today.getYear()+1900, today.getMonth()+Math.random()*rangeMonth)
    });
  }

  var margin = {top: 20, right: 80, bottom: 80, left: 40},
      width = boxheight * 1.4 * 12;

  var translate = function(x,y){               
    return "translate(" + x + "," + y + ")";
  }

  var max = d3.max(data, function(d){return d.a + d.b + d.c});
  var height = max * boxheight;

  var dates = data.map(function(d){ return d.date; });
  var maxDate = Math.max.apply(null, dates);
  var minDate = Math.min.apply(null, dates);

  var x = d3.scaleTime()
      .range([0,width])
      .domain([minDate,maxDate]);


  var y = d3.scaleLinear()
      .domain([0, max])
      .rangeRound([height, 0])


  $("<div id='main'></div>").appendTo("body");

  var svg = d3.select("#main").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", translate(margin.left, margin.top + 0.5))

  svg.append('defs')
    .append('pattern')
    .attr("patternUnits", "userSpaceOnUse")
    .attr('id','img')
    .attr('x','0')
    .attr('y','0')
    .attr('height','38')
    .attr('width','38')
    .append('image')
    .attr('x','0')
    .attr('y','0')
    .attr('height','38')
    .attr('width','38')
    .attr('xlink:href',require("../images/test.png"))

  var color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(["a", "b", "c"])

  data.forEach(function(d){
    var y0 = 0;
    d.offsets = color.domain().map(function(type){
      return {type: type, y0: y0, y1: y0 += +d[type], value : d[type]}
    });
  });

  var tooltip = tip()
    .attr('class', 'd3-tip')
    .offset([-10,0])
    .html(function(d){
      return 'tooltip example';
    });

  svg.call(tooltip);

  var xAxis = d3.axisBottom(x);


  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

 

  var groups = svg.selectAll(".group")
      .data(data)
        .enter().append("g")
          .attr("transform", function(d,i){return "translate(" + (x(d.date)-38/2) + ", 0)"})
          .attr("class", "group")

  var types = groups.selectAll(".type")
      .data(function(d){return d.offsets})
      .enter().append("g")
        .attr("transform", function(d){ return translate(0,y(d.y1))})
        .attr("class", "type")

  types.selectAll("rect")
      .data(function(d){return d3.range(0,d.value)})
      .enter().append("rect")
        .attr("height", boxheight-2)
        .attr("width", boxheight-2)
        .attr("y", function(d){ return boxheight * d })
        .attr("fill", "url(#img)")
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide)



  }
}

