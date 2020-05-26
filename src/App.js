import React, {Component} from 'react';
import './App.css';
import { Layout, Grid, Cell, DataTable, TableHeader, Card, CardTitle, CardText, CardActions, Button } from 'react-mdl';
import Form from './Components/form';
import { UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
const pipes = require('./API_Functions/pipelines.js');


    class App extends Component {

      constructor(props){
        super(props);
        this.state = {
          pipelines: [],
          authorized: false,
          auth_key: '',
        }
      }

      // componentDidMount() {
      //   pipes.getPipelinesForProject(18820410, 5,'zJLxDfYVS87Ar2NRp52K').then((res) => this.setState( {pipelines:res} ));
      // }

      // handleSubmit = async (value) => {
      //   await this.setState({authorized: true, auth_key: value});
      //   pipes.getPipelinesForProject(18820410, 5, this.state.auth_key).then((res) => this.setState( {pipelines: res} ));
      // }

      handleSubmit = (value) => {
        this.setState({authorized: true, auth_key: value}, () => pipes.getPipelinesForProject(18820410, 10, this.state.auth_key).then((res) => this.setState( {pipelines: res} )));
      }

      render () {
        if (this.state.authorized) {
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

          for(let i = 0; i < this.state.pipelines.length; i++)
          {
            const tempPipeline = {
              sourceProject: this.state.pipelines[i].web_url,
              sourceCommit: this.state.pipelines[i].user.username,
              deploymentDate: this.state.pipelines[i].created_at,
            };
            parsedPipelines.push(tempPipeline);
          }

          return(
              <div style={{height: '3200px', position: 'relative', marginLeft: '85px', marginRight: '85px'}}>
                <div className = 'labels'>
                  <h2>Projects in this group</h2>
                  <div>
                    <DataTable
                      selectable
                      shadow={0}
                      rows = {parsedProjects}>
                      <TableHeader name="projectName" tooltip="Project Name">Project Name</TableHeader>
                    </DataTable>      
                  </div>         
                </div>
                <div className = 'labels'>
                  <h2>Pipeline Status</h2>
                  <div /*style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}*/>
                    <DataTable
                      shadow={0}
                      rows = {parsedPipelines}>
                      <TableHeader name="sourceProject" tooltip="URL of pipeline">Source Project</TableHeader>
                      <TableHeader name="sourceCommit" tooltip="Name of account that ran the pipeline">Source Commit</TableHeader>
                      <TableHeader name="deploymentDate" tooltip="Date pipeline was created">Date of Deployment</TableHeader>
                    </DataTable>      
                  </div>         
                </div>
              </div>
          );
        }
        else {
          return (
            <div className = 'labels'>
              {/* <p>Please input a valid Personal Access Token from Gitlab to view project pipeline statuses</p>
              <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center',
                height: '100px', position: 'relative', marginLeft: '85px', marginRight: '85px', marginTop: '8%'}}>
                <Form submitHandler={this.handleSubmit}/>
              </div> */}
              <Card shadow={3} style={{width: '420px', height: '320px', margin: 'auto', marginTop: '8%'}}>
                <CardTitle expand style={{color: '#fff', background: 'url(http://www.getmdl.io/assets/demos/dog.png) bottom right 15% no-repeat #46B6AC'}}></CardTitle>
                <CardText>
                  Please input a valid Personal Access Token from Gitlab to view project pipeline statuses. Or else.
                </CardText>
                <CardActions border>
                  <Form submitHandler={this.handleSubmit}/>
                </CardActions>
              </Card>

            </div>

          );
        }
      }
    }
    export default App;