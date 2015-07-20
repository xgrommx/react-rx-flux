import React from 'react';

import Person from './views/main';
import About from './views/about';
import Inbox from './views/inbox';
import Home from './views/home';
import App from './views/app';

import Store from './store';

import Router, {Route, DefaultRoute} from 'react-router';

const routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="home" path="home" handler={Home}/>
        <Route name="about" path="about" handler={About}/>
        <Route name="inbox" path="inbox" handler={Inbox}/>
        <Route name="person" path="person" handler={Person}/>
        <DefaultRoute handler={Home}/>
    </Route>
);

Router.run(routes, function(Handler, route) {
    console.log(route.routes[1].name);
    React.render(<Handler/>, document.body);
});