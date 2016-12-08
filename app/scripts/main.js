var apiCalls = require('./apiCalls.js'),
    $ = require('jQuery')
    streamGraph = require('./streamGraph.js'),
    introScreen = require('./introScreen.js');

require('../styles/main.scss');

$.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};

// introScreen.createLandingScreen();

// Add title and info button
var header = $("<div id='app-header' class='app-header'></div>").appendTo('body');
header.append("<div id='spinner-container' class='spinner-container'></div>");
header.append("<div id='app-title' class='title'>Music Thermometer</div>");

// Start with stream graph
streamGraph.streamGraphInit1(new Date(2009,0,1), new Date(2009,11,31), 50, 1, false);
streamGraph.streamGraphInit(new Date(2009,0,1), new Date(2009,11,31), 50, 1, false);

setTimeout(function() {
  $('#Jay-Z_uk').d3Click()
}, 2000)
