import React, {Component} from 'react';
import './App.css';
import { Layout, Grid, Cell, DataTable, TableHeader, Card, CardTitle, CardText, CardActions, Button, Checkbox } from 'react-mdl';
import Form from './Components/form';
const pipes = require('./API_Functions/pipelines.js');
const fs = require('fs');

//zJLxDfYVS87Ar2NRp52K
//18820410
//18876221
    class App extends Component {

      constructor(props){
        super(props);
        this.state = {
          pipelines: [],
          auth_key: '',
          numPipelines: 5,
        }
      }

      componentDidMount() {
        if (sessionStorage.getItem('auth_key') != null && sessionStorage.getItem('project_id') != null){
          this.setState({auth_key: sessionStorage.getItem('auth_key')}, () => pipes.getPipelinesForProject(sessionStorage.getItem('project_id'), 10, this.state.auth_key)
          .then((res) => {
            if(typeof res != 'undefined'){this.setState( {pipelines: res} )}
            else{alert('invalid project id')}
          })
        )}
        else if(sessionStorage.getItem('auth_key') != null && sessionStorage.getItem('project_id') == null){
          this.setState({authorized: true, auth_key: sessionStorage.getItem('auth_key')});
        }
      }

      handleAuthSubmit = (value) => {
        sessionStorage.setItem('auth_key', value);
        this.setState({authorized: true, auth_key: value});
      }
      handleProjectSubmit = (value) => {
        sessionStorage.setItem('project_id', value);
        pipes.getPipelinesForProject(value, 10, this.state.auth_key)
        .then((res) => {
          if(typeof res != 'undefined'){this.setState( {pipelines: res} )}
          else{alert('invalid project id')}
        })
      }
      selectOne = (value) => {
        this.setState({numPipelines: 1});
      }
      selectFive = (value) => {
        this.setState({numPipelines: 5});
      }
      selectTen = (value) => {
        this.setState({numPipelines: 10});
      }

      render () {
        if (this.state.auth_key != '') {
          const parsedPipelines = [];
          const parsedProjects = [];
          const parsedGroups = [];

          for(let i = 0; i < 5; i++)
          {
            const tempProject = {
              projectName: 'thisIsATestProject'
            };
            parsedProjects.push(tempProject);
          }

          let displayPipes = this.state.pipelines.length;
          if(this.state.pipelines.length >= this.state.numPipelines){
            displayPipes = this.state.numPipelines
          }
          //for(let i = 0; i < this.state.pipelines.length; i++)
          for(let i = 0; i < displayPipes; i++)
          {
            const tempPipeline = {
              sourceProject: this.state.pipelines[i].web_url,
              sourceCommit: this.state.pipelines[i].user.username,
              deploymentDate: this.state.pipelines[i].created_at,
              successStatus: this.state.pipelines[i].status,
            };
            parsedPipelines.push(tempPipeline);
          }

          return(
              <div style={{height: '3200px', position: 'relative', marginLeft: '85px', marginRight: '85px'}}>
                <div className = 'labels'>
                  <div>
                    <Card shadow={3} style={{width: '420px', height: '50px', margin: 'auto', marginTop: '8%'}}>
                      <CardText>
                        Input Project ID here
                      </CardText>
                      <CardActions border>
                        <Form submitHandler={this.handleProjectSubmit} formTitle={'Project ID:'}/>
                        <CardText>Select the number of pipelines to display (default 5)</CardText>
                        <Checkbox label = '1' onChange = {this.setOne}/>
                        <Checkbox label = '5' onChange = {this.setFive}/>
                        <Checkbox label = '10'onChange = {this.setTen}/>
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
                    </DataTable>
                  </div>         
                </div>
              </div>
          );
        }
        else {
          return (
            <div className = 'labels'>
              <Card shadow={3} style={{width: '420px', height: '320px', margin: 'auto', marginTop: '8%'}}>
                <CardTitle expand style={{color: '#fff', background: 'url(http://www.getmdl.io/assets/demos/dog.png) bottom right 15% no-repeat #46B6AC'}}></CardTitle>
                <CardText>
                  Please input a valid Personal Access Token from Gitlab to view project pipeline statuses. Or else.
                </CardText>
                <CardActions border>
                  <Form submitHandler={this.handleAuthSubmit} formTitle={'Authorization Token:'}/>
                </CardActions>
              </Card>
            </div>

          );
        }
      }
    }
    export default App;