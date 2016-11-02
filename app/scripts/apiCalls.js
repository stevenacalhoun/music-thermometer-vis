var $ = require('jQuery'),
    settings = require('./settings.js');

module.exports = {
  /*
    @returns all entries in hot 100 database fitting parameters in 'data'
    @params:
      - startDate: earliest date
      - endDate: latest date
      - country: us or uk or both
      - minRank: minimum rank wanted
  */
   getChartRange: function(params, callBack) {
    ajaxGet(settings.topChartsUrl, params, callBack);
  },

  /*
    @returns entries for a chart of a particular week
    @params:
      - week: week to retrieve
      - country: us or uk or both
      - minRank: minimum rank wanted
  */
  getChartWeek: function(params, callBack) {
    params.startDate = params.week;
    params.endDate = params.week;
    getTopChartSongs(params);
  },

  /*
    @returns all entries in hot 100 database fitting parameters in 'data'
    @params:
      - startDate: earliest date
      - endDate: latest date
      - country: us or uk or both
      - minRank: minimum rank wanted
      - artist: optional artist field
  */
   getChartRange: function(params, callBack) {
    var url = settings.topChartsUrl;
    if (params.artist != null) {
      url += "/" + params.artist;
    }
    console.log(url)
    ajaxGet(url, params, callBack);
  },

  /*
    @returns spotify info for song
    @songId: spotify id for this song
  */
  getSpotifySong: function(songSpotifyId, callBack) {
    this.getSpotifySongs([songSpotifyId], callBack);
  },

  /*
    @returns spotify info for multiple songs
    @songSpotifIds: list of spotify ids
  */
  getSpotifySongs: function(songIds, callBack) {
    var params = {
      "song_spotify_id": songSpotifyIds
    };
    ajaxGet(settings.spotifyUrl, params, callBack);
  },

  /*
    @returns info for song
    @songId: spotify id for this song
  */
  getSongInfo: function(songSpotifyId, callBack) {
    this.getSongsInfo([songSpotifyId], callBack);
  },

  /*
    @returns info for multiple songs
    @songSpotifIds: list of spotify ids
  */
  getSongsInfo: function(songIds, callBack) {
    var params = {
      "songSpotifyIDs": songIds
    };
    console.log(params)
    ajaxGet(settings.songInfoUrl, params, callBack);
  }
}

function generateUriParamString(params) {
  var paramString = "?"
  for (param in params) {
    paramString += param + "=" + params[param] + "&";
  }
  return paramString.substring(0, paramString.length - 1);
}

function ajaxGet(url, params, callBack) {
  $.ajax({
    type: "GET",
    url: settings.serverAddress + url + generateUriParamString(params),
    dataType: "json",
    success: function(data){ callBack(data) },
  });
}
