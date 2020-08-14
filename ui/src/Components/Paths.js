import React from 'react';
import { Switch, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import DeploymentScreen from './DeploymentScreen';
import HelpScreen from './HelpScreen';
import ConfigScreen from './ConfigScreen';
import LaunchScreen from './LaunchScreen';

export default function Paths() {
    return( //router component that controls which page is loaded
        <Switch>
            <Route path="/view/:id" component={DeploymentScreen} />
            <Route path="/view" component={DeploymentScreen} />
            <Route path="/help" component={HelpScreen} />
            <Route path="/config" component={ConfigScreen}/>
            <Route path="/launch" component={LaunchScreen}/>
            <Route path="/" component={HomeScreen} />
        </Switch>
    )
}