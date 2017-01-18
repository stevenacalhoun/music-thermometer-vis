var apiCalls = require('./apiCalls.js'),
    $ = require('jQuery')
    streamGraph = require('./streamGraph.js'),
    utilities = require('./utilities.js'),
    introScreen = require('./introScreen.js');

require('../styles/main.scss');
require('../styles/genericons/genericons.css');

// introScreen.createLandingScreen();
introScreen.createVisScreen($("<div></div>"));


setTimeout(function() {
  $('#Drake_uk').d3Click()
}, 2000)
