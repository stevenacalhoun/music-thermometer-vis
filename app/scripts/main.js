var apiCalls = require('./apiCalls.js'),
    $ = require('jQuery')
    streamGraph = require('./streamGraph.js'),
    utilities = require('./utilities.js'),
    introScreen = require('./introScreen.js');

require('../styles/main.scss');
require('../styles/genericons/genericons.css');

if (utilities.getParameterByName("minRank") != null) {
  var visParams = {
    "startDate": new Date(utilities.getParameterByName("startDate")),
    "endDate": new Date(utilities.getParameterByName("endDate")),
    "dateRange": utilities.getParameterByName("dateRange"),
    "minRank": utilities.getParameterByName("minRank"),
    "search": utilities.getParameterByName("songGraph")=='true' ? utilities.getParameterByName("search") : "",
    "songGraph": utilities.getParameterByName("songGraph")=='true',
  }
  introScreen.createVisScreen($("<div></div>"), visParams);
}
else if (utilities.getParameterByName("skip") != null) {
  var visParams = {
    "startDate": new Date(2009,0,1),
    "endDate": new Date(2009,11,31),
    "dateRange": 1,
    "minRank": 100,
    "search": "",
    "songGraph": false,
  }
  introScreen.createVisScreen($("<div></div>"), visParams);
}
else {
  introScreen.createLandingScreen();
}

setTimeout(function() {
  $('#Drake_uk').d3Click()
}, 2000)
