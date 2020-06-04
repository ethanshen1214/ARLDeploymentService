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
          deployments: {deployed: []},
          currentDeployment: 0,
        }
      }

      componentDidMount() {   //on startup it checks to see if sessionStorage already has auth_key and/or project_id
          socket.onmessage = (data) => {
            var dataJSON = JSON.parse(data.data);
            console.log(dataJSON);
            if (dataJSON.type === 'success') {
              if (dataJSON.projectId === parseInt(sessionStorage.getItem('project_id'))){
                this.setState({ currentDeployment: dataJSON.pipelineId});
                this.getPipelines();
              }
            }
            else if (dataJSON.type === 'pending') {
              this.getPipelines();
            }
          }

          if (sessionStorage.getItem('project_id') != null){
            this.getPipelines();
          }
      }
      
      componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = null;
      }

      getPipelines = () => {
        pipes.getPipelinesForProject(sessionStorage.getItem('project_id'), this.state.auth_key)
            .then((res) => {
              if(typeof res != 'undefined'){
                this.setState( {pipelines: res} )
              } else{
                alert('Invalid project ID or authentication token: \nTry new project ID or close/reopen the tab and re-enter an authentication token');
              }
            });
      }
      
      handleProjectSubmit = (value) => {  //handler for submitting project ID
        sessionStorage.setItem('project_id', value);
        pipes.getPipelinesForProject(sessionStorage.getItem('project_id'), this.state.auth_key)
        .then((res) => {
          if(typeof res != 'undefined'){
            this.setState( {pipelines: res} )
            axios.get('http://localhost:8080/database/getData').then((res) => {
              let inDatabase = false;
              let currDep;
              for (let i = 0; i < res.data.data.length; i++) {
                if (res.data.data[i].projectId == value){
                  inDatabase = true;
                  currDep = res.data.data[i].pipelineId;
                }
              }
              if (!inDatabase){
                axios.post('http://localhost:8080/database/putData', {
                  projectId: value,
                  pipelineId: 0,
                  script: 'placeholder',
                });
              } else {
                this.setState({ currentDeployment: currDep});
              }
            });
          } else{
            alert('Invalid project ID or authentication token: \nTry new project ID or close/reopen the tab and re-enter an authentication token');
          }
        });
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
                downloadButton: <button title ={this.state.pipelines[i].id} onClick = {this.downloadHandler}>Download</button>,
              };     
              parsedPipelines.push(tempPipeline);   //add to pipelines array       
            }
          }
          const parsedDeployments = [];
          for(let i = 0; i < this.state.deployments.deployed.length; i++)
          {
            if(this.state.deployments.deployed[i].project === sessionStorage.getItem('project_id')){
              const tempDeployment = {
                job: this.state.deployments.deployed[i].job,
                project: this.state.deployments.deployed[i].project,
                pipeline: this.state.deployments.deployed[i].pipeline,
              };
              parsedDeployments.push(tempDeployment);              
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
                    <Card shadow={3} style={{width: '420px', height: '350px', margin: 'auto', marginTop: '8%'}}>
                    <CardTitle expand style={{color: '#fff', background: 'url(http://www.getmdl.io/assets/demos/dog.png) bottom right 15% no-repeat #46B6AC'}}>Input Project ID</CardTitle>
                      <CardActions border>
                        <Form submitHandler={this.handleProjectSubmit} formTitle={'Project ID:'}/>
                        <CardText>Select the number of pipelines to display (default 5)</CardText>
                        {radioGroup}
                      </CardActions>
                    </Card>
                  </div>         
                </div>
                <div className = 'labels'>
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                    <h2>Pipeline Status</h2>
                  </div>
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                    <DataTable
                      shadow={0}
                      rows = {parsedPipelines}>
                      <TableHeader name="sourceProject" tooltip="URL of pipeline">Source Project</TableHeader>
                      <TableHeader name="sourceCommit" tooltip="Name of account that ran the pipeline">Source Commit</TableHeader>
                      <TableHeader name="deploymentDate" tooltip="Date pipeline was created">Date of Deployment</TableHeader>
                      <TableHeader name="successStatus" tooltip="Success/Failure">Status</TableHeader>
                      <TableHeader name="downloadButton" tooltip="Click to download artifacts">Download Artifact</TableHeader>
                    </DataTable>
                  </div>
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                    <h2>Most Recent Deployment</h2>
                  </div>
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                    <DataTable
                          shadow={0}
                          rows = {[{pipeline: this.state.currentDeployment}]}/*{parsedDeployments}*/>
                          <TableHeader name="pipeline" tooltip="Pipeline ID">Pipeline ID</TableHeader>
                    </DataTable>
                  </div>
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                    <p>Enter deployment script below:</p>                    
                  </div>
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                    <Script submitHandler={this.handleScriptSubmit} formTitle={''} height = {300} width = {300}/>                    
                  </div>
                </div>
              </div>
          );
        }
      }
    }
    export default App;