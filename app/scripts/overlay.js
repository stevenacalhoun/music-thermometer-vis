var $ = require('jQuery')
    controls = require('./controls.js');

require('../styles/overlay.scss');

function createOverlay() {
  var overlayContainer = $("<div id='overlay-parent'></div>").appendTo('body');
  $("<div class='curtain'></div>").appendTo(overlayContainer);

  var overlayParent = $("<div class='overlay'></div>").appendTo(overlayContainer);
  overlayParent.append($("<div class='overlay-title'>Help</div>"))

  var closeButton = controls.createButton("Close");
  closeButton.addClass('overlay-exit-button')
  closeButton.on("click", function() {
    $('#overlay-parent').remove();
  })
  overlayParent.append(closeButton);
}

module.exports = {
  createOverlay: createOverlay
}
