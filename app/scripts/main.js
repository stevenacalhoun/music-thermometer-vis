var d3 = require('d3'),
    $ = require('jquery')
    bar = require('./bar.js')
    table = require('./table.js');

var exampleBarData = require('../json/barExample.json');
bar.barGraph(exampleBarData, "example-bar");

var exampleTableData = require('../json/tableExample.json');
table.table(exampleTableData, "example-table");
