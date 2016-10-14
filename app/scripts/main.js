var apiCalls = require('./apiCalls.js'),
    secrets = require('./secrets.js'),
    $ = require('jQuery');

require('../styles/main.scss');

apiCalls.getSpotifySongs(["0eGsygTp906u18L0Oimnem", "0eGsygTp906u18L0Oimnem"], function(data) {
  console.log(data);
});
