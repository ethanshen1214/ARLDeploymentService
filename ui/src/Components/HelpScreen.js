import React, {Component} from 'react';
import { Tabs, Tab } from 'react-mdl';
import '../App.css';

export default class HelpScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeTab: 0,
    }
  }
    render() {  //help page
      if(this.state.activeTab === 0){
        return(
          <div className='labels' style={{marginLeft: '80px', marginRight: '80px'}}>
          <h1>Help Page</h1>
            <Tabs activeTab={this.state.activeTab} onChange={(tabId) => this.setState({ activeTab: tabId })} ripple>
                <Tab>Configurations</Tab>
                <Tab>Deployment Service</Tab>
                <Tab>Launch Service</Tab>
            </Tabs>
          
            <h2>Authentication Key Setup</h2>
            <p>
                Get an authentication key from gitlab and set the appropriate accesses. 
                Then, copy the provided auth key into the Config page and press submit.
                <a href = 'https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html' target = "_blank" rel="noopener noreferrer">https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html</a>
            </p>
            <h2>MongoDB Setup</h2>
            <p>
                Setup your MongoDB database through Atlas or locally on your machine (or any other service you choose). 
                Copy the generated link to your database into the Config page and press submit. <br/>
                MongoDB Atlas: <a href = 'https://www.mongodb.com/cloud/atlas'target = "_blank" rel="noopener noreferrer">https://www.mongodb.com/cloud/atlas</a>
                <br/>
                Local installation: <a href = 'https://docs.mongodb.com/guides/server/install/' target = "_blank" rel="noopener noreferrer">https://docs.mongodb.com/guides/server/install/</a>
            </p>
            <h2>Deployment Path Setup</h2>
            <p>
                Input a path to determine where the projects will be deployed. 
                It must be an absolute path from root to work.
            </p>
            <h2>Ports Setup</h2>
            <p>
                Edit the port number in the server side .env file to determine the port to run the server on. 
                After that, change the port numbers in the client side .env file to match the server port number for websockets and the API endpoint.
                The client port number can also be changed if desired.
            </p>
          </div>
        )
      }
      else if(this.state.activeTab === 1){
        return(
          <div className='labels' style={{marginLeft: '80px', marginRight: '80px'}}>
            <h1>Help Page</h1>
            <Tabs activeTab={this.state.activeTab} onChange={(tabId) => this.setState({ activeTab: tabId })} ripple>
                <Tab>Configurations</Tab>
                <Tab>Deployment Service</Tab>
                <Tab>Launch Service</Tab>
            </Tabs>
            <h2>Script input</h2>
            <p>
              Enter a script that will execute after the project artifacts are downloaded and unzipped from Gitlab.
              The current working directory of this script is the root directory of the artifact, which can be edited on the config page.
            </p>
          </div>
        )
      }
      else if(this.state.activeTab === 2){
        return(
          <div className='labels' style={{marginLeft: '80px', marginRight: '80px'}}>
            <h1>Help Page</h1>
            <Tabs activeTab={this.state.activeTab} onChange={(tabId) => this.setState({ activeTab: tabId })} ripple>
                <Tab>Configurations</Tab>
                <Tab>Deployment Service</Tab>
                <Tab>Launch Service</Tab>
            </Tabs>
            <h2>Adding a Project</h2>
            <p>
              1) The Project Name must be unique.<br/>
              2) The Launch Path determines where the app will try to find the project in your local directory. It must be an absolute path (from root) to work.<br/>
              3) The Start Script will be run to start or launch the selected project.<br/>
              4) The Stop Script will be run to end the selected project.
            </p>
            <h2>Launch From Command Line</h2>
            <p>
              <b>Example Start command:</b> curl --header "Content-Type: application/json" --request POST --data '{'{'}"projectName": "name-of-project"{'}'}' http://localhost:8080/launch/start<br/>
              <b>Example Stop command:</b> curl --header "Content-Type: application/json" --request POST http://localhost:8080/launch/stop
            </p>
            <h2>General</h2>
            <p>
              1) Starting a project will stop the previously running project to conserve system resources.<br/>
              2) Only one project can be running at once.
            </p>
          </div>
        )
      }
    }
  }