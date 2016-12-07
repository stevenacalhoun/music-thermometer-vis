var d3 = require('d3'),
    $ = require('jquery'),
    tip = require('d3-tip'),
    constants = require('./constants.js');

require('../styles/songGraph.scss');

module.exports = {
  showData: function(data) {
  },
  songGraph: function(data,id,dateRange) {
    
    

    var songs = data.map(function(d){ return d.key; })


    var x,y,xOverview,yOverview,
      xAxis,yAxis,xOverviewAxis,
      tooltip,brush,
      margin,width,height,marginOverview,heightOverview,
      svg,content,overview,
      defs;


    var margin =  { top: 200, right: 50, bottom: 100, left: 100 },
      rectHeight=10,boxHeight=20,
      width = 560 - margin.left - margin.right,
      height = boxHeight*songs.length;

      x = d3.scaleTime()
          .range([0,width]);

      y = d3.scaleBand()
          .rangeRound([0,height])


      $("<div class='songGraph' id='"+id+"'+></div>").appendTo("body");

      svg = d3.select("#"+id).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)




      content = svg.append("g")
          .attr('class','content')
          .attr("transform", translate(margin.left, margin.top))
          .attr('clip-path', 'url(#plotAreaClip)')

      content.append('clipPath')
        .attr('id', 'plotAreaClip')
        .append('rect')
        .attr('width', width)
        .attr('height', height);

      xAxis = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", translate(margin.left,height+margin.top))
     
      yAxis= svg.append("g")
          .attr("class", "y axis")
          .attr("transform", translate(margin.left,margin.top))
    
      tooltip = tip()
        .direction('e')
        .attr('class', 'd3-tip')
        .offset([80,0])
        .html(function(d){
          var content = '<p>Song: '+d.title+'</p>'+
              '<p>Rank: '+d.rank+'</p>'+
              '<p>Artist: '+d.artist+'</p>'+
              '<p>Week: '+d.chart_week.substring(0,10)+'</p>';
          return content;
        });


      svg.call(tooltip);



      var maxDate = dateRange.endDate;
      var minDate = dateRange.startDate;


      x.domain([minDate,maxDate])
      y.domain(songs)


      var color = d3.scaleLinear().domain([1,100])
      .interpolate(d3.interpolateRgb)
      .range([d3.color("#ef32d9"), d3.color('#89fffd')])


      
      var xa = d3.axisBottom(x)
      var ya = d3.axisLeft(y)
      xAxis.call(xa);
      yAxis.call(ya);


      var groups = content.selectAll(".group")
          .data(data);

      groups.exit().remove();

      groups.enter().append("g")
              .attr("class", "group")
            .merge(groups)
              .attr("transform", function(d,i){
                return translate(0,(y(d.key)+rectHeight/2));
              })

      var bases = content.selectAll(".base")
          .data(data);

      bases.exit().remove();

      bases.enter().append("rect")
            .attr("class", "base")
            .merge(bases)
              .attr("transform", function(d,i){
                return translate(0,(y(d.key)+rectHeight/4*3));
              })
            .attr("height", rectHeight/2)
            .attr("width", width)
            .attr("fill", "rgba(200,200,200,.1)")

      var rects = svg.selectAll(".group").selectAll("rect")
          .data(function(d){return d.values; });
          
      rects.exit().remove()

      rects.enter().append("rect")
          .merge(rects)
            .attr("height", rectHeight)
            .attr("width", function(d){

              var thisWeek = new Date(d.chart_week);
              var nextWeek = new Date(d.chart_week);
              nextWeek.setDate(nextWeek.getDate()+7);

              return x(nextWeek)-x(thisWeek);

            })
            .attr("x", function(d){ 

              var thisWeek = new Date(d.chart_week);

              return x(thisWeek);

            })
            .attr("fill", function(d){
                return color(d.rank);
            })
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide)
            .on('click',function(d){
              if(d.albumArtLink){
                var src = 'https://embed.spotify.com/?uri='+d.albumArtLink;
                $('iframe').attr('src',src);
              }
            });


      var zoom = d3.zoom()
            .scaleExtent([1,10])
            // .translateExtent([[-100, -100], [width + 90, height + 100]])
            .on("zoom", zoomed);

      svg.call(zoom);

      function zoomed(){
        rects.attr("transform", d3.event.transform)
        xAxis.call(xa.scale(d3.event.transform.rescaleX(x)));
      }





    function translate(x,y){               
      return "translate(" + x + "," + y + ")";
    };


  }
}

