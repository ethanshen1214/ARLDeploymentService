import React, {Component} from 'react';
import './App.css';
import { HashRouter as Router, Link } from 'react-router-dom';
import { Layout, Header, Navigation, Content } from 'react-mdl';
import Paths from './Components/Paths';


//zJLxDfYVS87Ar2NRp52K
//18820410
//18876221



class App extends Component {
  render() {
    return(
      <Router>
        <Layout>
            <Header title="Hi Trevor :)" scroll>
                <Navigation>
                    <Link to='/'>Home</Link>
                    <Link to='/view'>Deployments</Link>
                    <Link to='/config'>Config</Link>
                    <Link to='/help'>Help</Link>
                </Navigation>
            </Header>
            <Content>
                <Paths/>
            </Content>
        </Layout>
      </Router>


    );
  }
}
export default App;