var $ = require('jQuery'),
    streamGraph = require('./streamGraph.js'),
    d3 = require('d3');

require('../styles/controls.scss');

var sliderScale, brush,maxSliderDate;

function reverseScale(val) {
  return sliderScale.invert(val);
}

function createButton(text, id) {
  var buttonParent = $("<div class='control-piece button-parent'></div>");
  var button = $("<div class='button' id='filter-button'></div>").appendTo(buttonParent);
  $("<div id='"+id+"' class='button-text'>"+text+"</div>").appendTo(button);
  return buttonParent;
}

function createSelectOption(options, id, title) {
  var boundingBox = $('<div class="control-piece select-box"></div>');

  boundingBox.append($("<div class='number-input-label'>Date Range</div>"))

  var selectContainer = $('<span class="select-container">');
  boundingBox.append(selectContainer);

  var select = $('<select id="' + id + '" multple="multiple"></select>');
  selectContainer.html(select);

  for(var i=0;i<options.length;i++) {
    select.append($('<option value="' + options[i].value + '"/>').html(options[i].name));
  }
  $("<span class='genericon genericon-downarrow'></span>").appendTo(selectContainer);

  select.on('change', function() {
    updateSliderWidth($('#'+id).val())
  })
  return boundingBox;
}

function updateSliderWidth(years) {
  var sliderSelection = d3.brushSelection(d3.select('#stream-graph-brush').node());

  earlySliderDate = reverseScale(sliderSelection[0]),
  lateSliderDate = reverseScale(sliderSelection[0]);

  // Get end date
  lateSliderDate.setDate(lateSliderDate.getDate()+(years*365));

  // If the late date is past the max date
  if (lateSliderDate > new Date(2015,12,31)) {
    var difference = lateSliderDate - new Date(2015,12,31);
    lateSliderDate = new Date(2015,12,31);
    earlySliderDate = new Date(earlySliderDate - difference);
  }

  // Change slider
  d3.select('#stream-graph-brush').call(brush.move, [sliderScale(earlySliderDate), sliderScale(lateSliderDate)])
}

function createDropdown(list, id) {
  var selectParent = $("<div class='select-parent'></div>")
  var selectInput = $("<select name=''></select>").appendTo(selectParent);
  for(var i=0;i<list.length;i++) {
    selectInput.append($("<option value='"+list[i].value+"'>"+list[i].name+"</option>"))
  }
  return selectParent;
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

  earlySliderDate = earlyStartingDate,
  lateSliderDate= lateStartingDate;

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
  brush = d3.brushX()
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

// Controls
function createControls(parent, earlyStartingDate, lateStartingDate, startingRank, startingTotal) {
  var controlsContainer = $("<div id='controls'></div>").appendTo(parent),
      controlsContainerTop = $("<div id='controls-top' class='controls'></div>").appendTo(controlsContainer),
      controlsContainerBot = $("<div id='controls-bot' class='controls'></div>").appendTo(controlsContainer);

  // Add date slider
  createSlider(controlsContainerTop, earlyStartingDate, lateStartingDate);

  // Add filter for min rank
  var yearOptions = [
    {"name": "1 Year", "value": 1},
    {"name": "2 Years", "value": 2},
    {"name": "5 Years", "value": 5},
    {"name": "10 Years", "value": 10}
  ]
  var sliderDropdown = createSelectOption(yearOptions, "slider-dropdown", "Time Range");
  controlsContainerTop.append(sliderDropdown);

  // Add filter for min rank
  var rankInput = createNumberInput("Min. Song Rank", 1, 100, startingRank, "min-rank-value");
  controlsContainerTop.append(rankInput);

  // Add filter for min total
  var totalInput = createNumberInput("Min. Total Count", 1, 100, startingTotal, "min-total-value");
  controlsContainerTop.append(totalInput);

  // Add button
  var button = createButton("Update", 'apply-filters-button');
  controlsContainerTop.append(button);

  // Add search bar
  var searchBar = createSearchBar('stream-search');
  controlsContainerBot.append(searchBar);

  $('body').append(addSpotifyPreview("https://p.scdn.co/mp3-preview/4839b070015ab7d6de9fec1756e1f3096d908fba"));
}

function addSpotifyPreview(link) {
  var audioBoxParent = $("<div id='audio-box-parent' class='audio-box-parent'></div>");
  // var audioBox = $("<audio controls  id='audio-control'></audio>").appendTo(audioBoxParent);
  // audioBox.append($("<source id='audio-track' src='none' type='audio/mpeg'>"));

  return audioBoxParent;
}

module.exports = {
  createButton: createButton,
  createNumberInput: createNumberInput,
  createSearchBar: createSearchBar,
  createSlider: createSlider,
  reverseScale: reverseScale,
  createControls: createControls
}
