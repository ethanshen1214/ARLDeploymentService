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
        this.setState({ 
            savedAuthKey: key.data, savedMongoDb: url.data, savedDownloadPath: path.data});
    }
    handleSubmitAuthKey = async (e) => {
        e.preventDefault();
        await axios.post(`${apiEndpointUrl}/configData/setAuthKey`, { authKey: this.state.authKey });
        this.setState({ authKey: '' });
        this.getData();
    }
    handleSubmitMongoDB = async (e) => {
        e.preventDefault();
        await axios.post(`${apiEndpointUrl}/configData/setMongoURL`, { url: this.state.mongoDb });
        this.setState({ mongoDb: '' });
        this.getData();
    }
    handleSubmitDownloadPath = async (e) => {
        e.preventDefault();
        await axios.post(`${apiEndpointUrl}/configData/setDownloadPath`, { downloadPath: this.state.downloadPath });
        this.setState({ downloadPath: '' });
        this.getData();
    }
    handleChangeAuthKey = (e) => {
        this.setState({authKey: e.target.value});
    }
    handleChangeMongoDB = (e) => {
        this.setState({mongoDb: e.target.value});
    }
    handleChangeDownloadPath = (e) => {
        this.setState({downloadPath: e.target.value});
    }

    render() {
      return (
        <div className='labels' style={{marginLeft: '80px', marginRight: '80px'}}>
            <h1>Configurations</h1>
            <form onSubmit={this.handleSubmitAuthKey} style = {{marginLeft: '20px', marginTop: '10px'}}>
                <div style = {{marginBottom: '10px'}}>
                    <label>Currently Saved Authentication Key: <b>{this.state.savedAuthKey}</b></label>
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>Authentication Key:</label>
                    <input
                        type="text" 
                        value={this.state.authKey} 
                        onChange={this.handleChangeAuthKey} 
                        style={{ marginLeft: '90px', marginRight: '20px', marginBottom: '10px' }}
                        />
                    <input type="submit" value="Save Changes" />
                    <p>(Changes may take a couple seconds to save)</p>
                </div>
            </form>
            <form onSubmit={this.handleSubmitMongoDB} style = {{marginLeft: '20px', marginTop: '10px'}}>
                <div style = {{marginBottom: '10px'}}>
                    <label>Currently Saved MongoDB URL: <b>{this.state.savedMongoDb}</b></label>
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>MongoDB Endpoint URL: </label>
                    <input
                        type="text" 
                        value={this.state.mongoDb} 
                        onChange={this.handleChangeMongoDB} 
                        style={{ width: '650px', marginLeft: '50px', marginRight: '10px', marginBottom: '10px '}}
                        />
                    <input type="submit" value="Save Changes" />
                    <p>(Changes may take a couple seconds to save)</p>                    
                </div>
            </form>
            <form onSubmit={this.handleSubmitDownloadPath} style = {{marginLeft: '20px', marginTop: '10px'}}>
                <div style = {{marginBottom: '10px'}}>
                    <label>Currently Saved Download Path: <b>{this.state.savedDownloadPath}</b></label>
                </div>
                <div style = {{marginBottom: '30px'}}>
                    <label>Download Path: </label>
                    <input
                        type="text" 
                        value={this.state.downloadPath} 
                        onChange={this.handleChangeDownloadPath} 
                        style={{ width: '650px', marginLeft: '107px', marginRight: '10px', marginBottom: '10px' }}
                        />
                    <input type="submit" value="Save Changes" />
                    <p>(Changes may take a couple seconds to save)</p>                    
                </div>
            </form>
        </div>
      );
    }
  }