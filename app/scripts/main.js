var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    constants = require('./constants.js'),
    streamGraph = require('./streamGraph.js')
    songGraph = require('./songGraph.js')
    d3 = require('d3'),
    $ = require('jQuery');

require('../styles/main.scss');

startDate = new Date(1992,1,1);
endDate = new Date(1993,12,31);


// Get data for a range then pass this data to a stream graph
var dateRange = {
  "startDate": new Date(2009,7,1),
  "endDate": new Date(2010,4,31),
}


apiCalls.getArtistSongs('Taylor Swift', dateRange, function(data) {

  songGraph.songGraph(data,dateRange);

})

