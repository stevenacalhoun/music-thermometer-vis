var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    streamGraph = require('./streamGraph.js'),
    constants = require('./constants.js'),
    d3 = require('d3'),
    $ = require('jQuery');

require('../styles/main.scss');

// Get data for a range then pass this data to a stream graph
var dateRange = {
  "startDate": new Date(2009,0,1),
  "endDate": new Date(2009,11,31),
}

apiCalls.getChartRangeCountry('both', dateRange, function(data) {
  var countrySplit = {
    "us": data.filter(function(d) {if (d.country == 'us') return d;}),
    "uk": data.filter(function(d) {if (d.country == 'uk') return d;})
  }

  var tool = streamGraph.streamGraphInit('body');
  streamGraph.streamGraph(countrySplit.uk, 'body', 'uk-streamGraph', constants.streamColors1, tool);
  streamGraph.streamGraph(countrySplit.us, 'body', 'us-streamGraph', constants.streamColors2, tool);
}, 50);

// apiCalls.getChartRangeCountry('uk', dateRange, function(data) {
//   streamGraph.streamGraph(data, 'body', 'uk-streamGraph');
//   var end = new Date().getTime() / 1000;
//   console.log(end-start);
//   console.log(data);
// });

// apiCalls.getChartRangeCountryArtist("uk", "The Killers", dateRange, function(data) {
//   console.log(data)
// })
