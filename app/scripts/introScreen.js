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
  container.append("<div class='created-by'>Created by Steven Calhoun, Qin Li, Jing Liu, and Sotaro Sugimoto</div>");

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
  streamGraph.initialLoad(new Date(2009,0,1), new Date(2009,11,31), 100, 1)
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
      var visParams = {
        "startDate": new Date(2009,0,1),
        "endDate": new Date(2009,11,31),
        "dateRange": "1",
        "minRank": 100,
        "search": "",
        "songGraph": false,
      }
      createVisScreen(splashContainer, visParams);
    })
  })
  totalContainer.fadeIn(500);
}

function createVisScreen(splashContainer, visParams) {
  splashContainer.fadeOut(500, function(){
    // Add title
    var header = $("<div id='app-header' class='app-header'></div>").appendTo('body');
    $(header).append("<div id='spinner-container' class='spinner-container'></div>");
    $(header).append("<div id='app-title' class='title'>Music Thermometer</div>");

    controls.createControls(header, visParams.startDate, visParams.endDate, visParams.minRank, visParams.dateRange, visParams.search);
    streamGraph.initVis();

    // Start with stream graph
    streamGraph.setVisParams(visParams);
    streamGraph.streamGraphInit();

    if (visParams.songGraph) {
      $('#stream-search').val(visParams.search);
      streamGraph.createSongGraph(visParams.search, visParams.startDate, visParams.endDate);
    }
  });
}

module.exports = {
  createLandingScreen: createLandingScreen,
  createVisScreen: createVisScreen
}
