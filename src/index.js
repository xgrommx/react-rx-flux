import React from 'react';
import Person from './views/main';
import Store from './store';

import Router, {Route, Link, RouteHandler, DefaultRoute} from 'react-router';

var About = React.createClass({
    render: function () {
        return <h2>About</h2>;
    }
});

var Inbox = React.createClass({
    render: function () {
        return <h2>Inbox</h2>;
    }
});

var Home = React.createClass({
    render: function () {
        return <h2>Home</h2>;
    }
});

var App = React.createClass({
    render () {
        return (
            <div className="container">
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand" href="#">Brand</a>
                        </div>
                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            <ul className="nav navbar-nav">
                                <li><Link to="home">Home</Link></li>
                                <li><Link to="person">Person</Link></li>
                                <li><Link to="inbox">Inbox</Link></li>
                                <li><Link to="about">About</Link></li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <RouteHandler/>
            </div>
        )
    }
});

var routes = (
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