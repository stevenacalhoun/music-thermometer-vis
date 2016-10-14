var $ = require('jQuery'),
    settings = require('./settings.js');

module.exports = {
  // Billboard calls
  getChartsForRange: function(earliestDate, latestDate, callBack) {
    $.ajax({
      type: "POST",
      url: settings.serverAddress + "/hot_100_entry",
      data: {
        "earliestDate": earliestDate,
        "latestDate": latestDate
      },
      success: function(data){ callBack(data) },
      dataType: "json"
    });
  },

  getChartWeek: function(week, callBack) {
    getChartsForRange(week, week, callBack);
  },

  // Spotify calls
  getSpotifySong: function(songId) {
    $.ajax({
      type: "GET",
      url: settings.serverAddress + "/spotify_api/?song_id="+songId,
      dataType: "json",
      success: function(data) { callback(data) }
    })
  },
  getSpotifySongs: function(songIds,callback) {
    $.ajax({
      type: "POST",
      url: settings.serverAddress + "/spotify_api",
      data: {
        "ids": songIds
      },
      dataType: "json",
      success: function(data) { callback(data) }
    })
  }
}
