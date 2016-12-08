var apiCalls = require('./apiCalls.js'),
    streamGraph = require('./streamGraph.js'),
    introScreen = require('./introScreen.js');

require('../styles/main.scss');

introScreen.createLandingScreen();

// // Add title and info button
// var header = $("<div id='app-header' class='app-header'></div>").appendTo('body');
// header.append("<div id='app-title' class='title'>Music Thermometer</div>");
//
//
// // Start with stream graph
// streamGraph.streamGraphInit('body', new Date(2009,0,1), new Date(2009,11,31), 50, 1);
