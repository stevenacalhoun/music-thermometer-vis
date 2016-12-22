var apiCalls = require('./apiCalls.js'),
    $ = require('jQuery')
    streamGraph = require('./streamGraph.js'),
    introScreen = require('./introScreen.js');

require('../styles/main.scss');
require('../styles/genericons/genericons.css');

introScreen.createLandingScreen();
// introScreen.createVisScreen($("<div></div>"));
