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
            downloadPath: '',
            savedAuthKey: '',
            savedMongoDb: '',
            savedDownloadPath: '',
        };
    }
    componentDidMount(){
        this.getData();
    }
    getData = async () => {
        let key = await axios.post(`${apiEndpointUrl}/configData/getAuthKey`);
        let url = await axios.post(`${apiEndpointUrl}/configData/getMongoURL`);
        let path = await axios.post(`${apiEndpointUrl}/configData/getDownloadPath`);
        this.setState({ savedAuthKey: key.data, savedMongoDb: url.data, downloadPath: path.data});
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post(`${apiEndpointUrl}/database/config`, { authKey: this.state.authKey, url: this.state.mongoDb, downloadPath: this.state.downloadPath  });
        this.getData();
    }
    handleChange1 = (e) => {
        this.setState({authKey: e.target.value});
    }
    handleChange2 = (e) => {
        this.setState({mongoDb: e.target.value});
    }
    handleChange3 = (e) => {
        this.setState({downloadPath: e.target.value});
    }

    render() {
      return (
        <div className='labels' style={{marginLeft: '80px', marginRight: '80px'}}>
            <h1>Configurations</h1>
            <form onSubmit={this.handleSubmit} style = {{marginLeft: '20px', marginTop: '10px'}}>
                <div style = {{marginBottom: '30px'}}>
                    <label>Currently Saved Authentication Key: {this.state.savedAuthKey}</label>
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>Authentication Key:</label>
                    <input
                        type="text" 
                        value={this.state.authKey} 
                        onChange={this.handleChange1} 
                        style={{ marginLeft: '50px' }}
                        />
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>Currently Saved MongoDB URL: {this.state.savedMongoDb}</label>
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>MongoDB Endpoint URL: </label>
                    <input
                        type="text" 
                        value={this.state.mongoDb} 
                        onChange={this.handleChange2} 
                        style={{ width: '650px', marginLeft: '10px'}}
                        />
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>Currently Saved Download Path: {this.state.savedDownloadPath}</label>
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>MongoDB Endpoint URL: </label>
                    <input
                        type="text" 
                        value={this.state.downloadPath} 
                        onChange={this.handleChange3} 
                        style={{ width: '650px', marginLeft: '10px'}}
                        />
                </div>
                <div>
                    <input type="submit" value="Save Changes" />
                    <p>(Changes may take a couple seconds to save)</p>
                </div>
                
            </form>
        </div>
      );
    }
  }