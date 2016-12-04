var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    streamGraph = require('./streamGraph.js'),
    constants = require('./constants.js'),
    d3 = require('d3'),
    $ = require('jQuery');

require('../styles/main.scss');

// Get data for a range then pass this data to a stream graph
var dateRange = {
  "startDate": new Date(2000,0,1),
  "endDate": new Date(2001,11,31),
}

apiCalls.getArtistSongs('Michael Jackson', dateRange, function(data) {
  console.log(data);
})
