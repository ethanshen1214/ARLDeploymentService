import React, {Component} from 'react';
import './App.css';
import { HashRouter as Router, Link } from 'react-router-dom';
import { Layout, Header, Navigation, Content } from 'react-mdl';
import Paths from './Components/Paths';


//main page container JSX
class App extends Component {
    render() {
        return(
            <Router>
                <Layout>
                    <Header title="Deployment Services" scroll>
                        <Navigation>
                            <Link to='/'>Home</Link>
                            <Link to='/config'>Config</Link>
                            <Link to='/view'>Deployments</Link>
                            <Link to='/launch'>Launch</Link>
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