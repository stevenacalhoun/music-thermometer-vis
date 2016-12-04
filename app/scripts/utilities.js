var d3 = require('d3');

module.exports = {
  createDateAggregateKey(startDate, endDate, dateObj) {
    var dateKey
    var timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (diffDays>10*365){
      return new Date(dateObj.getFullYear(),0,1);
    } else {
      return new Date(dateObj.getFullYear(), dateObj.getMonth()-1,1);
    }
  }
}
