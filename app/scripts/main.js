var apiCalls = require('./apiCalls.js'),
    streamGraph = require('./streamGraph.js'),
    constants = require('./constants.js'),
    utils = require('./utilities.js');

require('../styles/main.scss');

// Get data for a range then pass this data to a stream graph
streamGraph.streamGraphInit('body', new Date(2009,0,1), new Date(2009,11,31), 50, 1);
streamGraph.createStreamGraph(new Date(2009,0,1), new Date(2009,11,31), 50, 1)
