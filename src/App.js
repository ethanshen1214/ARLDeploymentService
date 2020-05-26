import React, {Component} from 'react';
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
        return(
          <div>
            <h1>Pipelines</h1>
            <p>{JSON.stringify(this.state.pipelines, null, 4)}</p>
          </div>
        );
      }
    }

    export default App;