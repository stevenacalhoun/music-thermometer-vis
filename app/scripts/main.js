var apiCalls = require('./apiCalls.js'),
    $ = require('jQuery')
    streamGraph = require('./streamGraph.js'),
    introScreen = require('./introScreen.js');

require('../styles/main.scss');

$.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};

// introScreen.createLandingScreen();

introScreen.createVisScreen($("<div></div>"));

setTimeout(function() {
  $('#Drake_uk').d3Click()
}, 2000)
