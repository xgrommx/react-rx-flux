import {CompositeDisposable} from 'rx';
import I, {Map, List} from 'immutable';
import React, {Component} from 'react';
import R from 'ramda';
import Loader from 'react-loader';
import Actions from '../actions';
import Store from '../store';
import ViewProfile from './profile';

export default class extends Component {
    state = {
        person: {},
        friend: "",
        loaded: false,
        history: List(),
        future: List()
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.loadData();
    }

    loadData = () => {
        this.disposables = new CompositeDisposable();

        this.disposables.add(Store('person').subscribe(person =>
            this.setState({
                person,
                loaded: false
            })
        ));
    };

    onSave = (e) => {
        e.preventDefault();
        this.setState({
            loaded: true,
            history: new List(),
            future: new List()
        });
        Actions.save.onNext();
    };

    undo = (e) => {
        e.preventDefault();
        if (this.state.history.size < 1) return;
        this.setState({
            history: this.state.history.pop(),
            future: this.state.future.push(this.state.person)
        });
        Actions.undo.onNext(this.state.history.last());
    };

    redo = (e) => {
        e.preventDefault();
        if (this.state.future.size < 1) return;
        this.setState({
            history: this.state.history.push(this.state.person),
            future: this.state.future.pop()
        });
        Actions.redo.onNext(this.state.future.last());
    };

    handleChange = (e) => {
        let name = e.target.name;
        let val = e.target.value;

        if(name !== 'friend') {
            this.setState({
                history: this.state.history.push(this.state.person)
            });
        }

        switch(name) {
            case 'firstName':
                Actions.changeFirstName.onNext(val);
                break;
            case 'lastName':
                Actions.changeLastName.onNext(val);
                break;
            case 'countryName':
                Actions.changeCountry.onNext(val);
                break;
            case 'friend':
                this.setState({friend: val});
                break;
        }
    };

    addFriend = () => {
        this.setState({
            history: this.state.history.push(this.state.person)
        });

        Actions.addFriend.onNext(this.state.friend);
        this.setState({friend: ""});
    };

    removeFriend = (friendIndex) => {
        this.setState({
            history: this.state.history.push(this.state.person)
        });
        Actions.removeFriend.onNext(friendIndex)
    };

    render() {
        if(!this.state.person || !(this.state.person instanceof Map) || this.state.loaded) {
            let options = {
                lines: 17,
                length: 20,
                width: 15,
                radius: 50,
                corners: 1,
                rotate: 0,
                direction: 1,
                color: '#000',
                speed: 1,
                trail: 60,
                shadow: false,
                hwaccel: false,
                zIndex: 2e9,
                top: '50%',
                left: '50%',
                scale: 1.00
            };

            return (<div style={{marginTop: '40px'}} className="container">
                <Loader options={options} />
            </div>);
        } else {
            let friendsView = (friends) => {
                if(friends.length > 0) {
                    return (<div className="panel panel-default">
                        <div className="panel-heading">
                            <h3 className="panel-title">Your Friends</h3>
                        </div>
                        <ul className="list-group">
                            {
                                friends.map(function(friend, i) {
                                    return <li className="list-group-item" key={i}>
                                        <span>{friend}</span>
                                        <button type="button" className="close pull-right" aria-label="Close" onClick={this.removeFriend.bind(this, i)}><span aria-hidden="true">&times;</span></button>
                                    </li>;
                                }.bind(this))
                            }
                        </ul>
                        <div className="panel-footer clearfix">
                            <div className="pull-right">
                                Friends <span className="badge">{friends.length}</span>
                            </div>
                        </div>
                    </div>);
                } else {
                    return (<div>No friends.</div>);
                }
            };

            return (<div style={{marginTop: '40px'}} className="container">
                <div className="col-md-3 col-xs-3"><ViewProfile person={this.state.person} /></div>
                <div className="col-md-9 col-xs-9">
                    <form className="form-horizontal">
                        <div className="form-group">
                            <div className="col-md-offset-3 col-xs-offset-3 col-md-9 col-xs-9">
                                <div className="pull-left">
                                    <button disabled={this.state.history.size < 1} className="btn btn-success btn-block" onClick={this.undo}>Undo</button>
                                </div>
                                <div className="pull-right">
                                    <button disabled={this.state.future.size < 1} className="btn btn-success btn-block" onClick={this.redo}>Redo</button>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-md-3 col-xs-3 control-label">First Name:</label>
                            <div className="col-md-9 col-xs-9">
                                <input type="text"
                                       onChange={this.handleChange}
                                       name="firstName"
                                       value={this.state.person.get('firstName')}
                                       className="form-control" placeholder="First Name" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-md-3 col-xs-3 control-label">Last Name:</label>
                            <div className="col-md-9 col-xs-9">
                                <input type="text"
                                       onChange={this.handleChange}
                                       name="lastName"
                                       value={this.state.person.get('lastName')}
                                       className="form-control" placeholder="Last Name" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-md-3 col-xs-3 control-label">Country:</label>
                            <div className="col-md-9 col-xs-9">
                                <input type="text"
                                       onChange={this.handleChange}
                                       name="countryName"
                                       value={this.state.person.get('country').get('name')}
                                       className="form-control" placeholder="Country" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-md-3 col-xs-3 control-label">Friends:</label>
                            <div className="col-md-9 col-xs-9">
                                <div className="form-control-static">
                                    <div className="form-group">
                                        <div className="col-md-12 col-xs-12">
                                            <input className="form-control"
                                                   placeholder="Friend"
                                                   type="text"
                                                   onChange={this.handleChange}
                                                   value={this.state.friend}
                                                   name="friend"/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="col-md-9 col-xs-9">
                                            <button disabled={this.state.friend == ""}
                                                    className="btn btn-success"
                                                    onClick={this.addFriend}>Add friend</button>
                                        </div>
                                    </div>
                                    { friendsView(this.state.person.get('friends').toArray()) }
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-md-offset-3 col-xs-offset-3 col-md-9 col-xs-9">
                                <button className="btn btn-info btn-block" onClick={this.onSave}>Save</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>);
        }
    }
}