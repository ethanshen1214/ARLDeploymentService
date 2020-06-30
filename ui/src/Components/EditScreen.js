import React, {Component} from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { Card, CardTitle, CardActions} from 'react-mdl';
import axios from 'axios';
import swal from 'sweetalert';
const apiEndpointUrl = process.env.REACT_APP_API_ENDPOINT_URL || 'http://localhost:8080';

export default class EditScreen extends Component{

    constructor(props){
        super(props);
        this.state = {
            name: '',
            startScript: '',
            stopScript: '',
            path: '',
        }
    }
    async componentDidMount(){
        const projectName = this.props.match.params.name;
        const response = await axios.post(`${apiEndpointUrl}/launchDB/getOne`, {projectName: projectName});
        console.log(response);
        this.setState({name: projectName, startScript: response.data.data.startScript, stopScript: response.data.data.stopScript, path: response.data.data.path})
    }
    handleChange = (e) => {
        const {name, value} = e.target;
        this.setState({[name]: value});
    }
    handleSubmit = async (e) => {
        const projectName = this.props.match.params.name;
        e.preventDefault();
        const result = await axios.post(`${apiEndpointUrl}/launchDB/updateData`, {projectName: projectName, update: this.state});
        if(!result.data.success){
            if(result.data.type === 'filePath'){
                swal({
                    title: "Error",
                    text: "Did not update database because filepath is invalid",
                    icon: "warning",
                });
            }
        }
        else{
            swal({
                text: "Changes successfully saved.",
                icon: "success",
            });
        }
    }
    render(){
        return(
            <div>
                <Card shadow={3} style={{width: '420px', height: '750px', margin: 'auto', marginTop: '3%'}}>
                      <CardActions border>
                          <CardTitle>Editing: {this.state.name}</CardTitle>
                        <form onSubmit={this.handleSubmit} style = {{marginLeft: '20px'}}>
                            <div>
                                <label>Launch Path:</label>
                            </div>
                            <div style = {{marginBottom: '20px'}}>
                                <input
                                    type="text"
                                    name="path"
                                    value={this.state.path}
                                    onChange={this.handleChange}
                                    style = {{width: '300px'}}
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
                                <input type="submit" value="Save Changes" />
                                <Link to={`/launch`}><button>Return</button></Link>
                            </div>
                        </form>
                      </CardActions>
                    </Card>
            </div>
        )
    }
}