var d3 = require('d3'),
    $ = require('jQuery');

$.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};

module.exports = {
  translate: function(x,y) {
    return "translate("+x+","+y+")";
  },
  unique: function(arr) {
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
        if(!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
  },
  getAggregateSetting: function(startDate, endDate) {

    var timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (diffDays>5*365) {
      return "year";
    }
    else {
      return "month";
    }
  },
  setUrl: function(visParams) {
    var stateStr = "/music-thermometer-vis/?";
    var stateStr = "/?"
    stateStr += "dateRange=" + visParams.dateRange + '&';
    stateStr += "minRank=" + visParams.minRank + '&';
    stateStr += "search=" + visParams.search + '&';
    stateStr += "songGraph=" + visParams.songGraph + '&';
    stateStr += "startDate=" + visParams.startDate + '&';
    stateStr += "endDate=" + visParams.endDate;

    window.history.pushState("app_state", "AppState", stateStr)
  },
  getParameterByName: function(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
}
