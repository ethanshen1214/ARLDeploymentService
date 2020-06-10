import React, {Component} from 'react';
import './App.css';
import { DataTable, TableHeader, Card, CardTitle, CardText, CardActions, RadioGroup, Radio, Spinner } from 'react-mdl';
import Form from './Components/form';
import Script from './Components/scriptInput';
import Config from './lib/config.json';
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from "websocket";
const pipes = require('./API_Functions/pipelines.js');
const jobs = require('./API_Functions/jobs.js');
const projects = require('./API_Functions/projects.js');

//zJLxDfYVS87Ar2NRp52K
//18820410
//18876221

const socket = new W3CWebSocket('ws://localhost:8080');

    class App extends Component {

      constructor(props){
        super(props);
        this.state = {
          pipelines: [],
          auth_key: Config.auth_key,
          numPipelines: 5,
          currentDeployment: 0,
          script: 'placeholder',
          projectName: '',
          allDeployments: [],
        }
      }

      componentDidMount() {   //on startup it checks to see if sessionStorage already has auth_key and/or project_id
          // establishes websocket connection to the server
          socket.onmessage = (data) => {
            var dataJSON = JSON.parse(data.data);
            if (dataJSON.type === 'success') {
              if (dataJSON.projectId === parseInt(sessionStorage.getItem('project_id'))){
                this.setState({ currentDeployment: dataJSON.pipelineId});
                this.loadData();
              }
            }
            else if (dataJSON.type === 'pending') {
              this.loadData();
            }
          }

          if (sessionStorage.getItem('project_id') != null){
            this.loadData();
          }
      }

      loadData = () => {
        this.getDeployments();
        this.getPipelines();
      }

      getDeployments = async () => {      //populates the state array that holds all the current deployments in the database
        const currDeployments = [];
        const response = await axios.get('http://localhost:8080/database/getData')
        for(let i = 0; i < response.data.data.length; i++){
          const tempDeployment = {
            projectName: response.data.data[i].projectName,
            projectId: response.data.data[i].projectId,
            pipelineId: response.data.data[i].pipelineId,
          };
          currDeployments.push(tempDeployment);
        }
        this.setState({allDeployments: currDeployments})
      }

      getPipelines = async () => { //
        const result = await pipes.getPipelinesForProject(sessionStorage.getItem('project_id'), this.state.auth_key)
        
        if(typeof result != 'undefined'){
          this.setState( {pipelines: result} )
          const response = await axios.get('http://localhost:8080/database/getData') // retrieve name and script associated with project from database
          let currDep;
          let currScript;
          for (let i = 0; i < response.data.data.length; i++) {
            if (response.data.data[i].projectId == sessionStorage.getItem('project_id')){
              currDep = response.data.data[i].pipelineId;
              currScript = response.data.data[i].script;
            }
          }
          this.setState({ currentDeployment: currDep, script: currScript});
        } else{
          alert('Invalid project ID or authentication token: \nTry new project ID or close/reopen the tab and re-enter an authentication token');
        }
      }
      
      handleProjectSubmit = async (value) => {  //handler for submitting project ID
        try {
          sessionStorage.setItem('project_id', value);
          const response = await axios.get('http://localhost:8080/database/getData');
          let inDatabase = false;
          let currDep;
          let currScript;
          for (let i = 0; i < response.data.data.length; i++) {
            if (response.data.data[i].projectId == value){
              inDatabase = true;
              currDep = response.data.data[i].pipelineId;
              currScript = response.data.data[i].script;
            }
          }

          if(!inDatabase) {
            //gets the project name of the current project
            projects.getProjectName(sessionStorage.getItem('project_id'), this.state.auth_key, (err, data) => {
              sessionStorage.setItem('project_name', data);
              this.setState({projectName: data});
              axios.post('http://localhost:8080/database/putData', {
                projectId: value,
                pipelineId: 0,
                script: 'placeholder',
                projectName: data,
              });
            });
          } else {
            projects.getProjectName(sessionStorage.getItem('project_id'), this.state.auth_key, (err, data) => {
              sessionStorage.setItem('project_name', data);
              this.setState({projectName: data, currentDeployment: currDep, script: currScript});
            })
          }
          this.loadData();
        } catch (err) {
          console.log(err);
        }
      }

      handleScriptSubmit = (value) => {
        axios.post('http://localhost:8080/database/updateData', {projectId: sessionStorage.getItem('project_id'), update: {script: value}});
      }

      selectNumPipes = (e) => {  //handler for selecting number of pipelines to display
        this.setState({numPipelines: parseInt(e.target.value)});
      }

      downloadHandler = (e) => {
        axios.post('http://localhost:8080/downloads', {
          pipelineId: e.target.title,
          projectId: sessionStorage.getItem('project_id'),
        });
        this.setState({ currentDeployment: e.target.title });
      }

      refreshHandler = () => {
        window.location.reload();
      }

      render () {
        if (this.state.auth_key != '') {    //if auth_key has been submitted, show main page
          const parsedPipelines = [];

          let displayPipes = this.state.pipelines.length;
          if(this.state.pipelines.length >= this.state.numPipelines){ //if the number of pipelines passed in is less than the default/selected amount
            displayPipes = this.state.numPipelines
          }

          for(let i = 0; i < displayPipes; i++)     //parse through all the pipelines and get the required info
          {
            if(this.state.pipelines[i].status != 'success')
            {
              const tempPipeline = {
                sourceProject: this.state.pipelines[i].web_url,
                sourceCommit: this.state.pipelines[i].user.username,
                deploymentDate: this.state.pipelines[i].created_at,
                successStatus: this.state.pipelines[i].status,
                downloadButton: <Spinner/>
              };
              parsedPipelines.push(tempPipeline);   //add to pipelines array    
            }
            else
            {
                const tempPipeline = {
                sourceProject: this.state.pipelines[i].web_url,
                sourceCommit: this.state.pipelines[i].user.username,
                deploymentDate: this.state.pipelines[i].created_at,
                successStatus: this.state.pipelines[i].status,
                downloadButton: <button title ={this.state.pipelines[i].id} onClick = {this.downloadHandler}>Deploy</button>,
              };     
              parsedPipelines.push(tempPipeline);   //add to pipelines array       
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
              <div style={{height: '2000px', position: 'relative', marginLeft: '85px', marginRight: '85px'}}>
                <div className = 'labels'>
                  <div>
                    <Card shadow={3} style={{width: '420px', height: '600px', margin: 'auto', marginTop: '8%'}}>
                    <CardTitle expand style={{color: '#fff', background: 'url(http://www.getmdl.io/assets/demos/dog.png) bottom right 15% no-repeat #46B6AC'}}>Project Configurations</CardTitle>
                      <CardActions border>
                        <Form submitHandler={this.handleProjectSubmit} formTitle={'Project ID:'}/>
                        <Script submitHandler={this.handleScriptSubmit} formTitle={'Current Deployment Script For '+sessionStorage.getItem('project_name')+':'} height = {200} width = {300} script = {this.state.script}/>
                        <CardText>Select the number of pipelines to display (default 5)</CardText>
                        {radioGroup}
                      </CardActions>
                    </Card>
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
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                    <h2>Current Deployment Info</h2>
                  </div>
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center', marginBottom: '15px'}}>
                    <button onClick = {this.refreshHandler}>Refresh</button>
                  </div>
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                    <DataTable
                          shadow={0}
                          rows = {[{pipeline: this.state.currentDeployment}]}/*{parsedDeployments}*/>
                          <TableHeader name="pipeline" tooltip="Pipeline ID">Current Deployment for This Project</TableHeader>
                    </DataTable>
                    <DataTable
                          shadow={0}
                          rows = {this.state.allDeployments}>
                          <TableHeader name="projectName" tooltip="Project Name">Project Name</TableHeader>
                          <TableHeader name="projectId" tooltip="Project ID">Project ID</TableHeader>
                          <TableHeader name="pipelineId" tooltip="Pipeline ID">Pipeline ID</TableHeader>
                    </DataTable>
                  </div>
                </div>
              </div>
          );
        }
      }
    }
    export default App;