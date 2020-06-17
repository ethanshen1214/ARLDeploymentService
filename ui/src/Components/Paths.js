import React from 'react';
import { Switch, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import DeploymentScreen from './DeploymentScreen';
import HelpScreen from './HelpScreen';

export default function Paths() {
    return(
        <Switch>
            <Route path="/view/:id" component={DeploymentScreen} />
            <Route path="/view" component={DeploymentScreen} />
            <Route path="/help" component={HelpScreen} />
            <Route path="/" component={HomeScreen} />
        </Switch>
    )

}