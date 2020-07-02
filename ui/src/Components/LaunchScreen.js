import React, {Component} from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { DataTable, TableHeader, Card, CardTitle, CardActions, Grid, Cell, Chip, IconButton } from 'react-mdl';
import axios from 'axios';
import swal from 'sweetalert';

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
            searchResults: [],
            searchTerm: "",
            error: '',
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
        if (this.state.stopScript === '' || this.state.startScript === '') {
            swal({
                title: "Error",
                text: "Project not added to the database. Start script and stop script cannot be empty.",
                icon: "warning",
            });
        } else {
            const result = await axios.post(`${apiEndpointUrl}/launchDB/putData`, this.state);
            if(!result.data.success){
                if(result.data.type === 'filePath'){
                    swal({
                        title: "Error",
                        text: "Project not added to the database. The file path provided is not absolute or does not exist.",
                        icon: "warning",
                    });
                }
                else if(result.data.type === 'duplicate') {
                    swal({
                        title: "Error",
                        text: "'Project is already in the database.\nTo edit, click the edit button in the table'.",
                        icon: "warning",
                    });
                }
            }
            this.setState({ name: '', startScript: '', stopScript: '', path: '' });
        }
        setTimeout(()=>this.loadData(), 2000);
    }
    handleLaunch = async (e) => {
        e.persist();
        swal({
            title: "Are you sure?",
            text: "The previously running project will be halted, and the new project will be started.",
            icon: "warning",
            buttons: true,
            dangerMode: true
        })
        .then(async (newLaunch) => {
            if (newLaunch) {
                const response = await axios.post(`${apiEndpointUrl}/launch/start`, {projectName: e.target.name});
                if(!response.data.success){
                    if(response.data.type === 'alreadyRunning'){
                        swal({
                            title: "Error",
                            text: "Project is already running.",
                            icon: "warning",
                        });
                    }
                    else if(response.data.type === 'oldPath'){
                        swal({
                            title: "Error",
                            text: "Could not halt previously running project because file path to that project is no longer valid.\nCancelling start project command.",
                            icon: "warning",
                        });
                    }
                    else if(response.data.type === 'nonExistent'){
                        swal({
                            title: "Error",
                            text: "Cannot start a project that does not exist in the database.\nCancelling start project command.",
                            icon: "warning",
                        });
                    }
                    else if(response.data.type === 'newPath'){
                        swal({
                            title: "Error",
                            text: "New project not started because file path to that project is not valid.\nCancelling start project command.",
                            icon: "warning",
                        });
                    }
                    else if(response.data.type === 'failedProcessStop'){
                        swal({
                            title: "Error",
                            text: `Child stop process failed.\n${response.data.message}.\nCancelling stop project command.`,
                            icon: "warning",
                        });
                    }
                    else if(response.data.type === 'failedProcessStart'){
                        swal({
                            title: "Error",
                            text: `Child start process failed.\n${response.data.message}.\nCancelling start project command.`,
                            icon: "warning",
                        });
                    }
                }
                setTimeout(()=>this.loadData(), 2000);
            }
        })
    }
    handleStop = async (e) => {
        swal({
            title: "Are you sure?",
            text: "Continuing will halt the currently running project.",
            icon: "warning",
            buttons: true,
            dangerMode: true
        })
        .then(async (willStop) => {
            if (willStop) {
                const response = await axios.post(`${apiEndpointUrl}/launch/stop`);
                if(!response.data.success){
                    if(response.data.type === 'noProjectRunning'){
                        swal({
                            title: "Error",
                            text: "No projects currently running.\nCancelling stop project command.",
                            icon: "warning",
                        });
                    }
                    else if(response.data.type === 'failedProcessStop'){
                        swal({
                            title: "Error",
                            text: `Child stop process failed.\n${response.data.message}.\nCancelling stop project command.`,
                            icon: "warning",
                        });
                    }
                    else if(response.data.type === 'filePath'){
                        swal({
                            title: "Error",
                            text: "File path for the previous project is no longer valid.\nCancelling stop project command.",
                            icon: "warning",
                        });
                    }
                }
                setTimeout(()=>this.loadData(), 2000);
            }
        });
    }

    loadData = async () => {
        const response = await axios.get(`${apiEndpointUrl}/launchDB/getData`); // get the data already logged in the database
        if (response.data.data === 'noDbUrl') { // check to see if the dbUrl is valid
            swal({
                title: "Error",
                text: "Invalid DB Endpoint \nEnter a new MongoDB URL on the Config page.",
                icon: "warning",
            });
            return;
        }
        const responseArray = Array.from(response.data.data);
        let parsedProjects = [];
        let errorFlag = false;
        for(let i = 0; i < responseArray.length; i++){
            if(responseArray[i].launched === true){
                let tempProject = {
                    projectName: responseArray[i].projectName,
                    editProjectButton: <Link to={`/launch/edit/${responseArray[i].projectName}`}><button>Edit</button></Link>,
                    launchProjectButton: <Chip style={{background: '#16d719'}}>Launched</Chip>,
                    deleteProjectButton: <button name={responseArray[i].projectName} onClick = {this.deleteHandler}>Delete</button>,
                }
                parsedProjects.push(tempProject)
            }
            else{
                let tempProject = {
                    projectName: responseArray[i].projectName,
                    editProjectButton: <Link to={`/launch/edit/${responseArray[i].projectName}`}><button>Edit</button></Link>,
                    launchProjectButton: <button name = {responseArray[i].projectName} onClick = {this.handleLaunch}>Launch</button>,
                    deleteProjectButton: <button name={responseArray[i].projectName} onClick = {this.deleteHandler}>Delete</button>,
                }
                parsedProjects.push(tempProject)                
            }
            if(responseArray[i].launched === null) {
                errorFlag = {type: true, project: responseArray[i].projectName};
            }
        }
        if (errorFlag) {
            this.setState({ searchResults: parsedProjects, projects: parsedProjects, error: errorFlag.project });
        } else {
            this.setState({ searchResults: parsedProjects, projects: parsedProjects, error: '' });
        }
    }
    deleteHandler = async (e) => {
        const res = axios.delete(`${apiEndpointUrl}/launchDB/deleteData`, {data: {projectName: e.target.name}});
        setTimeout(()=>this.loadData(), 2000);
    }
    handleProjectSearch = (e) => {
        const results = this.state.projects.filter(project =>
          project.projectName.toLowerCase().includes(e.target.value.toLowerCase())
        );
        this.setState({ searchTerm: e.target.value, searchResults: results });
    }

    render() {
        const DB = [];
        let error;
        if (this.state.error) {
            error = <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center', }}><h1 style={{color: 'orange'}}>Script Error in {this.state.error}</h1></div>;
        } else {
            error = <React.Fragment></React.Fragment>;
        }
        return(
        <div style={{height: '900px', width: '900px', margin: 'auto'}}>
          <div className = 'labels'>
            <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center', }}><h1>GitLab Launch Util</h1></div>
            {error}
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
                    <button onClick={this.handleStop} style={{float:'right', marginRight: '33px'}}>Stop current project</button>           
                    <div className = 'table' style={{height:'650px'}}>
                      <DataTable
                            shadow={0}
                            rows = {this.state.searchResults}
                            style = {{marginTop: '10px'}}>
                            <TableHeader name="projectName" tooltip="Project Name">Project Name</TableHeader>
                            <TableHeader name="editProjectButton" tooltip="Edit Project">Edit Project</TableHeader>
                            <TableHeader name="launchProjectButton" tooltip="Launch Project">Launch Project</TableHeader>
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