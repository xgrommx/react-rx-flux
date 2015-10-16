import React from 'react';
import {render} from 'react-dom';
import { createHistory, useBasename } from 'history'

import Person from './views/main';
import About from './views/about';
import Inbox from './views/inbox';
import Home from './views/home';
import App from './views/app';

import Store from './store';

import {Router, Route, IndexRoute} from 'react-router';

//<Route path="about" component={About}/>
//<Route path="inbox" component={Inbox}/>

const routes = (
    <Router history={createHistory()}>
        <Route path="/" component={App}>
            <Route path="home" component={Home}/>
            <Route path="person" component={Person}/>
            <IndexRoute component={Home}/>
        </Route>
    </Router>
);


render(routes, document.getElementById('app'));