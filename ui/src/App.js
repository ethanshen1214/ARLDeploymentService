import React, {Component} from 'react';
import './App.css';
import { DataTable, TableHeader, Card, CardTitle, CardText, CardActions, RadioGroup, Radio, Spinner, Chip, Grid, Cell } from 'react-mdl';
import Script from './Components/scriptInput';
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from "websocket";
const pipes = require('./API_Functions/pipelines.js');
const projects = require('./API_Functions/projects.js');

//zJLxDfYVS87Ar2NRp52K
//18820410
//18876221

const webSocketUrl = process.env.REACT_APP_WEBSOCKET_ENDPOINT_URL || 'ws://localhost:8080';
const apiEndpointUrl = process.env.REACT_APP_API_ENDPOINT_URL || 'http://localhost:8080';

const socket = new W3CWebSocket(webSocketUrl);

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      pipelines: [],
      auth_key: process.env.REACT_APP_AUTH_KEY,
      numPipelines: 5,
      currentDeployment: 'no deployment',
      script: 'placeholder',
      projectName: '',
      allProjects: [],
    }
  }

  componentDidMount() {   //on startup it checks to see if sessionStorage already has auth_key and/or project_id
      // establishes websocket connection to the server
      socket.onmessage = (data) => {
        var dataJSON = JSON.parse(data.data);
        if (dataJSON.type === 'success') {
          if (dataJSON.projectId === parseInt(sessionStorage.getItem('project_id'))){
            this.setState({ currentDeployment: dataJSON.pipelineId });
            this.loadData();
          }
        }
        else if (dataJSON.type === 'pending') {
          this.loadData();
        }
      }
      this.loadData();
  }

  loadData = async () => {
    const projectsResponse = await projects.getProjects(this.state.auth_key);
    const response = await axios.get(`${apiEndpointUrl}/database/getData`);
    const responseArray = Array.from(response.data.data);
    const mappedPipelines = new Map(responseArray.map(obj => [obj.projectId, obj.pipelineId]));

    const currProjects = [];
    for(let i = 0; i< projectsResponse.length; i++){
      const mappedPipeline = mappedPipelines.get(projectsResponse[i].id);
      if(projectsResponse[i].id == sessionStorage.getItem('project_id')){
        if(typeof mappedPipeline !== 'undefined' && mappedPipeline !== 0){
          const tempProject = {
            name: projectsResponse[i].name,
            id: projectsResponse[i].id,
            pipelineId: mappedPipeline,
            selectProjectButton: <Chip style={{background: '#16d719', height: '20px'}}></Chip>
          }
          currProjects.push(tempProject);        
        }
        else{
          const tempProject = {
            name: projectsResponse[i].name,
            id: projectsResponse[i].id,
            pipelineId: 'no deployment',
            selectProjectButton: <Chip style={{background: '#16d719', height: '20px'}}></Chip>
          }
          currProjects.push(tempProject);  
        }     
      }
      else{
        if(typeof mappedPipeline !== 'undefined' && mappedPipeline !== 0){
          const tempProject = {
            name: projectsResponse[i].name,
            id: projectsResponse[i].id,
            pipelineId: mappedPipeline,
            selectProjectButton: <button title={projectsResponse[i].id} onClick = {this.selectProjectHandler}>Load</button>
          }
          currProjects.push(tempProject);        
        }
        else{
          const tempProject = {
            name: projectsResponse[i].name,
            id: projectsResponse[i].id,
            pipelineId: 'no deployment',
            selectProjectButton: <button title={projectsResponse[i].id} onClick = {this.selectProjectHandler}>Load</button>
          }
          currProjects.push(tempProject);  
        }        
      }

    }
    console.log('\n---------------------- loadData ---------------------- ');
    const result = await pipes.getPipelinesForProject(sessionStorage.getItem('project_id'), this.state.auth_key);
    
    let currDep;
    let currScript;
    let currName;
    if(typeof result != 'undefined'){
      for (let i = 0; i < response.data.data.length; i++) {
        if (response.data.data[i].projectId == sessionStorage.getItem('project_id')){
          currDep = response.data.data[i].pipelineId;
          currScript = response.data.data[i].script;
          currName = response.data.data[i].projectName;
        }
      }
      this.setState({ pipelines: result, currentDeployment: currDep, script: currScript, projectName: currName, allProjects: currProjects} );
    } else{
      this.setState({ allProjects: currProjects });
      //alert('Invalid project ID or authentication token: \nTry new project ID or close/reopen the tab and re-enter an authentication token');
    }
  }
  
  handleProjectSubmit = async (value) => {  //handler for submitting project ID
    try {
      sessionStorage.setItem('project_id', value);

      const result = await pipes.getPipelinesForProject(sessionStorage.getItem('project_id'), this.state.auth_key);
      if (typeof result != 'undefined') {
        var currName;
        projects.getProjectName(sessionStorage.getItem('project_id'), this.state.auth_key, async (err, data) => {
          sessionStorage.setItem('project_name', data);
          currName = data;

          await axios.post(`${apiEndpointUrl}/database/putData`, {
            projectId: value,
            pipelineId: 0,
            script: 'placeholder',
            projectName: currName,
          });
        
          this.loadData();
        });
      } else {
        alert('Invalid project ID or authentication token: \nTry new project ID or close/reopen the tab and re-enter an authentication token');
      }
    } catch (err) {
      console.log(err);
    }
  }

  handleScriptSubmit = (value) => {
    axios.post(`${apiEndpointUrl}/database/updateData`, {projectId: sessionStorage.getItem('project_id'), update: {script: value}});
  }

  selectNumPipes = (e) => {  //handler for selecting number of pipelines to display
    this.setState({numPipelines: parseInt(e.target.value)});
  }

  downloadHandler = (e) => {
    axios.post(`${apiEndpointUrl}/database/updateData`, {projectId: sessionStorage.getItem('project_id'), update: {pipelineId: e.target.title}})
    .then(() => {
      this.loadData();
    });
    axios.post(`${apiEndpointUrl}/downloads`, {
      pipelineId: e.target.title,
      projectId: sessionStorage.getItem('project_id'),
    });
  }

  selectProjectHandler = (e) => {
    this.handleProjectSubmit(e.target.title);
  }

  render () {
    const parsedPipelines = [];

    let displayPipes = this.state.pipelines.length;
    if(this.state.pipelines.length >= this.state.numPipelines){ //if the number of pipelines passed in is less than the default/selected amount
      displayPipes = this.state.numPipelines
    }

    for(let i = 0; i < displayPipes; i++)     //parse through all the pipelines and get the required info
    {
      if(this.state.pipelines[i].status !== 'success')
      {
        let date = new Date(this.state.pipelines[i].created_at);
        const tempPipeline = {
          sourceProject: this.state.pipelines[i].web_url,
          sourceCommit: this.state.pipelines[i].user.username,
          deploymentDate: date.toString(),
          successStatus: this.state.pipelines[i].status,
          downloadButton: <Spinner/>
        };
        parsedPipelines.push(tempPipeline);   //add to pipelines array    
      }
      else
      {
        if(this.state.currentDeployment === this.state.pipelines[i].id)
        {
          let date = new Date(this.state.pipelines[i].created_at);
          const tempPipeline = {
            sourceProject: this.state.pipelines[i].web_url,
            sourceCommit: this.state.pipelines[i].user.username,
            deploymentDate: date.toString(),
            successStatus: this.state.pipelines[i].status,
            downloadButton: <Chip style={{background: '#16d719'}}>Deployed</Chip>
          };     
          parsedPipelines.push(tempPipeline);   //add to pipelines array
        }
        else
        {
          let date = new Date(this.state.pipelines[i].created_at);
          const tempPipeline = {
            sourceProject: this.state.pipelines[i].web_url,
            sourceCommit: this.state.pipelines[i].user.username,
            deploymentDate: date.toString(),
            successStatus: this.state.pipelines[i].status,
            downloadButton: <button title ={this.state.pipelines[i].id} onClick = {this.downloadHandler}>Deploy</button>,
          };     
          parsedPipelines.push(tempPipeline);   //add to pipelines array            
        }
     
      }
    }

    let radioGroup;
    if(this.state.numPipelines === 1){    //for re-rendering the radio buttons with the correct values
      radioGroup = <RadioGroup container="ul" childContainer="li" name="demo2" value = '1' onChange ={this.selectNumPipes}>
                        <Radio value= '1' >1</Radio>
                        <Radio value= '5' >5</Radio>
                        <Radio value= '10'>10</Radio>
                    </RadioGroup>;
    }
    else if(this.state.numPipelines === 5){
      radioGroup = <RadioGroup container="ul" childContainer="li" name="demo2" value = '5' onChange ={this.selectNumPipes}>
                        <Radio value= '1' >1</Radio>
                        <Radio value= '5' >5</Radio>
                        <Radio value= '10'>10</Radio>
                    </RadioGroup>;
    }
    else if(this.state.numPipelines === 10){
      radioGroup = <RadioGroup container="ul" childContainer="li" name="demo2" value = '10' onChange ={this.selectNumPipes}>
                        <Radio value= '1' >1</Radio>
                        <Radio value= '5' >5</Radio>
                        <Radio value= '10'>10</Radio>
                    </RadioGroup>;
    }

    return(
        <div style={{height: '1800px', position: 'relative', marginLeft: '85px', marginRight: '85px'}}>
          <div className = 'labels'>
            <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}><h1>GitLab Deployment Util</h1></div>
            <div>
              <Grid>
                <Cell col = {6}>
                  <DataTable
                        shadow={3}
                        rows = {this.state.allProjects}
                        style={{ margin: 'auto', marginTop: '3%'}}>
                        <TableHeader name="name" tooltip="Project Name">Project Name</TableHeader>
                        <TableHeader name="id" tooltip="Project ID">Project ID</TableHeader>
                        <TableHeader name="pipelineId" tooltip="Currently deployed pipeline">Current Deployment</TableHeader>
                        <TableHeader name="selectProjectButton" tooltip="Click to change the working project">Load Project</TableHeader>
                  </DataTable> 
                </Cell>
                <Cell col = {6}>
                  <Card shadow={3} style={{width: '420px', height: '430px', margin: 'auto', marginTop: '3%'}}>
                    {/* <CardTitle expand style={{color: '#fff', background: 'url(http://www.getmdl.io/assets/demos/dog.png) bottom right 15% no-repeat #46B6AC'}}>Project Configurations</CardTitle> */}
                    <CardActions border>
                      <Script submitHandler={this.handleScriptSubmit} formTitle={'Current Deployment Script For '+sessionStorage.getItem('project_name')+':'} height = {200} width = {300} script = {this.state.script}/>
                      <CardText>Select the number of pipelines to display (default 5)</CardText>
                      {radioGroup}
                    </CardActions>
                  </Card>
                </Cell>
              </Grid>
            </div>
          </div>
          <div className = 'labels'>
            <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
              <h2>Pipeline Status For {sessionStorage.getItem('project_name')}</h2>
            </div>
            <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
              <DataTable
                shadow={0}
                rows = {parsedPipelines}>
                <TableHeader name="sourceProject" tooltip="URL of pipeline">Source Project</TableHeader>
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
export default App;