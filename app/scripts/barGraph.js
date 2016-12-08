var d3 = require('d3'),
    $ = require('jQuery'),
    tip = require('d3-tip'),
    constants = require('./constants.js');

require('../styles/streamGraph.scss');

module.exports = {
  showData: function(data) {
  },
  barGraph: function(data,id) {



    init();
    draw(data);




    var x,y,xOverview,yOverview,
      xAxis,yAxis,xOverviewAxis,
      tooltip,brush,
      margin,width,height,marginOverview,heightOverview,
      svg,content,overview,
      defs,
      songMap;


    function init(){

      margin =  { top: 20, right: 50, bottom: 100, left: 50 };
      width = 960 - margin.left - margin.right;
      height = 500 - margin.top - margin.bottom;
      marginOverview = { top: 430, right: margin.right, bottom: 20,  left: margin.left };
      heightOverview = 500 - marginOverview.top - marginOverview.bottom;

      x = d3.scaleTime()
          .range([0,width]);

      y = d3.scaleLinear()
          .rangeRound([height, 0])

      xOverview = d3.scaleTime()
          .range([0,width]);

      yOverview = d3.scaleLinear()
          .rangeRound([heightOverview, 0])

      $("<div id='"+id+"'+></div>").appendTo("body");

      svg = d3.select("#"+id).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)


      defs = svg.append('defs');
      addPattern('default',require('../images/default.png'))


      content = svg.append("g")
          .attr('class','content')
          .attr("transform", translate(margin.left, margin.top + 0.5))

      overview = svg.append("g")
          .attr('class','overview')
          .attr("transform", translate(marginOverview.left, marginOverview.top + 0.5))


      xAxis = content.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")

      yAxis= content.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(0,0)")

      xOverviewAxis = overview.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + heightOverview + ")")




      tooltip = tip()
        .attr('class', 'd3-tip')
        .offset([-10,0])
        .html(function(d){
          var content = '<p>Song: '+d.title+'</p>'+
              '<p>Rank: '+d.rank+'</p>'+
              '<p>Artist: '+d.artist+'</p>'+
              '<p>Week: '+d.chart_week.substring(0,10)+'</p>';
          return content;
        });

      svg.call(tooltip);

      brush = d3.brushX()
        .on("brush", brushed);

      overview.append("g")
          .attr("class", "x brush")
          .call(brush)
    }


   function draw(data) {


      var drawData=[];

      songMap = d3.map(); // map from songName to pattern id


      for(var i=0;i<data.length;i++){

          var temp={date:data[i].key};

          data[i].values.forEach(function(song){

            if(!songMap.has(song.key)){

                var link = song.values[0].albumArtLink;
                if(link!== null && link!==undefined){
                  var id = 'img'+song.key.replace(/[\s+,']/g, '');
                  addPattern(id, link);
                  song.values.forEach(function(v){
                    v.patternId = id;
                  });

                  songMap.set(song.key, id);
                }
            }

          });

          drawData.push(temp);
      }





      var dates = data.map(function(d){ return new Date(d.key); });
      var maxDate = Math.max.apply(null, dates);
      var minDate = Math.min.apply(null, dates);

      var max = d3.max(data, function(d){
          var values=d.values;
          var sum=values.reduce(function(acc,o){ return acc+o.values.length; },0);
          return sum;
      });

      var boxheight = max<20 ? 45 : 20;
      var boxheightOverview = max<20 ? 6 : 2;

      var num1 = height/boxheight
      var num2 = heightOverview/boxheightOverview
    //Math.floor(heightOverview/max2);

      x.domain([minDate,maxDate])
      y.domain([0, num1])

      xOverview.domain([minDate,maxDate]);
      yOverview.domain([0, num2])



      var color = d3.scaleOrdinal(d3.schemeCategory20)
          .domain(songMap.keys())

      data.forEach(function(group){

        var y0 = 0;
        group.values.forEach(function(type){

          type.offsets = {y0: y0, y1: y0 += type.values.length, value : type.values.length}

          });

      });


      xAxis.call(d3.axisBottom(x));
      yAxis.call(d3.axisLeft(y));
      xOverviewAxis.call(d3.axisBottom(xOverview));


      var groups = content.selectAll(".group")
          .data(data);

      groups.exit().remove();

      groups.enter().append("g")
              .attr("class", "group")
            .merge(groups)
              .attr("transform", function(d,i){
                return "translate(" + x(new Date(d.key)) + ", 0)"
              })


      var types = content.selectAll(".group").selectAll(".type")
          .data(function(d){return d.values})
      types.exit().remove();

      types.enter().append("g")
            .merge(types)
            .attr("transform", function(d){ return translate(0,y(d.offsets.y1))})
            .attr("class", "type")


      var rects = svg.selectAll(".type").selectAll("rect")
          .data(function(d){return d.values; });

      rects.exit().remove()

      rects.enter().append("rect")
          .merge(rects)
            .attr("height", boxheight)
            .attr("width", boxheight)
            .attr("y", function(d,i){ return boxheight * i})
            .attr("fill", function(d,i){
              if(songMap.has(d.title))
                return 'url(#'+songMap.get(d.title)+')';
              else
                return 'url(#default)';
            })
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide)
            .on('click',function(d){
              if(d.albumArtLink){
                var src = 'https://embed.spotify.com/?uri='+d.albumArtLink;
                $('iframe').attr('src',src);
              }
            });


      var groupsOverview = overview.selectAll(".group")
          .data(data)

      groupsOverview.exit().remove();

      groupsOverview.enter().append("g")
            .merge(groupsOverview)
              .attr("transform", function(d,i){return "translate(" + xOverview(new Date(d.key)) + ", 0)"})
              .attr("class", "group overview")


      var typesOverview = overview.selectAll(".group").selectAll(".type")
          .data(function(d){return d.values})

      typesOverview.exit().remove();

      typesOverview.enter().append("g")
          .merge(typesOverview)
            .attr("transform", function(d){ return translate(0,yOverview(d.offsets.y1))})
            .attr("class", "type overview")


      var rectsOverview = overview.selectAll(".type").selectAll("rect")
          .data(function(d){return d.values; })

      rectsOverview.exit().remove();

      rectsOverview.enter().append("rect")
          .merge(rectsOverview)
            .attr("height", boxheightOverview)
            .attr("width", boxheightOverview)
            .attr("y", function(d,i){ return boxheightOverview * i })
            .attr("fill", function(d){ return color(d.title);})

    }


    function brushed() {
      var selection = d3.event.selection;
      var range = selection.map(xOverview.invert, xOverview);
      x.domain(range);
      content.selectAll(".group")
          .attr("transform", function(d) {
              var date = new Date(d.key)
              if(date>=range[0] && date<=range[1])
                return "translate(" + x(date) + ",0)";
              else
                return "translate(960,0)";
          })
      xAxis.call(d3.axisBottom(x));
    }

    function addPattern(id,link){

        defs.append('pattern')
          .attr("patternUnits", "objectBoundingBox")
          .attr('id',id)
          .attr('height','100%')
          .attr('width','100%')
          .attr('viewBox','0 0 1 1')
          .append('image')
          .attr('preserveAspectRatio','xMidYMid slice')
          .attr('height','1')
          .attr('width','1')
          .attr('xlink:href',link)

    }

    function translate(x,y){
      return "translate(" + x + "," + y + ")";
    };


  // var boxheight = 40;
  // var data = [];
  // var rangeMonth = 12;
  // var today = new Date(Date.now());

  // for (i=0; i < 100; i++) {
  //   data.push({
  //     a : ((Math.random() * 5) | 0),
  //     b : ((Math.random() * 2) | 0),
  //     c : ((Math.random() * 5) | 0),
  //     date : new Date(today.getYear()+1900, today.getMonth()+Math.random()*rangeMonth)
  //   });
  // }

  // var margin = {top: 20, right: 80, bottom: 80, left: 40},
  //     width = boxheight * 1.4 * 12;

  // var translate = function(x,y){
  //   return "translate(" + x + "," + y + ")";
  // }

  // var max = d3.max(data, function(d){return d.a + d.b + d.c});
  // var height = max * boxheight;

  // var dates = data.map(function(d){ return d.date; });
  // var maxDate = Math.max.apply(null, dates);
  // var minDate = Math.min.apply(null, dates);

  // var x = d3.scaleTime()
  //     .range([0,width])
  //     .domain([minDate,maxDate]);


  // var y = d3.scaleLinear()
  //     .domain([0, max])
  //     .rangeRound([height, 0])


  // $("<div id='main'></div>").appendTo("body");

  // var svg = d3.select("#main").append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom)
  //     .append("g")
  //     .attr("transform", translate(margin.left, margin.top + 0.5))

  // svg.append('defs')
  //   .append('pattern')
  //   .attr("patternUnits", "userSpaceOnUse")
  //   .attr('id','img')
  //   .attr('x','0')
  //   .attr('y','0')
  //   .attr('height','38')
  //   .attr('width','38')
  //   .append('image')
  //   .attr('x','0')
  //   .attr('y','0')
  //   .attr('height','38')
  //   .attr('width','38')
  //   .attr('xlink:href',require("../images/test.png"))

  // var color = d3.scaleOrdinal(d3.schemeCategory10)
  //     .domain(["a", "b", "c"])

  // data.forEach(function(d){
  //   var y0 = 0;
  //   d.offsets = color.domain().map(function(type){
  //     return {type: type, y0: y0, y1: y0 += +d[type], value : d[type]}
  //   });
  // });

  // var tooltip = tip()
  //   .attr('class', 'd3-tip')
  //   .offset([-10,0])
  //   .html(function(d){
  //     return 'tooltip example';
  //   });

  // svg.call(tooltip);

  // var xAxis = d3.axisBottom(x);


  // svg.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(xAxis);


  // console.log('bargraph data');
  // console.log(data);

  // var groups = svg.selectAll(".group")
  //     .data(data)
  //       .enter().append("g")
  //         .attr("transform", function(d,i){return "translate(" + (x(d.date)-38/2) + ", 0)"})
  //         .attr("class", "group")

  // var types = groups.selectAll(".type")
  //     .data(function(d){return d.offsets})
  //     .enter().append("g")
  //       .attr("transform", function(d){ return translate(0,y(d.y1))})
  //       .attr("class", "type")

  // types.selectAll("rect")
  //     .data(function(d){return d3.range(0,d.value)})
  //     .enter().append("rect")
  //       .attr("height", boxheight-2)
  //       .attr("width", boxheight-2)
  //       .attr("y", function(d){ return boxheight * d })
  //       .attr("fill", "url(#img)")
  //       .on('mouseover', tooltip.show)
  //       .on('mouseout', tooltip.hide)


  }
}
