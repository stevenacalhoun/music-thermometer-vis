var $ = require('jQuery'),
    settings = require('./settings.js');

module.exports = {
  // Top 100 calls
  getTopChartSongs: function(data, callBack) {
    $.ajax({
      type: "POST",
      url: settings.serverAddress + "/hot_100_entry",
      data: data,
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
