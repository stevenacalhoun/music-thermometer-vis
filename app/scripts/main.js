var apiCalls = require('./apiCalls.js'),
    streamGraph = require('./streamGraph.js'),
    constants = require('./constants.js'),
    d3 = require('d3'),
    $ = require('jQuery')
    utils = require('./utilities.js');

require('../styles/main.scss');

// Get data for a range then pass this data to a stream graph
streamGraph.streamGraphInit('body');
streamGraph.createStreamGraph(new Date(2000,0,1), new Date(2012,11,31), 10)
