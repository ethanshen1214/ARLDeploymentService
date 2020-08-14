import React, {Component} from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { DataTable, TableHeader, RadioGroup, Radio, Spinner, Chip } from 'react-mdl';
import Script from './scriptInput';
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import swal from 'sweetalert';
import Modal from 'react-modal';

const webSocketUrl = process.env.REACT_APP_WEBSOCKET_ENDPOINT_URL || 'ws://localhost:8080';
const apiEndpointUrl = process.env.REACT_APP_API_ENDPOINT_URL || 'http://localhost:8080';

const socket = new W3CWebSocket(webSocketUrl);
let baseSearchState;

//code for deployment service front end
export default class DeploymentScreen extends Component {
    constructor(props){
        super(props);
        this.state = {
            pipelines: [],
            numPipelines: 5,
            currentDeployment: 'no deployment',
            script: 'placeholder',
            projectName: '',
            searchResults: [],
            searchTerm: "",
            editModalIsOpen: false,
            edit: {
                name: '',
                script: '',
            }
        }
    }

    //on startup it checks to see if sessionStorage already has auth_key and/or project_id and loads data into state
    async componentDidMount() {   
        // establishes websocket connection to the server
        if(sessionStorage.getItem('project_id')){
            this.props.history.push(`/view/${sessionStorage.getItem('project_id')}`)
        }
        socket.onmessage = (data) => {
            const { match } = this.props;
            var dataJSON = JSON.parse(data.data);
            if (dataJSON.type === 'success') {
                if (dataJSON.projectId === parseInt(match.params.id)){
                    this.setState({ currentDeployment: dataJSON.pipelineId }, () => {
                    this.loadData();
                    });
                }
            }
            else if (dataJSON.type === 'pending') {
                this.loadData();
            }
            else if (dataJSON.type === 'notAbs') {  //checks for errors pushed through socket
                swal({
                    title: "Error",
                    text: "File path is not absoulute.",
                    icon: "warning",
                });
            }
            else if (dataJSON.type === 'notEx') {
                swal({
                    title: "Error",
                    text: "File path does not exist",
                    icon: "warning",
                });
            }
        }
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        const { match: { params: { id: prevId } } } = prevProps;
        const { match: { params: { id } } } = this.props;
        if (prevId !== id) {
            if(id){
                this.handleProjectSubmit();
                this.loadData();
            }
            else{
                this.loadData();
            }
        }
    }

