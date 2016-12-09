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
  createDateAggregateKey(startDate, endDate, dateObj) {
    var timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (diffDays>5*365) {
      var returnData = {
        "mode": "year",
        "key": new Date(dateObj.getFullYear(),0,1)
      }
    } else {
      var returnData = {
        "mode": "month",
        "key": new Date(dateObj.getFullYear(), dateObj.getMonth()-1,1)
      }
    }
    return returnData;
  }
}
