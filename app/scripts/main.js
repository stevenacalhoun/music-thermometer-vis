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
  "startDate": new Date(1991,7,1),
  "endDate": new Date(2016,4,31),
}


apiCalls.getArtistSongs('Michael Jackson', dateRange, function(data) {
  console.log(data);


  var ukData, usData;
  for(var i=0;i<data.length;i++){
    if(data[i].key === 'us')
      usData = data[i].values;
    else if(data[i].key === 'uk')
      ukData = data[i].values;
  }

  console.log(usData);

  songGraph.songGraph(usData,'us1',dateRange);
  songGraph.songGraph(ukData,'uk1',dateRange);
  // barGraph.barGraph(usData,'us1');
  // barGraph.barGraph(ukData,'uk1');
})

