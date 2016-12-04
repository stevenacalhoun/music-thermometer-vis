var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    constants = require('./constants.js'),
    streamGraph = require('./streamGraph.js')
    barGraph = require('./barGraph.js')
    d3 = require('d3'),
    $ = require('jQuery');

require('../styles/main.scss');

startDate = new Date(1992,1,1);
endDate = new Date(1993,12,31);


// Get data for a range then pass this data to a stream graph
var dateRange = {
  "startDate": new Date(2000,0,1),
  "endDate": new Date(2001,11,31),
}


apiCalls.getArtistSongs('Michael Jackson', dateRange, function(data) {
  console.log(data);
})

