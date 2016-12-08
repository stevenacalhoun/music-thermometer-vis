var $ = require('jQuery')
    constants = require('./constants.js'),
    controls = require('./controls.js');

require('../styles/overlay.scss');

function initScreen() {
  $('body').append("<div class='background'></div>");

  var splashContainer = $('<div class="splash-container"></div>').appendTo('body');
  var container = $('<div id="openening-info" class="center-container"></div>').appendTo(splashContainer);
  container.append("<div class='splash-title'>Music Thermometer</div>");
  container.append("<div class='splash-subtitle'>artists' popularity over time</div>");
  container.append("<div class='splash-subtitle-bold'>US vs. UK</div>");
  var nextButton = $("<div class='splash-button'>Find Out More</div>").appendTo(container);

  nextButton.on("click", function() {
    $('#openening-info').fadeOut(500, function() {
      var shade = $("<div id='overlay-shade' class='overlay-shade'></div>").appendTo('body');

      var container = $('<div style="display:none" class="center-container"></div>').appendTo(splashContainer);
      container.append("<div class='splash-text'>"+constants.entry1+"</div>");
      container.append("<div class='splash-text'>"+constants.entry2+"</div>");
      container.append("<div class='splash-text'>"+constants.entry3+"</div>");

      var enterButton = $("<div class='splash-button'>Enter</div>").appendTo(container);

      container.fadeIn(500);
    })
  })
}

function createOverlay() {
  $("<div id='overlay-shade' class='overlay-shade'></div>").appendTo('body');
  // $("<div class='curtain'></div>").appendTo(overlayContainer);

  var helpBoxParent = $("<div id='help-box-parent' class='help-box-parent'></div>").appendTo('body');
  var helpBox = $("<div class='help-box'></div>").appendTo(helpBoxParent);
  helpBox.append($("<div class='help-title'>Help</div>"))

  var closeButton = controls.createButton("Close");
  closeButton.addClass('help-exit-button')
  closeButton.on("click", function() {
    $('#overlay-shade').remove();
    $('#help-box-parent').remove();
  })
  helpBox.append(closeButton);
}

module.exports = {
  createOverlay: createOverlay,
  initScreen: initScreen
}
