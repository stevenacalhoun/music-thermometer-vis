import React from 'react';
import {render} from 'react-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
const Range = Slider.Range;

var $ = require('jQuery'),
    streamGraph = require('./streamGraph.js'),
    d3 = require('d3'),
    utilities = require('./utilities.js'),
    colors = require('./colors.js');

const yearOptions = [
  {"name": "1 Year", "value": 1},
  {"name": "2 Years", "value": 2},
  {"name": "5 Years", "value": 5},
  {"name": "10 Years", "value": 10}
]

const style = {
  display: 'inline-block',
  width:document.body.clientWidth/2,
}

const handleStyle = {
  display: 'None'
}

const trackStyle = {
  height: '30px',
  backgroundColor: colors.accentColor,
  borderRadius: 0
}

const railStyle = {
  height: '30px',
  borderRadius: 0
}

const marks = {
  365: "year 1",
  730: "year 2",
}

const minDate = new Date(1960,0,1);
const maxDate = new Date(2015,12,31);
const timeDiff = Math.abs(maxDate.getTime() - minDate.getTime());
const maxDay = Math.ceil(timeDiff / (1000 * 3600 * 24));

const initialStartDate = new Date(2009,1,1);
const initialEndDate = new Date(2009,12,31);

require('../styles/controls.scss');

var sliderScale, brush, maxSliderDate;

class ControlPanel extends React.Component {
  render() {
    return (
      <div id='controls'>
        <div id='controls-top' className='controls'>
          <DateController></DateController>
          <InputField labelText="Min. Song Rank" startingVal={100} id="min-rank-value"></InputField>
          <UpdateButton text="Update" id="apply-filters-button"></UpdateButton>
        </div>
        <div id='controls-bot' className='controls'>
          <SearchBar></SearchBar>
        </div>
      </div>
    );
  }
}

class DateController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lowerBound: 20,
      upperBound: 40,
      value: [20, 40]
    }
  }
  render () {
    return (
      <div style={style}>
        <Range allowCross={false} marks={marks} pushable={365} min={0} max={maxDay} defaultValue={[dateToDayNumber(initialStartDate),dateToDayNumber(initialEndDate)]} trackStyle={[trackStyle]} handleStyle={[handleStyle,handleStyle]} railStyle={railStyle}></Range>
      </div>
    )
  }
}

function dateToDayNumber(date) {
  const timeDiff = Math.abs(date.getTime() - minDate.getTime());
  const dayNumber = Math.ceil(timeDiff / (1000 * 3600 * 24));
  console.log(dayNumber)
  return dayNumber
}

// class DateController extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       startDate: new Date(2009, 0, 1),
//       endDate: new Date(2009, 11, 31),
//       yearWidth: 1
//     }
//     this.handleDropdownChange = this.handleDropdownChange.bind(this);
//   }
//
//   handleDropdownChange(event) {
//     const newDates = getDatesWithNewWidth(this.state.startDate, this.state.endDate, event.target.value);
//     this.setState({
//       yearWidth: event.target.value,
//       startDate: newDates.startDate,
//       endDate: newDates.endDate
//     })
//
//   }
//
//   componentDidMount() {
//   }
//
//   componentDidUpdate() {
//   }
//
//   render() {
//     return (
//       <div style={{display: 'inline'}}>
//         <Slider startDate={this.state.startDate} endDate={this.state.endDate}></Slider>
//         <Dropdown handleChange={this.handleDropdownChange} options={yearOptions} value={this.state.yearWidth}></Dropdown>
//       </div>
//     )
//   }
// }
//
// class Dropdown extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       options: [],
//       value: this.props.yearWidth,
//     }
//
//     for(var option in this.props.options) {
//       var optionInfo = this.props.options[option];
//       this.state.options.push(
//         <SelectOption key={optionInfo.value} value={optionInfo.value} name={optionInfo.name}></SelectOption>
//       )
//     }
//   }
//
//   render() {
//     return (
//       <div className='control-piece select-box'>
//         <div className="number-input-label">Date Range</div>
//         <span className="select-container">
//           <select id={this.props.id} value={this.state.value} onChange={this.props.handleChange}>
//             {this.state.options}
//           </select>
//           <span className='genericon genericon-downarrow'></span>
//         </span>
//       </div>
//     );
//   }
// }
//
// class SelectOption extends React.Component {
//   render() {
//     return (
//       <option value={this.props.value}>{this.props.name}</option>
//     )
//   }
// }
//
class InputField extends React.Component {
  render() {
    return (
      <div className='control-piece number-input-parent'>
        <div className='number-input-label'>
          {this.props.labelText}
        </div>
        <input onChange={function(){}} className='number-input-box' id={this.props.id} type='number' name='rank' min='1' max='100' value={this.props.startingVal} />
      </div>
    )
  }
}

