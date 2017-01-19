var apiCalls = require('./apiCalls.js'),
    $ = require('jQuery')
    streamGraph = require('./streamGraph.js'),
    utilities = require('./utilities.js'),
    introScreen = require('./introScreen.js');

require('../styles/main.scss');
require('../styles/genericons/genericons.css');

if (utilities.getParameterByName("minRank") != null) {
  var search = utilities.getParameterByName("songGraph")=='true' ? utilities.getParameterByName("search") : "";
  var visParams = {
    "startDate": new Date(utilities.getParameterByName("startDate")),
    "endDate": new Date(utilities.getParameterByName("endDate")),
    "dateRange": utilities.getParameterByName("dateRange"),
    "minRank": utilities.getParameterByName("minRank"),
    "search": search,
    "songGraph": utilities.getParameterByName("songGraph")=='true',
  }
  introScreen.createVisScreen($("<div></div>"), visParams);
}
else {
  introScreen.createLandingScreen();
}
