import React, {Component} from 'react';
import './App.css';
import { Layout, Grid, Cell, DataTable, TableHeader } from 'react-mdl';
import Form from './Components/form';
const pipes = require('./API_Functions/pipelines.js');


    class App extends Component {

      constructor(props){
        super(props);
        this.state = {
          pipelines: [],
          authorized: false,
          auth_key: 'zJLxDfYVS87Ar2NRp52K',
        }
      }

      // componentDidMount() {
      //   pipes.getPipelinesForProject(18820410, 5,'zJLxDfYVS87Ar2NRp52K').then((res) => this.setState( {pipelines:res} ));
      // }

      handleSubmit = () => {
        pipes.getPipelinesForProject(18820410, 5, this.state.auth_key).then((res) => this.setState( {pipelines: res} ));
        this.setState({authorized: true});
      }

      render () {
        if (this.state.authorized) {
          const parsedPipelines = [];

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
                  <h1>Current Pipelines</h1>
                  <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
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
            <div>
              <Form submitHandler={this.handleSubmit}/>
            </div>
          );
        }
      }
    }
    export default App;