import React, {Component} from 'react';
import '../App.css';

export default class HelpScreen extends Component {
    render() {
      return (
        <div className='labels' style={{marginLeft: '80px', marginRight: '80px'}}>
            <h1>Help Page</h1>
            <h2>General</h2>
            <p>
              If nothing is showing up on the Deployments page, it is likely that the Authentication key or MongoDB URL is invalid.
              Follow the steps below to re-configure the appropriate parameters.
            </p>
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
            <h2>Ports Setup</h2>
            <p>
                Edit the port number in the server side .env file to determine the port to run the server on. 
                After that, change the port numbers in the client side .env file to match the server port number for websockets and the API endpoint.
                The client port number can also be changed if desired.
            </p>
        </div>
      );
    }
  }