import React, {Component} from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { DataTable, TableHeader, Card, CardText, CardTitle, CardActions, Spinner, Chip, Grid, Cell } from 'react-mdl';
import Script from './scriptInput';
import axios from 'axios';

export default class LaunchScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            name: '',
            startScript: '',
            stopScript: '',
        }
    }
    handleChange = (e) => {
        const {name, value} = e.target;
        this.setState({[name]: value});
    }
    handleSubmit = (e) => {
        e.preventDefault();
        console.log(this.state);
    }

    render() {
        const DB = [];
        return(
        <div style={{height: '800px', width: '1000px', margin: 'auto'}}>
          <div className = 'labels'>
            <div style = {{display: 'flex',alignItems: 'center',justifyContent: 'center', }}><h1>GitLab Launch Util</h1></div>
            <div>
              <Grid>
                <Cell col = {7} >
                    <input
                      type="text"
                      placeholder="Search"
                      value={this.state.searchTerm}
                      onChange={this.handleProjectSearch} 
                      style = {{marginTop: '10px'}}
                    />                    
                    <div className = 'table' style={{height:'650px'}}>
                      <DataTable
                            shadow={0}
                            rows = {DB}
                            style = {{marginTop: '10px'}}>
                            <TableHeader name="name" tooltip="Project Name">Project Name</TableHeader>
                            <TableHeader name="editProjectButton" tooltip="Click to change the working project">Edit Project</TableHeader>
                            <TableHeader name="launchProjectButton" tooltip="Currently deployed pipeline">Launch Project</TableHeader>
                      </DataTable> 
                    </div>
                </Cell>
                <Cell col = {5}>
                    <Card shadow={3} style={{width: '420px', height: '650px', margin: 'auto', marginTop: '3%'}}>
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
                            </div>
                        </form>
                      </CardActions>
                    </Card>
                </Cell>
              </Grid>
            </div>
          </div>
        </div>
        );
    }
}