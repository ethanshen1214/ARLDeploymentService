import React, {Component} from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { DataTable, TableHeader, Card, CardTitle, CardActions, Grid, Cell, Chip, IconButton } from 'react-mdl';
import axios from 'axios';

const apiEndpointUrl = process.env.REACT_APP_API_ENDPOINT_URL || 'http://localhost:8080';

export default class LaunchScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            name: '',
            startScript: '',
            stopScript: '',
            path: '',
            launched: false,
            projects: [],
        }
    }
    componentDidMount(){
        this.loadData();
    }
    handleChange = (e) => {
        const {name, value} = e.target;
        this.setState({[name]: value, launched: false});
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        const result = await axios.post(`${apiEndpointUrl}/launchDB/putData`, this.state);
        if(!result.data.success){
            if(result.data.type === 'filePath'){
                alert('Did not add to database because filepath is invalid');
            }
            else if(result.data.type === 'duplicate') {
                alert('Project is already in the database.\nTo edit, click the edit button in the table');
            }
        }
        setTimeout(()=>this.loadData(), 2000);
    }
    handleLaunch = async (e) => {
        axios.post(`${apiEndpointUrl}/launch/start`, {projectName: e.target.name});
        alert('This will stop all other projects before starting this one.');
        setTimeout(()=>this.loadData(), 2000);
    }
    handleStop = async (e) => {
        axios.post(`${apiEndpointUrl}/launch/stop`, {projectName: e.target.name});
        setTimeout(()=>this.loadData(), 2000);
    }

    loadData = async () => {
        const response = await axios.get(`${apiEndpointUrl}/launchDB/getData`); // get the data already logged in the database
        if (response.data.data === 'noDbUrl') { // check to see if the dbUrl is valid
            alert('Invalid DB Endpoint \nEnter a new MongoDB URL on the Config page');
            return;
        }
        const responseArray = Array.from(response.data.data);
        let parsedProjects = [];
        for(let i = 0; i < responseArray.length; i++){
            if(responseArray[i].launched === true){
                let tempProject = {
                    projectName: responseArray[i].projectName,
                    editProjectButton: <Link to={`/launch/edit/${responseArray[i].projectName}`}><button>Edit</button></Link>,
                    launchProjectButton: <Chip style={{background: '#16d719'}}>Launched</Chip>,
                    stopProjectButton: <button name = {responseArray[i].projectName} onClick = {this.handleStop}>Stop</button>,
                    deleteProjectButton: <button name={responseArray[i].projectName} onClick = {this.deleteHandler}>Delete</button>,
                }
                parsedProjects.push(tempProject)
            }
            else{
                let tempProject = {
                    projectName: responseArray[i].projectName,
                    editProjectButton: <Link to={`/launch/edit/${responseArray[i].projectName}`}><button>Edit</button></Link>,
                    launchProjectButton: <button name = {responseArray[i].projectName} onClick = {this.handleLaunch}>Launch</button>,
                    stopProjectButton: <button name = {responseArray[i].projectName} onClick = {this.handleStop}>Stop</button>,
                    deleteProjectButton: <button name={responseArray[i].projectName} onClick = {this.deleteHandler}>Delete</button>,
                }
                parsedProjects.push(tempProject)                
            }

        }
        this.setState({projects: parsedProjects});
    }
    deleteHandler = async (e) => {
        const res = axios.delete(`${apiEndpointUrl}/launchDB/deleteData`, {data: {projectName: e.target.name}});
        setTimeout(()=>this.loadData(), 2000);
    }

    render() {
        const DB = [];
        return(
        <div style={{height: '900px', width: '1000px', margin: 'auto'}}>
          <div className = 'labels'>
            <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center', }}><h1>GitLab Launch Util</h1></div>
            <div>
              <Grid>
                <Cell col = {7} >
                    <input
                      type="text"
                      placeholder="Search"
                      value={this.state.searchTerm}
                      onChange={this.handleProjectSearch} 
                      style = {{marginTop: '10px'}}
                    />                    
                    <div className = 'table' style={{height:'650px'}}>
                      <DataTable
                            shadow={0}
                            rows = {this.state.projects}
                            style = {{marginTop: '10px'}}>
                            <TableHeader name="projectName" tooltip="Project Name">Project Name</TableHeader>
                            <TableHeader name="editProjectButton" tooltip="Edit Project">Edit Project</TableHeader>
                            <TableHeader name="launchProjectButton" tooltip="Launch Project">Launch Project</TableHeader>
                            <TableHeader name="stopProjectButton" tooltip="Stop Project">Stop Project</TableHeader>
                            <TableHeader name="deleteProjectButton" tooltip="Delete Project">Delete Project</TableHeader>
                      </DataTable> 
                    </div>
                </Cell>
                <Cell col = {5}>
                    <Card shadow={3} style={{width: '420px', height: '750px', margin: 'auto', marginTop: '3%'}}>
                      <CardActions border>
                          <CardTitle>Add Project</CardTitle>
                        <form onSubmit={this.handleSubmit} style = {{marginLeft: '20px'}}>
                            <div>
                                <label>Project Name:</label>
                            </div>
                            <div style = {{marginBottom: '20px'}}>
                                <input
                                    type="text"
                                    name="name"
                                    value={this.state.name}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div>
                                <label>Launch Path:</label>
                            </div>
                            <div style = {{marginBottom: '20px'}}>
                                <input
                                    type="text"
                                    name="path"
                                    value={this.state.path}
                                    onChange={this.handleChange}
                                    style = {{width: '300px'}}
                                />
                            </div>
                            <div>
                                <label>Start Script:</label>
                            </div>
                            <div style = {{marginBottom: '20px'}}>
                                <textarea
                                    type="text" 
                                    name="startScript"
                                    value={this.state.startScript} 
                                    onChange={this.handleChange} 
                                    style = {{ marginRight: '20px', height: '200px', width: '300px'}}
                                    />
                            </div>
                            <div>
                                <label>Stop Script:</label>
                            </div>
                            <div style = {{marginBottom: '20px'}}>
                                <textarea
                                    type="text" 
                                    name="stopScript"
                                    value={this.state.stopScript} 
                                    onChange={this.handleChange} 
                                    style = {{ marginRight: '20px', height: '200px', width: '300px'}}
                                    />
                            </div>
                            <div>
                                <input type="submit" value="Add Project" />
                            </div>
                        </form>
                      </CardActions>
                    </Card>
                </Cell>
              </Grid>
            </div>
          </div>
        </div>
        );
    }
}