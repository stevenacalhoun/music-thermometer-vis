var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    streamGraph = require('./streamGraph.js')
    d3 = require('d3'),
    $ = require('jQuery');

require('../styles/main.scss');

// Get data for a range then pass this data to a stream graph
var dateRange = {
  "startDate": new Date(2011,0,1),
  "endDate": new Date(2012,11,31),
}

var start = new Date().getTime() / 1000;
apiCalls.getChartRangeCountry('both', dateRange, function(data) {
  streamGraph.streamGraph(data.filter(function(entry) { if (entry.country == 'uk') return entry}), 'body', 'uk-streamGraph');
  streamGraph.streamGraph(data.filter(function(entry) { if (entry.country == 'us') return entry}), 'body', 'us-streamGraph');


  var end = new Date().getTime() / 1000;
  console.log(end-start);
  console.log(data);
});

// apiCalls.getChartRangeCountry('uk', dateRange, function(data) {
//   streamGraph.streamGraph(data, 'body', 'uk-streamGraph');
//   var end = new Date().getTime() / 1000;
//   console.log(end-start);
//   console.log(data);
// });

// apiCalls.getChartRangeCountryArtist("uk", "The Killers", dateRange, function(data) {
//   console.log(data)
// })
