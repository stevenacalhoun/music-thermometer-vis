var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    streamGraph = require('./streamGraph.js')
    d3 = require('d3'),
    $ = require('jQuery');

require('../styles/main.scss');

startDate = new Date(2015,1,1);
endDate = new Date(2015,12,31);

apiCalls.getChartsForRange(startDate, endDate, 'us', function(data) {
  streamGraph.streamGraph(data);
});
