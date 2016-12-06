var $ = require('jQuery'),
    d3 = require('d3');

require('../styles/controls.scss');

// Streamgraph controls
function createControls(parent, earlyStartingDate, lateStartingDate, startingRank, startingTotal) {
  var controlsContainer = $("<div id='controls' class='controls'></div>").appendTo(parent)

  // Add date slider
  createSlider(controlsContainer, earlyStartingDate, lateStartingDate);
  controlsContainer.append(createRankFilter(startingRank));
  controlsContainer.append(createTotalFilter(startingTotal));
  controlsContainer.append(createStreamSearch());
  controlsContainer.append(createApplyButton());
}

function createButton(text) {
  var buttonParent = $("<div class='control-piece button-parent'></div>");
  var button = $("<div class='button' id='filter-button'></div>").appendTo(buttonParent);
  $("<div class='button-text'>"+text+"</div>").appendTo(button);
  return buttonParent;
}

function createApplyButton() {
  var button = createButton("Update");

  button.on("click", function(){
    createStreamGraph(startDate, endDate, $('#rank-value').val());
  })
  return button;
}

function createNumberInput(labelText, min, max, startValue, id) {
  var inputParent = $("<div class='control-piece number-input-parent'></div>");
  inputParent.append($("<div class='number-input-label'>"+labelText+"</div>"))
  inputParent.append($("<input class='number-input-box' id='"+id+"' type='number' name='rank' min='1' max='100' value="+startValue+">"));
  return inputParent;
}

function createRankFilter(startingRank) {
  var rankInput = createNumberInput("Min. Song Rank", 1, 100, startingRank, "min-rank-value");
  return rankInput;
}

function createTotalFilter(startingTotal) {
  var rankInput = createNumberInput("Min. Total Count", 1, 100, startingTotal, "min-total-value");
  return rankInput;
}

function createStreamSearch() {
  var searchBar = createSearchBar('stream-search');
  return searchBar;
}

function createSearchBar(id) {
  var searchBar = $("<input placeholder='Search' class='control-piece search-input-box' id='"+id+"' />");
  return searchBar;
}

function createSlider(parent, earlyStartingDate, lateStartingDate) {
  var sliderContainer = $("<div id='slider-parent' class='control-piece slider'></div>").appendTo(parent)

  // Sizes
  var margin = {top: 0, right: 20, bottom: 20, left: 0},
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
  var brushArea = svg.append("g")
    .attr("class", "brush")
    .call(brush);

  brushArea.call(brush.move, [xScale(earlyStartingDate), xScale(lateStartingDate)])
}

function brushed(xScale) {
  // Code to change when brushed
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
  var s = d3.event.selection;
  startDate = xScale.invert(s[0]);
  endDate = xScale.invert(s[1]);
};

module.exports = {
  createControls: createControls,
  createButton: createButton
}
