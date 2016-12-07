var apiCalls = require('./apiCalls.js'),
    streamGraph = require('./streamGraph.js'),
    constants = require('./constants.js'),
    $ = require('jQuery'),
    overlay = require('./overlay.js'),
    d3 = require('d3'),
    tip = require('d3-tip'),
    utils = require('./utilities.js');

var tooltipLib = require('./tooltip.js');

require('../styles/main.scss');

// Add title and info button
var header = $("<div id='header' class='header'></div>").appendTo('body');
header.append("<div class='title'>Music Thermometer</div>");
var infoButton = $("<div class='info-button'><span class='info-button-text'>i</span></div>").appendTo(header);

infoButton.on("click", function() {
  overlay.createOverlay();
})

// Start with stream graph
streamGraph.streamGraphInit('body', new Date(2009,0,1), new Date(2009,11,31), 50, 1);
