import React, { Component } from 'react';
import ControlPanel from './controls.js';
import '../styles/main.scss';

class AppHeader extends Component {
  render() {
    return (
      <div className='app-header'>
        {/* Spinner */}
        <div id='app-title' className='title'>Music Thermometer</div>
        <ControlPanel></ControlPanel>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <AppHeader></AppHeader>
      </div>
    );
  }
}

export default App;
