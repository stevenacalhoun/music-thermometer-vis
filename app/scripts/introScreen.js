var $ = require('jQuery')
    streamGraph = require('./streamGraph.js')
    constants = require('./constants.js'),
    controls = require('./controls.js');

require('../styles/introScreen.scss');

function createLandingScreen() {
  // Main splash container
  var splashContainer = $('<div style="display:none" class="splash-container"></div>').appendTo('body');

  // Add background
  splashContainer.append("<div class='background'></div>");

  // Add initial info
  var container = $('<div id="opening-screen" class="center-container"></div>').appendTo(splashContainer);
  container.append("<div class='splash-title'>Music Thermometer</div>");
  container.append("<div class='splash-subtitle'>artists' popularity over time</div>");
  container.append("<div class='splash-subtitle-bold'>US vs. UK</div>");

  // Button to transition
  var nextButton = $("<div class='splash-button'>Find Out More</div>").appendTo(container);
  nextButton.on("click", function() {
    $('#opening-screen').fadeOut(500, function() {
      // Create next screen
      createDescriptionScreen(splashContainer);
    })
  })
  splashContainer.fadeIn(500);

  // Load some data from server
  streamGraph.initialLoad(new Date(2009,0,1), new Date(2009,11,31), 50, 1)
}

function createDescriptionScreen(splashContainer) {
  var totalContainer = $("<div id='description-screen' style='display:none'></div>").appendTo(splashContainer);

  // Add shade
  var shade = $("<div id='shade' class='shade'></div>").appendTo(totalContainer);

  // Add explanation info
  var container = $('<div class="center-container details"></div>').appendTo(totalContainer);
  container.append("<div class='splash-text'>"+constants.entry1+"</div>");
  container.append("<div class='splash-text'>"+constants.entry2+"</div>");
  container.append("<div class='splash-text'>"+constants.entry3+"</div>");

  // Add button to enter vis
  var enterButton = $("<div class='splash-button'>Enter</div>").appendTo(container);
  enterButton.on("click", function() {
    $('#description-screen').fadeOut(500, function() {
      // Create vis
      createVisScreen(splashContainer);
    })
  })
  totalContainer.fadeIn(500);
}

function createVisScreen(splashContainer) {
  splashContainer.fadeOut(500, function(){
    // Add title and info button
    var header = $("<div id='app-header' class='app-header'></div>").appendTo('body');
    header.append("<div id='app-title' class='title'>Music Thermometer</div>");

    // Start with stream graph
    streamGraph.streamGraphInit(new Date(2009,0,1), new Date(2009,11,31), 50, 1);
  });
}

module.exports = {
  createLandingScreen: createLandingScreen
}
