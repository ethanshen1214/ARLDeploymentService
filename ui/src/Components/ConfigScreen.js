import React, {Component} from 'react';
import '../App.css';

export default class ConfigScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authKey: '',
            mongoDb: '',
        };
    }
    handleChange = (e) => {
        
    }

    render() {
      return (
        <div className='labels' style={{marginLeft: '80px', marginRight: '80px'}}>
            <h1>Configurations</h1>
            <form onSubmit={this.handleSubmit} style = {{marginLeft: '20px', marginTop: '10px'}}>
                <div style = {{marginBottom: '30px'}}>
                    <label>Authentication Key: </label>
                    <input
                        type="text" 
                        value={this.state.value} 
                        onChange={this.handleChange} 
                        />
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>MongoDB Endpoint URL: </label>
                    <input
                        type="text" 
                        value={this.state.value} 
                        onChange={this.handleChange} 
                        />
                </div>
                <div>
                    <input type="submit" value="Save Changes" />
                </div>
                
            </form>
        </div>
      );
    }
  }