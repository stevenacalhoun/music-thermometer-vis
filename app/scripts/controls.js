var $ = require('jQuery'),
    d3 = require('d3');

require('../styles/controls.scss');

  var sliderScale;

function reverseScale(val) {
  return sliderScale.invert(val);
}

function createButton(text) {
  var buttonParent = $("<div class='control-piece button-parent'></div>");
  var button = $("<div class='button' id='filter-button'></div>").appendTo(buttonParent);
  $("<div class='button-text'>"+text+"</div>").appendTo(button);
  return buttonParent;
}

function createNumberInput(labelText, min, max, startValue, id) {
  var inputParent = $("<div class='control-piece number-input-parent'></div>");
  inputParent.append($("<div class='number-input-label'>"+labelText+"</div>"))
  inputParent.append($("<input class='number-input-box' id='"+id+"' type='number' name='rank' min='1' max='100' value="+startValue+">"));
  return inputParent;
}

function createSearchBar(id) {
  var searchBar = $("<input placeholder='Type in artist' onfocus=\"this.placeholder = ''\" onfocusout=\"this.placeholder = 'Type in artist'\" class='control-piece search-input-box' id='"+id+"' />");
  return searchBar;
}

function createSlider(parent, earlyStartingDate, lateStartingDate) {
  var sliderContainer = $("<div id='slider-parent' class='control-piece slider'></div>").appendTo(parent)

  // Sizes
  var margin = {top: 0, right: 20, bottom: 20, left: 0},
      width = (document.body.clientWidth/2) - margin.left - margin.right,
      height = 50 - margin.top - margin.bottom;

  // Scale
  sliderScale = d3.scaleTime()
    .domain([new Date(1960,0,1), new Date(2015,12,31)])
    .rangeRound([0, width]);

  // Axis object
  var xAxis = d3.axisBottom(sliderScale)
    .tickSize(-height)
    .tickFormat(function() { return null; });

  // Brush object
  var brush = d3.brushX()
    .extent([[0,0], [width,height]])
    .on("brush", function() {
      brushed(sliderScale)
    })

  // Main container
  var svg = d3.select('#'+sliderContainer.attr("id")).append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate("+margin.left+","+margin.top+")");

  // Axis at bottom
  svg.append("g")
      .attr("class", "axis slider-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

  // Visual bar
  svg.append("g")
      .attr("class", "slider-axis")
      .attr("transform", "translate(0," + (height) + ")")
      .call(d3.axisBottom(sliderScale)
        .tickPadding(0))
      .attr("text-anchor", null)
    .selectAll("text")
      .attr("x", 6);

  // Append brush
  var brushArea = svg.append("g")
    .attr("class", "brush")
    .attr("id", "stream-graph-brush")
    .call(brush);

  brushArea.call(brush.move, [sliderScale(earlyStartingDate), sliderScale(lateStartingDate)])
}

function brushed(xScale) {
  // Code to change when brushed
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
  var s = d3.event.selection;
  startDate = xScale.invert(s[0]);
  endDate = xScale.invert(s[1]);
};

module.exports = {
  createButton: createButton,
  createNumberInput: createNumberInput,
  createSearchBar: createSearchBar,
  createSlider: createSlider,
  reverseScale: reverseScale
}
