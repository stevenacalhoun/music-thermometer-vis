var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    streamGraph = require('./streamGraph.js'),
    constants = require('./constants.js'),
    d3 = require('d3'),
    $ = require('jQuery')
    utils = require('./utilities.js');

require('../styles/main.scss');

// Get data for a range then pass this data to a stream graph
var dateRange = {
  "startDate": new Date(2014,0,1),
  "endDate": new Date(2015,11,31),
}

apiCalls.getChartRangeCountry('both', dateRange, function(data) {
  streamGraph.streamGraph(data, 'body');
}, 10);

// apiCalls.getChartRangeCountry('uk', dateRange, function(data) {
//   streamGraph.streamGraph(data, 'body', 'uk-streamGraph');
//   var end = new Date().getTime() / 1000;
//   console.log(end-start);
//   console.log(data);
// });

// apiCalls.getChartRangeCountryArtist("uk", "The Killers", dateRange, function(data) {
//   console.log(data)
// })
