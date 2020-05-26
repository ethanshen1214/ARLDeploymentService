import React, {Component} from 'react';
import './App.css';
import { Layout, Grid, Cell, DataTable, TableHeader } from 'react-mdl';
const pipes = require('./API_Functions/pipelines.js');


    class App extends Component {

      constructor(props){
        super(props);
        this.state = {
          pipelines: [],
          str: "test",
        }
      }

      componentDidMount() {
        pipes.getPipelinesForProject(18820410, 5,'zJLxDfYVS87Ar2NRp52K').then((res) => this.setState( {pipelines:res} ));
      }

      render () {

        const projectData = [];
        const commitData = [];
        const deploymentDates = [];
        projectData.push(<h2>Source Project</h2>)
        commitData.push(<h2>Source Commit</h2>);
        deploymentDates.push(<h2>Deployment Date</h2>);

        const parsedPipelines = [];

        for(let i = 0; i < this.state.pipelines.length; i++)
        {
          // projectData.push(<p>{this.state.pipelines[i].web_url}</p>);
          // commitData.push(<p>{this.state.pipelines[i].user.username}</p>);
          // deploymentDates.push(<p>{this.state.pipelines[i].created_at}</p>);
          const tempPipeline = {
            sourceProject: this.state.pipelines[i].web_url,
            sourceCommit: this.state.pipelines[i].user.username,
            deploymentDate: this.state.pipelines[i].created_at,
          };
          parsedPipelines.push(tempPipeline);
        }


        return(
          <div style={{height: '3200px', position: 'relative', marginLeft: '85px', marginRight: '85px'}}>
            {/* <Layout style = {{background: '#ffffff'}}>
              <div className = 'labels'>
                <h1>Current Pipelines</h1>
                <Grid>
                  <Cell col = {4}>
                    <div>{projectData}</div>
                  </Cell>
                  <Cell col = {4}>
                    <div>{commitData}</div>
                  </Cell>
                  <Cell col = {4}>
                    <div>{deploymentDates}</div>
                  </Cell>
                </Grid>
              </div>
            </Layout> */}

            <div className = 'labels'>
              <h1>Current Pipelines</h1>
              <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
                <DataTable
                  shadow={0}
                  rows = {parsedPipelines}>
                  <TableHeader name="sourceProject" tooltip="The amazing material name">Source Project</TableHeader>
                  <TableHeader name="sourceCommit" tooltip="Number of materials">Source Commit</TableHeader>
                  <TableHeader name="deploymentDate" tooltip="Price pet unit">Date of Deployment</TableHeader>
                </DataTable>      
              </div>
                        
            </div>
            
          </div>
        );
      }
    }

    export default App;