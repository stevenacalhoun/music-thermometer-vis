var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    streamGraph = require('./streamGraph.js')
    d3 = require('d3'),
    moment = require('moment'),
    $ = require('jQuery');

require('../styles/main.scss');

var csvData = require('./testData.csv');

/**
Artist    Count       Date(accumulated by month)
**/

startDate = new Date(2015,1,1)
endDate = new Date(2015,12,31)
apiCalls.getChartsForRange(startDate, endDate, 'us', function(data) {
  // Aggregate weeks into months
  var aggregateData = d3.nest()
    .key(function(d) {
      // month/year key
      var dateObj = new Date(d.chartWeek);
      var dateKey = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
      return dateKey;
    })
    .rollup(function(leaves) {
      // Combine all artist data into one long list
      artistData = [];
      leaves.forEach(function(leaf) {
        artistData.push(leaf.artist);
      });

      // Reduce artist data
      var nestedLeaves = d3.nest()
        .key(function(d) {
          return d
        })
        .rollup(function(leaves) {
          return leaves.length
        })
        .entries(artistData)

      return nestedLeaves
    })
    .entries(data)

  // Sort by date
  aggregateData.sort(function(a,b) {
    if (new Date(a.key) < new Date(b.key)) {
      return -1;
    }
    else {
      return 1;
    }
  })

  // Change data rep
  streamGraphData = [];
  aggregateData.forEach(function(d){
    date = d.key;
    d.value.forEach(function(artist) {
      streamGraphData.push({
        "key": artist.key,
        "value": artist.value,
        "date": date
      })
    })
  })

  streamGraph.streamGraph(streamGraphData);
});



// apiCalls.getSpotifySongs(["0eGsygTp906u18L0Oimnem", "0eGsygTp906u18L0Oimnem"], function(data) {
// });
