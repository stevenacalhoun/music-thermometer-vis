var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    streamGraph = require('./streamGraph.js')
    d3 = require('d3'),
    $ = require('jQuery');

require('../styles/main.scss');

// Get data for a range then pass this data to a stream graph
var data = {
  "startDate": new Date(2001,1,1),
  "endDate": new Date(2010,12,31),
  "country": "us",
  "minRank": 100
}

// apiCalls.getChartRange(data, function(data) {
//   streamGraph.streamGraph(data, 'body', 'us-streamGraph');
// });
//
// data.country = "uk";
// apiCalls.getChartRange(data, function(data) {
//   streamGraph.streamGraph(data, 'body', 'uk-streamGraph');
// });

data.artist = "The Killers";
apiCalls.getChartRange(data, function(data) {
  console.log(data)
})
