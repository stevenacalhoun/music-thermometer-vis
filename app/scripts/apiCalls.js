var $ = require('jQuery'),
    utilities = require('./utilities.js'),
    d3 = require('d3');

var serverAddress = "https://immense-badlands-95769.herokuapp.com/api/";
// var serverAddress = "http://localhost:3000/api/";

/*
  @returns all entries in hot 100 database fitting parameters in 'data'
  @country: us or uk or both
  @dateRange:
    - startDate: earliest date
    - endDate: latest date
  @callback
  @minRank: optional minimum rank wanted
*/
function getChartRange(dateRange, aggregateSetting, callBack, minRank) {
  var params = dateRange;
  params.minRank = minRank;
  params.aggregateSetting = aggregateSetting;
  ajaxGet('charts/both', params, callBack);
}

/*
  @returns song info and chartweek
  @artist: artist to lookup
  @dateRange:
  - startDate: earliest date
  - endDate: latest date
*/
function getArtistSongs(artist, startDate, endDate, callback) {
  var params = {
    'startDate': startDate,
    'endDate': endDate
  };
  ajaxGet('artist/'+artist, params, function(rawData) {
    callback(rawData);
  })
}

// Helper to generate list of url params
function generateUriParamString(params) {
  var paramString = "?"
  for (param in params) {
    paramString += param + "=" + params[param] + "&";
  }
  return paramString.substring(0, paramString.length - 1);
}

// Helper to run ajax get with params and callback
function ajaxGet(url, params, callBack) {
  $.ajax({
    type: "GET",
    url: serverAddress + url + generateUriParamString(params),
    dataType: "json",
    success: function(data){ callBack(data) },
  });
}

module.exports = {
  "ajaxGet": ajaxGet,
  "getArtistSongs": getArtistSongs,
  "getChartRange": getChartRange
}
