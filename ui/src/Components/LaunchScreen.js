import React, {Component} from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { DataTable, TableHeader, Card, CardTitle, CardActions, Grid, Cell, Chip, IconButton } from 'react-mdl';
import axios from 'axios';
import swal from 'sweetalert';
import Modal from 'react-modal';
import Edit from './EditScreen';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const apiEndpointUrl = process.env.REACT_APP_API_ENDPOINT_URL || 'http://localhost:8080';
const webSocketUrl = process.env.REACT_APP_WEBSOCKET_ENDPOINT_URL || 'ws://localhost:8080';

const socket = new W3CWebSocket(webSocketUrl);

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
            editModalIsOpen: false,
            addModalIsOpen: false,
            edit: {
                name: '',
                startScript: '',
                stopScript: '',
                path: '',
            }
        }
    }

    componentDidMount(){
        socket.onmessage = (data) => {
            const dataJSON = JSON.parse(data.data);
            console.log('Received Socket', dataJSON.type === "failedProcessStart")
            if (dataJSON.type === "failedProcessStart") {
                swal({
                    title: "Error",
                    text: `Child start process failed.\n${dataJSON.message}.\nCancelling start project command.`,
                    icon: "warning",
                });
            }
            else if (dataJSON.type === "failedProcessStop") {
                swal({
                    title: "Error",
                    text: `Child stop process failed.\n${dataJSON.message}.`,
                    icon: "warning",
                });
            }
            else if (dataJSON.type === "faultyStopPath") {
                swal({
                    title: "Error",
                    text: "Could not halt previously running project because file path to that project is no longer valid.\nCancelling start project command.",
                    icon: "warning",
                });
            }
            else if (dataJSON.type === "faultyStartPath") {
                swal({
                    title: "Error",
                    text: "New project not started because file path to that project is not valid.\nCancelling start project command.",
                    icon: "warning",
                });
            }
            else if (dataJSON.type === "noProjectRunning") {
                swal({
                    title: "Error",
                    text: "No projects currently running.\nCancelling stop project command.",
                    icon: "warning",
                });
            }
            setTimeout(()=>this.loadData(), 2000);
        }

        this.loadData();
    }

    handleChange = (e) => {
        const {name, value} = e.target;
        this.setState({[name]: value, launched: false});
    }

    handleChangeEdit = (e) => {
        const {name, value} = e.target;
        this.setState({edit: {[name]: value}});
    }

    closeAddModal = () => {
        this.setState({ addModalIsOpen: false });
    }

    closeEditModal = () => {
        this.setState({ editModalIsOpen: false });
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
            this.setState({ name: '', startScript: '', stopScript: '', path: '', addModalIsOpen: false });
        }
        setTimeout(()=>this.loadData(), 2000);
    }

    handleSubmitEdit = async (e) => {
        const projectName = this.state.edit.name;
        e.preventDefault();
        if (this.state.edit.stopScript === '' || this.state.edit.startScript === '') {
            swal({
                title: "Error",
                text: "Project not updated. Start script and stop script cannot be empty.",
                icon: "warning",
            });
        } else {
            const result = await axios.post(`${apiEndpointUrl}/launchDB/updateData`, {projectName: projectName, update: this.state.edit});
            if(!result.data.success){
                if(result.data.type === 'filePath'){
                    swal({
                        title: "Error",
                        text: "Did not update database because filepath is invalid",
                        icon: "warning",
                    });
                }
            }
            else{
                swal({
                    text: "Changes successfully saved.",
                    icon: "success",
                });
            }
        }
        this.setState({editModalIsOpen: false});
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
                setTimeout(()=>this.loadData(), 2000);
            }
        });
    }
    handleEdit = async (e) =>{
        //this.setState({editModalIsOpen: true, edit: {name: e.target.name}});
        const projectName = e.target.name;
        const response = await axios.post(`${apiEndpointUrl}/launchDB/getOne`, {projectName: projectName});
        this.setState({editModalIsOpen: true, edit: {name: projectName, startScript: response.data.data.startScript, stopScript: response.data.data.stopScript, path: response.data.data.path}})
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
        for(let i = 0; i < responseArray.length; i++){
            if(responseArray[i].launched === true){
                let tempProject = {
                    projectName: responseArray[i].projectName,
                    // editProjectButton: <Link to={`/launch/edit/${responseArray[i].projectName}`}><button>Edit</button></Link>,
                    editProjectButton: <button onClick = {this.handleEdit} name = {responseArray[i].projectName}>Edit</button>,
                    launchProjectButton: <Chip style={{background: '#16d719'}}>Launched</Chip>,
                    deleteProjectButton: <button name={responseArray[i].projectName} onClick = {this.deleteHandler}>Delete</button>,
                    status: 'launched',
                }
                parsedProjects.push(tempProject)
            }
            else if(responseArray[i].launched === null){
                let tempProject = {
                    projectName: responseArray[i].projectName,
                    //editProjectButton: <Link to={`/launch/edit/${responseArray[i].projectName}`}><button>Edit</button></Link>,
                    editProjectButton: <button onClick = {this.handleEdit} name = {responseArray[i].projectName}>Edit</button>,
                    launchProjectButton: <button name = {responseArray[i].projectName} onClick = {this.handleLaunch}>Launch</button>,
                    deleteProjectButton: <button name={responseArray[i].projectName} onClick = {this.deleteHandler}>Delete</button>,
                    status:'failed',
                }
                parsedProjects.push(tempProject) 
            }            
            else{
                let tempProject = {
                    projectName: responseArray[i].projectName,
                    //editProjectButton: <Link to={`/launch/edit/${responseArray[i].projectName}`}><button>Edit</button></Link>,
                    editProjectButton: <button onClick = {this.handleEdit} name = {responseArray[i].projectName}>Edit</button>,
                    launchProjectButton: <button name = {responseArray[i].projectName} onClick = {this.handleLaunch}>Launch</button>,
                    deleteProjectButton: <button name={responseArray[i].projectName} onClick = {this.deleteHandler}>Delete</button>,
                    status:'stopped',
                }
                parsedProjects.push(tempProject)                      
            }
        }
        this.setState({ searchResults: parsedProjects, projects: parsedProjects });
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
    
    addProject = (e) => {
        this.setState({ addModalIsOpen: true });
    }

    render() {

        return(
        <div style={{height: '900px', width: '650px', margin: 'auto'}}>
          <div className = 'labels'>
            <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center', }}><h1>GitLab Launch Util</h1></div>
            <button onClick = {this.addProject}>Add Project</button>
            <div>
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
                        <TableHeader name="status" tooltip="status">Launch Status</TableHeader>
                    </DataTable> 
                </div>
                <Modal isOpen = {this.state.addModalIsOpen} style = {{overlay: {zIndex: 9999}}}>
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
                                {' | '}
                                <button onClick={this.closeAddModal}>Return</button>
                            </div>
                        </form>
                    </CardActions>
                    </Card>                        
                </Modal>
                <Modal isOpen = {this.state.editModalIsOpen} style = {{overlay: {zIndex: 9999}}}>
                    <Card shadow={3} style={{width: '420px', height: '750px', margin: 'auto', marginTop: '3%'}}>
                      <CardActions border>
                          <CardTitle>Editing: {this.state.edit.name}</CardTitle>
                        <form onSubmit={this.handleSubmitEdit} style = {{marginLeft: '20px'}}>
                            <div>
                                <label>Launch Path:</label>
                            </div>
                            <div style = {{marginBottom: '20px'}}>
                                <input
                                    type="text"
                                    name="path"
                                    value={this.state.edit.path}
                                    onChange={this.handleChangeEdit}
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
                                    value={this.state.edit.startScript} 
                                    onChange={this.handleChangeEdit} 
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
                                    value={this.state.edit.stopScript} 
                                    onChange={this.handleChangeEdit} 
                                    style = {{ marginRight: '20px', height: '200px', width: '300px'}}
                                    />
                            </div>
                            <div>
                                <input type="submit" value="Save Changes" />
                                {' | '}
                                <button onClick={this.closeEditModal}>Return</button>
                            </div>
                        </form>
                      </CardActions>
                    </Card>
                </Modal>
            </div>
          </div>
        </div>
        );
    }
}