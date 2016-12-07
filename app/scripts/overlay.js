var $ = require('jQuery')
    controls = require('./controls.js');

require('../styles/overlay.scss');

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
  createOverlay: createOverlay
}
