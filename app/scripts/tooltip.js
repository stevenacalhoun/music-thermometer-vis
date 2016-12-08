var $ = require('jQuery'),
    d3 = require('d3');

require('../styles/tooltip.scss');


function songGraphTooltip(d) {
  var container = $("<div class='song-tooltip-container'></div>");
  container.append('<div class="tooltip-rank">'+d.rank+'<div>');
  if (d.albumArtLink != null) {
    container.append("<div class='tooltip-album-art'><img src='"+d.albumArtLink+"' /></div>");
  }
  container.append("<span class='tooltip-song-name tooltip-piece'>"+d.title+"</span>");
  container.append("<div class='tooltip-by-artist tooltip-piece'>by "+d.artist+"</div>");
  container.append("<div class='tooltip-time tooltip-piece'>"+d.chart_week.substring(0,10)+"</div>")

  return container.html();
}

function streamGraphTooltip(artist, usCount, ukCount, time) {
  var container = $('<div id="tooltip-container" class="tooltip-container"></div>');
  container.append("<div class='tooltip-piece tooltip-artist'>"+artist+"</div>");
  container.append("<div class='tooltip-separator'></div>");
  container.append('<div class="tooltip-piece tooltip-time">'+time+'</div>');

  return container.html();
}

function smallBarChart(tooltipData) {
  var data = [
    {"country": "US", "count": tooltipData.us},
    {"country": "UK", "count": tooltipData.uk}
  ]
  var margin = {top: 20, bottom: 25, right: 0, left: 0},
      width = $('#stream-tip').width() - margin.right - margin.left,
      height = 100 - margin.top - margin.bottom;

  var x = d3.scaleBand()
    .domain(["US", "UK"])
    .padding(2)
    .rangeRound([0, width])
    .padding(0.1);

  var xAxis = d3.axisBottom()
    .scale(x)
    .tickSize(0);

  var y = d3.scaleLinear()
    .domain([0, d3.max([data[0].count, data[1].count], d => {return d*1.1;})])
    .range([height,0]);

  var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(3)
    .tickSize(0);

  var svg = d3.select('#stream-tip')
    .append("svg")
      .attr('id', 'tooltip-bar-graph-svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height+margin.top+margin.bottom)

  var g = svg.append("g")
    .attr("id", "tooltip-bar-graph")
    .attr("transform", "translate("+margin.left+","+margin.top+")");

  var bars = g.selectAll("rect")
    .data(data)

  // Bar
  bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.country); })
      .attr("y", function(d) { return y(d.count); })
    .merge(bars)
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.count); })
      .attr("fill", d => {return d.country == "US" ? "#023858" : "#b30000"})

  // Bar lable
  g.selectAll("text.bar")
      .data(data)
    .enter().append("text")
      .attr("class", "bar-text-label")
      .attr("x", function(d) { return x(d.country) + x.bandwidth()/2 - 6; })
      .attr("y", function(d) { return y(d.count) - 5; })
      .text(d => {return d.count})

  // Bar axis
  svg.append("g")
    .call(xAxis)
    .attr('class', 'x-axis-tip-bar')
    .attr('transform', 'translate('+(margin.left-2)+','+(height+margin.top+3)+')')

}

module.exports = {
  streamGraphTooltip: streamGraphTooltip,
  songGraphTooltip: songGraphTooltip,
  addStreamgraphTooltipGraph: smallBarChart
}
