var d3 = require('d3'),
    $ = require('jquery'),
    tip = require('d3-tip'),
    constants = require('./constants.js');

require('../styles/songGraph.scss');

module.exports = {
  showData: function(data) {
  },
  songGraph: function(data,dateRange) {
    
    // process data
    var ukData, usData;
    for(var i=0;i<data.length;i++){
      if(data[i].key === 'us')
        usData = data[i].values;
      else if(data[i].key === 'uk')
        ukData = data[i].values;
    }

    var usSongs = usData.map(function(d){ return d.key; })
    var ukSongs = ukData.map(function(d){ return d.key; })
    var allSongs = usSongs.concat(ukSongs.filter(function(item){ return usSongs.indexOf(item)<0; }))

    // initialize 
    var x,y,xOverview,yOverview,
      xAxis,yAxis,xOverviewAxis,
      tooltip,brush,
      margin,width,height,marginOverview,heightOverview,
      svg,content,overview,
      defs;

    var gradientPairs=[['#ff4b1f','#1fddff'],['#ef32d9','#89fffd']]
    var cWidth = document.body.clientWidth

    
    var margin =  { top: cWidth*0.05, right: cWidth*0.1, bottom: cWidth*0.1, left: cWidth*0.1 },
      rectHeight=15,boxHeight=60,
      width = document.body.clientWidth*0.5 - margin.left - margin.right,
      height = boxHeight*allSongs.length;



      x = d3.scaleTime()
          .range([0,width]);

      y = d3.scaleBand()
          .rangeRound([0,height])


      $("<div id='songGraph'></div>").appendTo("body");

      svg = d3.select("#songGraph").append("svg")
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
          .attr("transform", translate(margin.left,margin.top))
     
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
      y.domain(allSongs)


      var ukColor = d3.scaleLinear().domain([1,100])
      .interpolate(d3.interpolateRgb)
      .range([d3.color(gradientPairs[0][0]), d3.color(gradientPairs[0][1])])

      var usColor = d3.scaleLinear().domain([1,100])
      .interpolate(d3.interpolateRgb)
      .range([d3.color(gradientPairs[1][0]), d3.color(gradientPairs[1][1])])

      
      var xa = d3.axisTop(x)
      var ya = d3.axisLeft(y)
      xAxis.call(xa);
      yAxis.call(ya);

      var bases = content.selectAll(".base")
                .data(allSongs);

            bases.exit().remove();

            bases.enter().append("rect")
                  .attr("class", "base")
                  .merge(bases)
                    .attr("transform", function(d,i){
                      return translate(0,(y(d)+boxHeight/2));
                    })
                  .attr("height", rectHeight/2)
                  .attr("width", width)
                  .attr("fill", "rgba(200,200,200,.2)")


      var ukGroups = content.selectAll(".ukGroup")
          .data(ukData);

      ukGroups.exit().remove();

      ukGroups.enter().append("g")
              .attr("class", "ukGroups")
            .merge(ukGroups)
              .attr("transform", function(d,i){
                return translate(0,(y(d.key)+boxHeight/2+rectHeight*0.5));
              })

      

      var ukBars = svg.selectAll(".ukGroups").selectAll(".ukBar")
          .data(function(d){return d.values; });
          
      ukBars.exit().remove()

      ukBars.enter().append("rect")
          .merge(ukBars)
            .attr('class','ukBar')
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
                return ukColor(d.rank);
            })
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide)
            .on('click',function(d){
              if(d.id){
                var src = 'https://embed.spotify.com/?uri='+d.albumArtLink;
                $('iframe').attr('src',src);
              }
              else{
                alert('This song does not have a Spotify link');
              }
            });


      var usGroups = content.selectAll(".usGroup")
          .data(usData);

      usGroups.exit().remove();

      usGroups.enter().append("g")
              .attr("class", "usGroups")
            .merge(usGroups)
              .attr("transform", function(d,i){
                return translate(0,(y(d.key)+boxHeight/2-rectHeight));
              })

      

      var usBars = svg.selectAll(".usGroups").selectAll(".usBar")
          .data(function(d){return d.values; });
          
      usBars.exit().remove()

      usBars.enter().append("rect")
          .merge(usBars)
            .attr('class','usBar')
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
                return usColor(d.rank);
            })
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide)
            .on('click',function(d){
              if(d.id){
                var src = 'https://embed.spotify.com/?uri='+d.albumArtLink;
                $('iframe').attr('src',src);
              }
              else{
                alert('This song does not have a Spotify link');
              }
            });

      //add zoom function
      var zoom = d3.zoom()
            .scaleExtent([1,10])
            // .translateExtent([[-100, -100], [width + 90, height + 100]])
            .on("zoom", zoomed);

      svg.call(zoom);

      

      function zoomed(){
        rects.attr("transform", d3.event.transform)
        xAxis.call(xa.scale(d3.event.transform.rescaleX(x)));
      }


      // add Spotify play button
      var playerWidth=640,playerHeight=180;

      $('<iframe src="https://embed.spotify.com/?uri=spotify:track:5JunxkcjfCYcY7xJ29tLai" width="'+playerWidth+'" height="'+playerHeight+'" frameborder="0" allowtransparency="true"></iframe>').appendTo('body');




      // add us legend
      var legendWidth = 60, legendHeight = 200,
          legendMargin = {top: 20, left:20, bottom: 20, right:20 }

      addGradient(gradientPairs[1][0],gradientPairs[1][1],'usGradient');

      var legend = svg.append('g')
            .attr('class','legend')

      legend.append("rect")
        .attr("width", legendWidth - legendMargin.left - legendMargin.right)
        .attr("height", legendHeight - legendMargin.top-legendMargin.bottom)
        .style("fill", "url(#usGradient)")
        .attr("transform", translate(width+margin.left+legendMargin.left,margin.top));

      var gradientY = d3.scaleLinear()
        .range([legendHeight - legendMargin.top-legendMargin.bottom, 0])
        .domain([100, 0]);

      var gradientYAxis = d3.axisRight(gradientY);

      legend.append("g")
        .attr("class", "gradientYAxis")
        .attr("transform", translate(width+margin.left-legendMargin.right+legendWidth,margin.top))
        .call(gradientYAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 30).attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("US Ranking")
          .attr('fill', 'rgba(0,0,0,1)');



      // add uk legend

      var space = 50;

      addGradient(gradientPairs[0][0],gradientPairs[0][1],'ukGradient');


      legend.append("rect")
        .attr("width", legendWidth - legendMargin.left - legendMargin.right)
        .attr("height", legendHeight - legendMargin.top-legendMargin.bottom)
        .style("fill", "url(#ukGradient)")
        .attr("transform", translate(width+margin.left+legendMargin.left,margin.top+space+legendHeight));


      legend.append("g")
        .attr("class", "gradientYAxis")
        .attr("transform", translate(width+margin.left-legendMargin.right+legendWidth,margin.top+space+legendHeight))
        .call(gradientYAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 30).attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("UK Ranking")
          .attr('fill', 'rgba(0,0,0,1)');


      function translate(x,y){               
        return "translate(" + x + "," + y + ")";
      };

      function addGradient(color1, color2, id){

          var gradient = svg.append("defs")
                  .append("linearGradient")
                  .attr("id", id)
                  .attr("x1", "100%")
                  .attr("y1", "0%")
                  .attr("x2", "100%")
                  .attr("y2", "100%")
                  .attr("spreadMethod", "pad");

                gradient.append("stop")
                  .attr("offset", "0%")
                  .attr("stop-color", color1)
                  .attr("stop-opacity", 1);

                gradient.append("stop")
                  .attr("offset", "100%")
                  .attr("stop-color", color2)
                  .attr("stop-opacity", 1);
      
      }

  }
}

