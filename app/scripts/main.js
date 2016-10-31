var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    streamGraph = require('./streamGraph.js')
    d3 = require('d3'),
    $ = require('jQuery');

require('../styles/main.scss');

startDate = new Date(1992,1,1);
endDate = new Date(1993,12,31);

// Get data for a range then pass this data to a stream graph
var data = {
  "startDate": startDate,
  "endDate": endDate,
  "country": "us"
}
apiCalls.getTopChartSongs(data, function(data) {
  streamGraph.streamGraph(data, 'body', 'us-streamGraph');
});

data.country = "uk";
apiCalls.getTopChartSongs(data, function(data) {
  streamGraph.streamGraph(data, 'body', 'uk-streamGraph');
});
