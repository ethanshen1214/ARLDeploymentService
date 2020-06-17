import React, {Component} from 'react';
import '../App.css';

export default class HomeScreen extends Component {
    render() {
      return (
        // <div>
        //   <h1>Welcome to GitLab Deployment Util</h1>
        //   <li>To get started, press start below.</li>
        //   <li>If you need help, select the help option.</li>
        //   <Link to='/view'>Start</Link>
        //   {' | '}
        //   <Link to='/help'>Help</Link> https://i.pinimg.com/originals/ce/52/58/ce52586df612cbdf0a20a8088ac8add4.png
        // </div>
        <div className = 'labels'>
          <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center', marginTop:'50px'}}>
            <img src = 'https://i.pinimg.com/originals/ce/52/58/ce52586df612cbdf0a20a8088ac8add4.png' ></img>
            <img src = 'http://www.getmdl.io/assets/demos/dog.png' ></img>
          </div>
          <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center', marginTop:'50px'}}>
            <h2>Get started on the config page</h2>
          </div>
        </div>
        
      );
    }
  }