    //makes the appropriate api calls to grab all the necessary info for the deployment service
    loadData = async () => {
        const apiProjectsResults = await axios.post(`${apiEndpointUrl}/gitlabAPI/getProjects`); // get an array of all the projects associated with a user DOES NOT HANDLE ERROR
        if (apiProjectsResults.data.projects === false) { // check to see if the auth_key is valid
            swal({
                title: "Error",
                text: "Invalid Authentication Key \nEnter a new key on the Config page",
                icon: "warning",
            });
            return;
        }
        const gitLabProjects = apiProjectsResults.data.projects;
        const response = await axios.get(`${apiEndpointUrl}/deploymentDB/getData`); // get the data already logged in the database
        if (response.data.data === 'noDbUrl') { // check to see if the dbUrl is valid
            swal({
                title: "Error",
                text: "Invalid DB Endpoint \nEnter a new MongoDB URL on the Config page",
                icon: "warning",
            });
            return;
        }
        const responseArray = Array.from(response.data.data);
        const mappedPipelines = new Map(responseArray.map(obj => [obj.projectId, obj.pipelineId])); // create map for projectId to currently deployed pipelineId for faster matching
        const { match } = this.props;

        // create list of possibly deployable projects to display to user
        const currProjects = [];
        for(let i = 0; i< gitLabProjects.length; i++){
            const mappedPipeline = mappedPipelines.get(gitLabProjects[i].id);
            if(gitLabProjects[i].id == parseInt(match.params.id)){
                if(typeof mappedPipeline !== 'undefined' && mappedPipeline !== 0){
                    const tempProject = {
                        name: <a href = {gitLabProjects[i].http_url_to_repo} target="_blank" rel="noopener noreferrer">{gitLabProjects[i].name}</a>,
                        title: gitLabProjects[i].name,
                        id: gitLabProjects[i].id,
                        pipelineId: mappedPipeline,
                        selectProjectButton: <Chip style={{ background: '#16d719', height: '20px' }}></Chip>,
                        edit: <button onClick = {this.handleEdit} name = {gitLabProjects[i].id}>Edit</button>,
                    }
                    currProjects.push(tempProject);        
                }
                else{
                    const tempProject = {
                        name: <a href = {gitLabProjects[i].http_url_to_repo} target="_blank" rel="noopener noreferrer">{gitLabProjects[i].name}</a>,
                        title: gitLabProjects[i].name,
                        id: gitLabProjects[i].id,
                        pipelineId: 'no deployment',
                        selectProjectButton: <Chip style={{ background: '#16d719', height: '20px' }}></Chip>,
                        edit: <button onClick = {this.handleEdit} name = {gitLabProjects[i].id}>Edit</button>,
                    }
                    currProjects.push(tempProject);  
                }     
            }
            else{
                if(typeof mappedPipeline !== 'undefined' && mappedPipeline !== 0){
                    const tempProject = {
                        name: <a href = {gitLabProjects[i].http_url_to_repo} target="_blank" rel="noopener noreferrer">{gitLabProjects[i].name}</a>,
                        title: gitLabProjects[i].name,
                        id: gitLabProjects[i].id,
                        pipelineId: mappedPipeline,
                        selectProjectButton: <Link to={`/view/${gitLabProjects[i].id}`}><button>Load</button></Link>,
                        edit: <button onClick = {this.handleEdit} name = {gitLabProjects[i].id}>Edit</button>,
                    }
                    currProjects.push(tempProject);        
                }
                else{
                    const tempProject = {
                        name: <a href = {gitLabProjects[i].http_url_to_repo} target="_blank" rel="noopener noreferrer">{gitLabProjects[i].name}</a>,
                        title: gitLabProjects[i].name,
                        id: gitLabProjects[i].id,
                        pipelineId: 'no deployment',
                        selectProjectButton: <Link to={`/view/${gitLabProjects[i].id}`}><button>Load</button></Link>,
                        edit: <button onClick = {this.handleEdit} name = {gitLabProjects[i].id}>Edit</button>,
                    }
                    currProjects.push(tempProject);  
                }        
            } 
        }
        baseSearchState = currProjects;

        // create list of pipelines to display for a selected project
        let currDep;
        let currScript;
        let currName;
        if(parseInt(match.params.id)){
            const apiPipelinesResults = await axios.post(`${apiEndpointUrl}/gitlabAPI/getPipelinesForProject`, { projectId: parseInt(match.params.id) });
            const pipelines = apiPipelinesResults.data.pipelines;
            for (let i = 0; i < response.data.data.length; i++) {
                if (response.data.data[i].projectId == parseInt(match.params.id)){
                    currDep = response.data.data[i].pipelineId;
                    currScript = response.data.data[i].script;
                    currName = response.data.data[i].projectName;
                }
            }
            setState({ pipelines: pipelines, currentDeployment: currDep, script: currScript, projectName: currName, searchResults: currProjects });
        }
        else{
            this.setState({ pipelines: [], searchResults: currProjects, projectName: '' });
        }
    }
  
    //handler for submitting a project ID
    handleProjectSubmit = async () => {
        const { match } = this.props;
        try {
            const result = await axios.post(`${apiEndpointUrl}/gitlabAPI/getPipelinesForProject`, { projectId: parseInt(match.params.id) });
            if (typeof result != 'undefined') { //checks if project exists
                const apiNameCall = await axios.post(`${apiEndpointUrl}/gitlabAPI/getProjectName`, { projectId: parseInt(match.params.id) });
                const projectName = apiNameCall.data.projectName;
                await axios.post(`${apiEndpointUrl}/deploymentDB/putData`, {  //puts project into DB
                    projectId: parseInt(match.params.id),
                    pipelineId: 0,
                    script: 'placeholder',
                    projectName: projectName,
                });
                sessionStorage.setItem('project_id', match.params.id);
            } 
        } 
        catch (err) {
            console.log(err);
        }
    }

    //handler for submitting a launch script
    handleScriptSubmit = (value) => {
        const { match } = this.props;
        axios.post(`${apiEndpointUrl}/deploymentDB/updateData`, { projectId: parseInt(match.params.id), update: { script: value } });
        this.setState({ editModalIsOpen: false });
    }
    //handler for selecting number of pipelines to display
    selectNumPipes = (e) => {  
        this.setState({ numPipelines: parseInt(e.target.value) });
    }

