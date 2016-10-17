dr = require('d3');

module.exports = {
  showData: function(data) {
    data.forEach(function(d) {
      var container = $('body').append("<div />");
      container.append("<span>"+d.key+","+d.value+","+d.date+"</span>");
    })
  },
  streamGraph: function(data) {
    $('body').append("<div class='chart'></div>");

    var artists = [];
    var dataObject = {};
    data.forEach(function(d){
      // Keep up with all artists
      if ($.inArray(d.key, artists) == -1) {
        artists.push(d.key);
      }

      // Add new entry for date
      if ((d.date in dataObject) == false) {
        dataObject[d.date] = {
          "date": d.date
        };
      }

      dataObject[d.date][d.key] = +d.value;
    });

    // Add artists that aren't in there yet
    Object.keys(dataObject).forEach(function(date) {
      artists.forEach(function(artist){
        if ((artist in dataObject[date]) == false) {
          dataObject[date][artist] = 0;
        }
      })
    })

    // Flatten dictionary
    var dataObjectList = $.map(dataObject, function(d){ return d; });

    var colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    var strokecolor = colorrange[0];
    var datearray = [];

    var margin = {top: 20, right: 40, bottom: 30, left: 30};
    var width = document.body.clientWidth - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "30px")
        .style("left", "55px");

    var x = d3.scaleTime()
        .range([0, width])

    var y = d3.scaleLinear()
        .range([height-10, 0]);

    var z = d3.scaleOrdinal()
        .range(colorrange);

    var xAxis = d3.axisBottom()
        .scale(x)

    var yAxis = d3.axisLeft()
        .scale(y);

    var yAxisr = d3.axisRight()
        .scale(y);

    var stack = d3.stack()
        .keys(artists)

    x.domain(d3.extent(data, function(d) { return new Date(d.date); }));

    var area = d3.area()
        .x(function(d) {
            dateObj = new Date(d.data.date);
            return x(dateObj);
         })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); });

    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var layersData = stack(dataObjectList);

    y.domain([0, d3.max(layersData[layersData.length-1], function(d) { return d[1]; })]);

    svg.selectAll(".layer")
        .data(layersData)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", function(d, i) { return z(i); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxisr);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(d, j) {
          return j != i ? 0.6 : 1;
      })})

      .on("mousemove", function(d, i) {
        mousex = d3.mouse(this);
        mousex = mousex[0];
        var invertedx = x.invert(mousex);
        invertedx = invertedx.getMonth() + invertedx.getDate();

        for (var k = 0; k < d.length; k++) {
          datearray[k] = new Date(d[k].data.date);
          datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
        }

        mousedate = datearray.indexOf(invertedx);
        pro = d[mousedate][0];

        d3.select(this)
        .classed("hover", true)
        .attr("stroke", strokecolor)
        .attr("stroke-width", "0.5px"),
        tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "visible");
      })

      .on("mouseout", function(d, i) {
       svg.selectAll(".layer")
        .transition()
        .duration(250)
        .attr("opacity", "1");
        d3.select(this)
        .classed("hover", false)
        .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "hidden");
      })

    var vertical = d3.select(".chart")
          .append("div")
          .attr("class", "remove")
          .style("position", "absolute")
          .style("z-index", "19")
          .style("width", "1px")
          .style("height", "380px")
          .style("top", "10px")
          .style("bottom", "30px")
          .style("left", "0px")
          .style("background", "#fff");

    d3.select(".chart")
        .on("mousemove", function(){
           mousex = d3.mouse(this);
           mousex = mousex[0] + 5;
           vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){
           mousex = d3.mouse(this);
           mousex = mousex[0] + 5;
           vertical.style("left", mousex + "px")});
   }
}
