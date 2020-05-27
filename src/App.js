import React, {Component} from 'react';
import './App.css';
import { Layout, Grid, Cell, DataTable, TableHeader, Card, CardTitle, CardText, CardActions, RadioGroup, Radio } from 'react-mdl';
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

      componentDidMount() {   //on startup it checks to see if sessionStorage already has auth_key and/or project_id
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


      handleAuthSubmit = (value) => {   //handler for submitting authentication token
        sessionStorage.setItem('auth_key', value);
        this.setState({authorized: true, auth_key: value});
      }
      handleProjectSubmit = (value) => {  //handler for submitting project ID
        sessionStorage.setItem('project_id', value);
        pipes.getPipelinesForProject(value, 10, this.state.auth_key)
        .then((res) => {
          if(typeof res != 'undefined'){this.setState( {pipelines: res} )}  //checks for invalid input
          else{alert('invalid project id')}
        })
      }
      selectNumPipes = (e) => {  //handler for selecting number of pipelines to display
        this.setState({numPipelines: parseInt(e.target.value)});
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
            const tempPipeline = {
              sourceProject: this.state.pipelines[i].web_url,
              sourceCommit: this.state.pipelines[i].user.username,
              deploymentDate: this.state.pipelines[i].created_at,
              successStatus: this.state.pipelines[i].status,
            };
            parsedPipelines.push(tempPipeline);   //add to pipelines array
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
              <div style={{height: '900px', position: 'relative', marginLeft: '85px', marginRight: '85px'}}>
                <div className = 'labels'>
                  <div>
                    <Card shadow={3} style={{width: '420px', height: '250px', margin: 'auto', marginTop: '8%'}}>
                      <CardText>
                        Input Project ID here
                      </CardText>
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
                    </DataTable>
                  </div>         
                </div>
              </div>
          );
        }
        else {  //show startup page to enter auth key
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