    //handler for downloading project artifacts and deployment
    downloadHandler = async (e) => {
        const { match } = this.props;
        e.persist();
        //updates DB with new current deployment
        const result = await axios.post(`${apiEndpointUrl}/deploymentDB/updateData`, { projectId: parseInt(match.params.id), update: { pipelineId: e.target.title } });
        if (result.data.type) {
            swal({
                title: "Error",
                text: "File path is not absolute or does not exist.",
                icon: "warning",
            });
        } 
        else {
            axios.post(`${apiEndpointUrl}/downloads`, {   //api call for deploying
                pipelineId: e.target.title,
                projectId: parseInt(match.params.id),
            });
            this.loadData();
        }
    }

    //handler for project search filter
    handleProjectSearch = (e) => {
        const results = baseSearchState.filter(project =>
            project.title.toLowerCase().includes(e.target.value.toLowerCase())
        );
        this.setState({ searchTerm: e.target.value, searchResults: results });
    }
    //closes edit project modal
    closeModal = () =>{
        this.setState({ editModalIsOpen: false });
    }
    //opens edit project modal and loads data from DB
    handleEdit = async (e) => {
        const projectId = e.target.name;
        const response = await axios.post(`${apiEndpointUrl}/deploymentDB/getOne`, { projectId: projectId });
        if(response.data.data === null){
            swal({
                title: "Error",
                text: "Project is not in database yet. Load the project before editing",
                icon: "warning",
            });
        }
        else{
            const projectName = response.data.data.projectName;
            const projectScript = response.data.data.script;
            this.setState({ editModalIsOpen: true, edit: { name: projectName, script: projectScript } });      
        }
    }

