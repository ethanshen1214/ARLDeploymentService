import React, { Component } from 'react';
import '../App.css';
import axios from 'axios';
import swal from 'sweetalert';

const apiEndpointUrl = process.env.REACT_APP_API_ENDPOINT_URL || 'http://localhost:8080';

export default class ConfigScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authKey: '',
            gitlab: '',
            mongoDb: '',
            downloadPath: '',
            savedAuthKey: '',
            savedGitlab: '',
            savedMongoDb: '',
            savedDownloadPath: '',
        };
    }
    
    //gets data on mount
    componentDidMount(){
        this.getData();
    }

    //makes api calls to get config data from config.json
    getData = async () => {
        let gitlabUrl = await axios.post(`${apiEndpointUrl}/configData/getGitlabUrl`);
        let url = await axios.post(`${apiEndpointUrl}/configData/getMongoURL`);
        let path = await axios.post(`${apiEndpointUrl}/configData/getDownloadPath`);
        let gitlabHost = gitlabUrl.data.match(/gitlab\..+\.com/g);
        if (gitlabHost === null) {
            gitlabHost = "gitlab.com";
        }
        const result = await axios.post(`${apiEndpointUrl}/gitlabAPI/getProjects`);     //check for valid authentication key
        if(result.data.projects === false){
            this.setState({ 
                savedAuthKey: 'Unauthenticated', 
                savedGitlab: gitlabHost, 
                savedMongoDb: url.data, 
                savedDownloadPath: path.data });
        }
        else{
            this.setState({ 
                savedAuthKey: 'Authenticated', 
                savedGitlab: gitlabHost, 
                savedMongoDb: url.data, 
                savedDownloadPath: path.data });
        }
    }

    //handler for submitting the authentication key and gitlab host url to config.json - displays error returned from api
    handleSubmitAuthKey = async (e) => {
        e.preventDefault();
        const result = await axios.post(`${apiEndpointUrl}/gitlabAPI/getProjects`);
        if(result.data.projects === false) {
            swal({
                title: "Error",
                text: "The authentication key or gitlab host url entered is invalid.\nPlease try entering another authentication key or url.\nUsing previously validated authentication key instead.",
                icon: "warning",
            });
        } else {
            await axios.post(`${apiEndpointUrl}/configData/setAuthKey`, { authKey: this.state.authKey });
            await axios.post(`${apiEndpointUrl}/configData/setGitlabUrl`, { gitlabUrl: `https://${this.state.gitlab}/api/v4` });
        }
        this.setState({ authKey: '' });
        this.getData();
    }

    //handler for submitting mongoDB host url to config.json - displays error returned from api
    handleSubmitMongoDB = async (e) => {
        e.preventDefault();
        const oldDbUrl = await axios.post(`${apiEndpointUrl}/configData/getMongoURL`);
        const result = await axios.post(`${apiEndpointUrl}/configData/setMongoURL`, { url: this.state.mongoDb });
        if (parseInt(result.data) === 0) {
            swal({
                title: "Error",
                text: "The MongoDB Url entered is invalid.\nPlease try entering a valid Url.",
                icon: "warning",
            });
            await axios.post(`${apiEndpointUrl}/configData/setMongoURL`, { url: oldDbUrl.data }); // reconnects to the previously working database
        }
        this.setState({ mongoDb: '' });
        this.getData();
    }

    //handler for submitting download path to config.json - displays error returned from api
    handleSubmitDownloadPath = async (e) => {
        e.preventDefault();
        const result = await axios.post(`${apiEndpointUrl}/configData/setDownloadPath`, { downloadPath: this.state.downloadPath });
        if (result.data.type) {
            swal({
                title: "Error",
                text: "The path entered is not absolute or does not exist.\nPlease try entering a new path.",
                icon: "warning",
            });
        }
        this.setState({ downloadPath: '' });
        this.getData();
    }

    //handlers for changing state when characters are typed into the text fields
    handleChangeAuthKey = (e) => {
        this.setState({ authKey: e.target.value });
    }
    handleChangeGitlab = (e) => {
        this.setState({ gitlab: e.target.value });
    }

    handleChangeMongoDB = (e) => {
        this.setState({ mongoDb: e.target.value });
    }
    handleChangeDownloadPath = (e) => {
        this.setState({ downloadPath: e.target.value });
    }

    render() {
      return (
        <div className='labels' style={{ marginLeft: '80px', marginRight: '80px' }}>
            <h1>Configurations</h1>
            <form onSubmit={this.handleSubmitAuthKey} style = {{ marginLeft: '20px', marginTop: '10px' }}>
                <div style = {{ marginBottom: '10px' }}>
                    <label>Validation Status: <b>{this.state.savedAuthKey} for {this.state.savedGitlab}</b></label>
                </div>
                <div style = {{ marginBottom: '30px' }}>
                    <label>Authentication Key:</label>
                    <input
                        type="text" 
                        value={this.state.authKey} 
                        onChange={this.handleChangeAuthKey} 
                        style={{ marginLeft: '90px', marginRight: '20px', marginBottom: '10px' }}
                        /><br/>
                    <label>Gitlab URL: </label>
                    <input
                        type="text" 
                        value={this.state.gitlab} 
                        onChange={this.handleChangeGitlab} 
                        style={{ width: '300px', marginLeft: '134px', marginRight: '10px', marginBottom: '10px' }}
                        />
                    <input type="submit" value="Save Changes" /><br/>
                    <p>Ex: gitlab.domain-name.com (do not include 'https://')</p>
                    <p>(Changes may take a couple seconds to save)</p>
                </div>
            </form>
            <form onSubmit={this.handleSubmitMongoDB} style = {{ marginLeft: '20px', marginTop: '10px' }}>
                <div style = {{ marginBottom: '10px' }}>
                    <label>Currently Saved MongoDB URL: <b>{this.state.savedMongoDb}</b></label>
                </div>
                <div style = {{ marginBottom: '30px' }}>
                    <label>MongoDB Endpoint URL: </label>
                    <input
                        type="text" 
                        value={this.state.mongoDb} 
                        onChange={this.handleChangeMongoDB} 
                        style={{ width: '650px', marginLeft: '50px', marginRight: '10px', marginBottom: '10px' }}
                        />
                    <input type="submit" value="Save Changes" />
                    <p>(Changes may take a couple seconds to save)</p>                    
                </div>
            </form>
            <form onSubmit={this.handleSubmitDownloadPath} style = {{ marginLeft: '20px', marginTop: '10px' }}>
                <div style = {{ marginBottom: '10px' }}>
                    <label>Currently Saved Download Path For Deployments: <b>{this.state.savedDownloadPath}</b></label>
                </div>
                <div style = {{ marginBottom: '30px' }}>
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