class UpdateButton extends React.Component {
  render() {
    return (
      <div className='control-piece button-parent'>
        <div className='button' id='filter-button'>
          <div id='{this.props.id}' className='button-text'>
            {this.props.text}
          </div>
        </div>
      </div>
    );
  }
}

class SearchBar extends React.Component {
  render() {
    return (
      <div className='search-parent'>
        <div className='search-icon'>
          <span className='genericon genericon-search'></span>
        </div>
        <input placeholder='Type in artist' className='control-piece search-input-box' id={this.props.id} value={this.starting}></input>
        <div className='search-clear'>
          <span id='search-clear-button' className='genericon genericon-search'></span>
        </div>
      </div>
    );
  }
}

class DateSlider extends React.Component {

}

// class Slider extends React.Component {
//   constructor(props) {
//     super(props);
//     this.createSlider = this.createSlider.bind(this);
//   }
//
//   componentDidMount() {
//     this.createSlider();
//   }
//
//   componentDidUpdate() {
//     this.createSlider();
//   }
//
//   createSlider() {
//     const node = this.node;
//     var labelWidth = 120;
//
//     // Sizes
//     var margin = {top: 0, right: 20, bottom: 20, left: 0},
//         width = (document.body.clientWidth/2) - margin.left - margin.right,
//         height = 50 - margin.top - margin.bottom;
//
//     // Scale
//     sliderScale = d3.scaleTime()
//       .domain([new Date(1960,0,1), new Date(2015,12,31)])
//       .rangeRound([0, width-labelWidth]);
//
//     // Axis object
//     var xAxis = d3.axisBottom(sliderScale)
//       .tickSize(-height)
//       .tickFormat(function() { return null; });
//
//     // Brush object
//     brush = d3.brushX()
//       .extent([[0,0], [width-labelWidth,height]])
//       .on("brush", function() {
//         brushed(sliderScale)
//       })
//
//     // Main container
//     var svg = d3.select(node)
//         .attr("width", width + margin.right + margin.left)
//         .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//         .attr("transform", utilities.translate(margin.left, margin.top))
//
//     var textGroup = svg.append("g")
//       .attr("transform", utilities.translate(width-labelWidth, 0))
//
//     textGroup.append("text")
//       .attr("id", "slider-start-label")
//       .attr("class", "date-label")
//       .attr("transform", utilities.translate(30, 10))
//       .text(this.props.startDate)
//
//     textGroup.append("text")
//     .attr("id", "slider-end-label")
//       .attr("class", "date-label")
//       .attr("transform", utilities.translate(30, 35))
//       .text(this.props.endDate)
//
//     // Axis at bottom
//     svg.append("g")
//         .attr("class", "axis slider-axis")
//         .attr("transform", utilities.translate(0, height))
//         .call(xAxis)
//
//     // Visual bar
//     svg.append("g")
//         .attr("class", "slider-axis")
//         .attr("transform", utilities.translate(0,height))
//         .call(d3.axisBottom(sliderScale)
//           .tickPadding(0))
//         .attr("text-anchor", null)
//       .selectAll("text")
//         .attr("x", 6);
//
//     // Append brush
//     var brushArea = svg.append("g")
//       .attr("class", "brush")
//       .attr("id", "stream-graph-brush")
//       .call(brush);
//
//     brushArea.call(brush.move, [sliderScale(this.props.startDate), sliderScale(this.props.endDate)])
//   }
//
//   render() {
//     return (
//       <div className='control-piece slider' id='slider-parent'>
//         <svg ref={node => this.node = node} width={this.props.width} height={this.props.height}></svg>
//       </div>
//     );
//   }
// }
//
// function reverseScale(val) {
//   return sliderScale.invert(val);
// }
//
// function getDatesWithNewWidth(startDate, endDate, yearWidth) {
//   // Get end date
//   endDate.setDate(endDate.getDate()+(yearWidth*365));
//
//   // If the late date is past the max date
//   if (endDate > new Date(2015,12,31)) {
//     var difference = endDate - new Date(2015,12,31);
//     endDate = new Date(2015,12,31);
//     startDate = new Date(startDate - difference);
//   }
//
//   return {'startDate': startDate, 'endDate': endDate}
// }
//
// // function updateSliderWidth(years) {
// //   var sliderSelection = d3.brushSelection(d3.select('#stream-graph-brush').node());
// //
// //   startDate = reverseScale(sliderSelection[0]),
// //   endDate = reverseScale(sliderSelection[0]);
// //
// //   // Get end date
// //   endDate.setDate(endDate.getDate()+(years*365));
// //
// //   // If the late date is past the max date
// //   if (endDate > new Date(2015,12,31)) {
// //     var difference = endDate - new Date(2015,12,31);
// //     endDate = new Date(2015,12,31);
// //     startDate = new Date(startDate - difference);
// //   }
// //
// //   // Change slider
// //   d3.select('#stream-graph-brush').call(brush.move, [sliderScale(startDate), sliderScale(endDate)])
// //   updateDateLabels();
// // }
//
// function createSlider(parent, earlyStartingDate, lateStartingDate) {
//   var sliderContainer = $("<div id='slider-parent' class='control-piece slider'></div>").appendTo(parent)
//
//   startDate = earlyStartingDate,
//   endDate= lateStartingDate;
//
//   var labelWidth = 120;
//
//   // Sizes
//   var margin = {top: 0, right: 20, bottom: 20, left: 0},
//       width = (document.body.clientWidth/2) - margin.left - margin.right,
//       height = 50 - margin.top - margin.bottom;
//
//   // Scale
//   sliderScale = d3.scaleTime()
//     .domain([new Date(1960,0,1), new Date(2015,12,31)])
//     .rangeRound([0, width-labelWidth]);
//
//   // Axis object
//   var xAxis = d3.axisBottom(sliderScale)
//     .tickSize(-height)
//     .tickFormat(function() { return null; });
//
//   // Brush object
//   brush = d3.brushX()
//     .extent([[0,0], [width-labelWidth,height]])
//     .on("brush", function() {
//       brushed(sliderScale)
//     })
//
//   // Main container
//   var svg = d3.select('#'+sliderContainer.attr("id")).append("svg")
//       .attr("width", width + margin.right + margin.left)
//       .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//       .attr("transform", utilities.translate(margin.left, margin.top))
//
//   var textGroup = svg.append("g")
//     .attr("transform", utilities.translate(width-labelWidth, 0))
//
//   textGroup.append("text")
//     .attr("id", "slider-start-label")
//     .attr("class", "date-label")
//     .attr("transform", utilities.translate(30, 10))
//
//   textGroup.append("text")
//   .attr("id", "slider-end-label")
//     .attr("class", "date-label")
//     .attr("transform", utilities.translate(30, 35))
//
//   updateDateLabels();
//
//   // Axis at bottom
//   svg.append("g")
//       .attr("class", "axis slider-axis")
//       .attr("transform", utilities.translate(0, height))
//       .call(xAxis)
//
//   // Visual bar
//   svg.append("g")
//       .attr("class", "slider-axis")
//       .attr("transform", utilities.translate(0,height))
//       .call(d3.axisBottom(sliderScale)
//         .tickPadding(0))
//       .attr("text-anchor", null)
//     .selectAll("text")
//       .attr("x", 6);
//
//   // Append brush
//   var brushArea = svg.append("g")
//     .attr("class", "brush")
//     .attr("id", "stream-graph-brush")
//     .call(brush);
//
//   brushArea.call(brush.move, [sliderScale(earlyStartingDate), sliderScale(lateStartingDate)])
// }
//
// function brushed(xScale) {
//   // Code to change when brushed
//   if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
//   var s = d3.event.selection;
//   var startDate = xScale.invert(s[0]);
//   var endDate = xScale.invert(s[1]);
//   updateDateLabels(startDate, endDate);
// };
//
function addSpotifyPreview(link) {
  var audioBoxParent = $("<div id='audio-box-parent' class='audio-box-parent'></div>");
  // var audioBox = $("<audio controls  id='audio-control'></audio>").appendTo(audioBoxParent);
  // audioBox.append($("<source id='audio-track' src='none' type='audio/mpeg'>"));

  return audioBoxParent;
}

// function updateDateLabels(startDate, endDate) {
//   d3.select('#slider-start-label').text("Start Date " + convertDate(startDate))
//   d3.select('#slider-end-label').text("End Date " + convertDate(endDate))
// }
//
function convertDate(date) {
  return (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear();
}

module.exports = ControlPanel;