    render () {
        const parsedPipelines = [];
        let displayPipes = this.state.pipelines.length;
        if(this.state.pipelines.length >= this.state.numPipelines){ //if the number of pipelines passed in is less than the default/selected amount
            displayPipes = this.state.numPipelines
        }

        for(let i = 0; i < displayPipes; i++){     //parse through all the pipelines and get the required info
            if(this.state.pipelines[i].status !== 'success'){
                if(this.state.pipelines[i].status == 'failed'){
                    let date = new Date(this.state.pipelines[i].created_at);
                    const tempPipeline = {
                        sourceProject: <a href = {this.state.pipelines[i].web_url} target = "_blank" rel="noopener noreferrer">{this.state.pipelines[i].web_url}</a>,
                        sourceCommit: this.state.pipelines[i].user.username,
                        deploymentDate: date.toString(),
                        successStatus: this.state.pipelines[i].status,
                        downloadButton: <Chip style={{ background: '#d73016' }}>Failed</Chip>
                    };
                    parsedPipelines.push(tempPipeline);   //add to pipelines array
                }
                else{
                    let date = new Date(this.state.pipelines[i].created_at);
                    const tempPipeline = {
                        sourceProject: <a href = {this.state.pipelines[i].web_url} target = "_blank" rel="noopener noreferrer">{this.state.pipelines[i].web_url}</a>,
                        sourceCommit: this.state.pipelines[i].user.username,
                        deploymentDate: date.toString(),
                        successStatus: this.state.pipelines[i].status,
                        downloadButton: <Spinner/>
                    };
                    parsedPipelines.push(tempPipeline);   //add to pipelines array  
                }
            }
            else{
                if(this.state.currentDeployment === this.state.pipelines[i].id){
                    let date = new Date(this.state.pipelines[i].created_at);
                    const tempPipeline = {
                        sourceProject: <a href = {this.state.pipelines[i].web_url} target = "_blank" rel="noopener noreferrer">{this.state.pipelines[i].web_url}</a>,
                        sourceCommit: this.state.pipelines[i].user.username,
                        deploymentDate: date.toString(),
                        successStatus: this.state.pipelines[i].status,
                        downloadButton: <Chip style={{ background: '#16d719' }}>Deployed</Chip>
                    };     
                    parsedPipelines.push(tempPipeline);   //add to pipelines array
                }
                else{
                    let date = new Date(this.state.pipelines[i].created_at);
                    const tempPipeline = {
                        sourceProject: <a href = {this.state.pipelines[i].web_url} target = "_blank" rel="noopener noreferrer">{this.state.pipelines[i].web_url}</a>,
                        sourceCommit: this.state.pipelines[i].user.username,
                        deploymentDate: date.toString(),
                        successStatus: this.state.pipelines[i].status,
                        downloadButton: <button title ={this.state.pipelines[i].id} onClick = {this.downloadHandler}>Deploy</button>,
                    };     
                    parsedPipelines.push(tempPipeline);   //add to pipelines array            
                }
            }
        }
        if(parsedPipelines.length === 0){   //check if a project has no pipelines
            const tempPipeline = {
                sourceProject: 'No project loaded',
            };
            parsedPipelines.push(tempPipeline);
        }

        let radioGroup;
        switch(this.state.numPipelines) {   //handles changing the radio button display to reflect the number of pipelines displayed
            case 1:
                radioGroup = <RadioGroup name="demo2" value = '1' onChange ={this.selectNumPipes} style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Radio value= '1' >1{" |"}&nbsp;</Radio>
                                <Radio value= '5' >5{" |"}&nbsp;</Radio>
                                <Radio value= '10'>10</Radio>
                            </RadioGroup>;
                break;
            case 5:
                radioGroup = <RadioGroup name="demo2" value = '5' onChange ={this.selectNumPipes} style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Radio value= '1' >1{" |"}&nbsp;</Radio>
                                <Radio value= '5' >5{" |"}&nbsp;</Radio>
                                <Radio value= '10'>10</Radio>
                            </RadioGroup>;
                break;
            case 10:
                radioGroup = <RadioGroup name="demo2" value = '10' onChange ={this.selectNumPipes} style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Radio value= '1' >1{" |"}&nbsp;</Radio>
                                <Radio value= '5' >5{" |"}&nbsp;</Radio>
                                <Radio value= '10'>10</Radio>
                            </RadioGroup>;
                break;
        }

        return(
            <div style={{height: '1300px', width: '1000px', margin: 'auto'}}>
                <div className = 'labels'>
                    <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h1>GitLab Deployment Util</h1></div>
                    <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className = 'table' style={{ height:'400px' }}>
                            <input
                                type="text"
                                placeholder="Search"
                                value={this.state.searchTerm}
                                onChange={this.handleProjectSearch} 
                                style = {{ marginTop: '10px' }}
                            />
                            <DataTable
                                shadow={0}
                                rows = {this.state.searchResults}
                                style = {{ marginTop: '10px' }}>
                                <TableHeader name="name" tooltip="Project Name">Project Name</TableHeader>
                                <TableHeader name="id" tooltip="Project ID">Project ID</TableHeader>
                                <TableHeader name="pipelineId" tooltip="Currently deployed pipeline">Current Deployment</TableHeader>
                                <TableHeader name="selectProjectButton" tooltip="Click to change the working project">Load Project</TableHeader>
                                <TableHeader name ="edit" tooltip="Edit project configurations">Edit</TableHeader>
                            </DataTable> 
                        </div>
                        <Modal 
                            isOpen={this.state.editModalIsOpen} 
                            style = {{ overlay: { zIndex: 9999 }, content: { display: 'flex',margin: 'auto', maxWidth: '400px', maxHeight: '390px' } }}
                            onRequestClose = {this.closeModal}
                            shouldCloseOnOverlayClick={true}>
                            <div className = 'labels'>
                                <h2>Editing: {this.state.edit.name}</h2>
                                <Script submitHandler={this.handleScriptSubmit} 
                                    formTitle = 'Script:'
                                    height = {170} width = {300} 
                                    script = {this.state.edit.script}
                                    onClose = {this.closeModal}
                                />
                            </div>
                        </Modal>
                    </div>
                </div>
                <div className = 'labels'>
                    <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <h2>Pipeline Status For {this.state.projectName}<p>Select the number of pipelines to display (default 5)</p>{radioGroup}</h2>
                    </div>
                    <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DataTable
                            shadow={0}
                            rows = {parsedPipelines}>
                            <TableHeader name="sourceProject" tooltip="URL of pipeline">Source Pipeline</TableHeader>
                            <TableHeader name="sourceCommit" tooltip="Name of account that ran the pipeline">Source Commit</TableHeader>
                            <TableHeader name="deploymentDate" tooltip="Date pipeline was created">Date of Deployment</TableHeader>
                            <TableHeader name="successStatus" tooltip="Success/Failure">Status</TableHeader>
                            <TableHeader name="downloadButton" tooltip="Click to download artifacts and deploy">Deploy</TableHeader>
                        </DataTable>
                    </div>
                </div>
            </div>
        );
    }
}