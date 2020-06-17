import React, {Component} from 'react';
import '../App.css';
import axios from 'axios';

const apiEndpointUrl = process.env.REACT_APP_API_ENDPOINT_URL || 'http://localhost:8080';

export default class ConfigScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authKey: '',
            mongoDb: '',
        };
    }
    componentDidMount(){
        
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        axios.post(`${apiEndpointUrl}/database/connect`, { url: this.state.mongoDb });
    }
    handleChange1 = (e) => {
        this.setState({authKey: e.target.value});
    }
    handleChange2 = (e) => {
        this.setState({mongoDb: e.target.value});
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
                        value={this.state.authKey} 
                        onChange={this.handleChange1} 
                        />
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>MongoDB Endpoint URL: </label>
                    <input
                        type="text" 
                        value={this.state.mongoDb} 
                        onChange={this.handleChange2} 
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