import React, {Component} from 'react';
import '../App.css';

export default class HomeScreen extends Component {
    render() {  //landing page
      return (
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