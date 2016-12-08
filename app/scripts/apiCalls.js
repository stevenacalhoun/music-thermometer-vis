var $ = require('jQuery'),
    utilities = require('./utilities.js'),
    d3 = require('d3');

var serverAddress = "http://localhost:3000/api/",
    topChartsUrl = 'charts',
    songInfoUrl = 'song',
    spotifyUrl = 'song',
    artistInfoUrl = 'artist';

module.exports = {
  /*
    @returns all entries in hot 100 database fitting parameters in 'data'
    @dateRange:
      - startDate: earliest date
      - endDate: latest date
    @callback
    @minRank: optional minimum rank wanted
  */
  getChartRange: function(dateRange, callBack, minRank=100) {
    var params = dateRange;
    params.minRank = minRank;
    ajaxGet(topChartsUrl, params, callBack);
  },

  /*
    @returns all entries in hot 100 database fitting parameters in 'data'
    @country: us or uk or both
    @dateRange:
      - startDate: earliest date
      - endDate: latest date
    @callback
    @minRank: optional minimum rank wanted
  */
  getChartRangeCountry: function(country, dateRange, callBack, minRank=100) {
    var params = dateRange;
    params.minRank = minRank;
    ajaxGet(topChartsUrl + '/' + country, params, callBack);
  },

  /*
    @returns entries for a chart of a particular week
    @country: us or uk or both
    @week: week to retrieve
    @callback
  */
  getChartWeek: function(week, callBack) {
    var params = {
      "startDate": week,
      "endDate": week
    }
    getChartRange("both", params, callBack);
  },

  /*
    @returns all entries in hot 100 database fitting parameters in 'data'
    @country: us or uk or both
    @artist: specific artist or all
    @dateRange:
      - startDate: earliest date
      - endDate: latest date
    @callback
    @minRank: optional minimum rank wanted
  */
  getChartRangeCountryArtist: function(country, artist, dateRange, callBack, minRank=100) {
    var url = topChartsUrl + "/" + country + "/" + artist;
    var params = dateRange;
    params.minRank = minRank;
    ajaxGet(url, params, callBack);
  },

  /*
    @returns spotify info for song
    @songId: spotify id for this song
  */
  getSongAttributes: function(songId, callBack) {
    this.getSpotifySongs([songId], callBack);
  },

  /*
    @returns spotify info for multiple songs
    @songSpotifIds: list of spotify ids
  */
  getSongsAttributes: function(songIds, callBack) {
    var params = {
      "song_spotify_id": songIds
    };
    ajaxGet(spotifyUrl, params, callBack);
  },

  /*
    @returns info for song
    @songId: spotify id for this song
  */
  getSongInfo: function(songId, callBack) {
    this.getSongsInfo([songId], callBack);
  },

  /*
    @returns info for multiple songs
    @songSpotifIds: list of spotify ids
  */
  getSongsInfo: function(songIds, callBack) {
    var params = {
      "songSpotifyIDs": songIds
    };
    ajaxGet(songInfoUrl, params, callBack);
  },

  /*
    @returns song info and chartweek
    @artist: artist to lookup
    @dateRange:
    - startDate: earliest date
    - endDate: latest date
  */
  getArtistSongs: function(artist, dateRange, callback) {

    var params = dateRange;
    ajaxGet(artistInfoUrl+'/'+artist, params, function(rawData) {

    var data = d3.nest()
        .key(function(d){
          return d.country
        })
        .key(function(d){
          return d.title
        })
        .entries(rawData);

    // var data = d3.nest()
    //     .key(function(d){
    //       return d.country
    //     })
    //     .key(function(d) {
    //       var dateObj = new Date(d.chart_week);
    //       return utilities.createDateAggregateKey(dateRange.startDate, dateRange.endDate, dateObj);
    //     })
    //     .key(function(d){
    //       return d.title
    //     })
    //     .entries(rawData);

    // var data = d3.nest()
    //     .key(function(d) {
    //       var dateObj = new Date(d.chart_week);
    //       return utilities.createDateAggregateKey(dateRange.startDate, dateRange.endDate, dateObj);
    //     })
    //     .rollup(function(leaves){
    //       var count = leaves.length;
    //       var songs = [];
    //       leaves.forEach(function(d){
    //         songs.push({
    //           "title": d.title,
    //           "albumArtLink": d.albumArtLink,
    //           "chartWeek": d.chart_week,
    //           "rank": d.rank
    //         })
    //       });
    //       return {
    //         "count": count,
    //         "songs": songs
    //       }
    //     })
    //     .entries(rawData);
      callback(data);



    })
  }
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
