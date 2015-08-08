import {CompositeDisposable} from 'rx';
import I, {Map, List} from 'immutable';
import React, {Component, PropTypes} from 'react';
import R from 'ramda';
import Loader from 'react-loader';
import Actions from '../actions';
import Store from '../store';
import ViewProfile from './profile';

class View extends Component {
    static propTypes = {
        person: PropTypes.object.isRequired,
        loaded: PropTypes.bool.isRequired,
        friend: PropTypes.string.isRequired,
        history: PropTypes.object.isRequired,
        future: PropTypes.object.isRequired,
        removeFriend: PropTypes.func.isRequired,
        addFriend: PropTypes.func.isRequired,
        undo: PropTypes.func.isRequired,
        redo: PropTypes.func.isRequired,
        handleChange: PropTypes.func.isRequired,
        onSave: PropTypes.func.isRequired
    };

    render() {
        let {person, loaded, friend, history, future, removeFriend, addFriend, undo, redo, handleChange, onSave} = this.props;

        if(!person || !(person instanceof Map) || loaded) {
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

            return <div className="row"><Loader options={options} /></div>;
        } else {
            let friendsView = (friends) => {
                if(friends.length > 0) {
                    return (<div className="panel panel-default">
                        <div className="panel-heading">
                            <h3 className="panel-title">Your Friends</h3>
                        </div>
                        <ul className="list-group">
                            {
                                friends.map((friend, i) =>
                                        <li className="list-group-item" key={i}>
                                            <span>{friend}</span>
                                            <button type="button" className="close pull-right" aria-label="Close" onClick={removeFriend.bind(this, i)}><span aria-hidden="true">&times;</span></button>
                                        </li>
                                )
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

            return (<div className="row">
                <div className="col-md-4 col-xs-4"><ViewProfile person={person} /></div>
                <div className="col-md-8 col-xs-8">
                    <form className="form-horizontal">
                        <div className="form-group">
                            <div className="col-md-offset-3 col-xs-offset-3 col-md-9 col-xs-9">
                                <div className="pull-left">
                                    <button disabled={history.size < 1} className="btn btn-success btn-block" onClick={undo}>Undo</button>
                                </div>
                                <div className="pull-right">
                                    <button disabled={future.size < 1} className="btn btn-success btn-block" onClick={redo}>Redo</button>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-md-3 col-xs-3 control-label">First Name:</label>
                            <div className="col-md-9 col-xs-9">
                                <input type="text"
                                       onChange={handleChange}
                                       name="firstName"
                                       value={person.get('firstName')}
                                       className="form-control" placeholder="First Name" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-md-3 col-xs-3 control-label">Last Name:</label>
                            <div className="col-md-9 col-xs-9">
                                <input type="text"
                                       onChange={handleChange}
                                       name="lastName"
                                       value={person.get('lastName')}
                                       className="form-control" placeholder="Last Name" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-md-3 col-xs-3 control-label">Country:</label>
                            <div className="col-md-9 col-xs-9">
                                <input type="text"
                                       onChange={handleChange}
                                       name="countryName"
                                       value={person.get('country').get('name')}
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
                                                   onChange={handleChange}
                                                   value={friend}
                                                   name="friend"/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="col-md-9 col-xs-9">
                                            <button disabled={friend == ""}
                                                    className="btn btn-success"
                                                    onClick={addFriend}>Add friend</button>
                                        </div>
                                    </div>
                                    { friendsView(person.get('friends').toArray()) }
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-md-offset-3 col-xs-offset-3 col-md-9 col-xs-9">
                                <button className="btn btn-info btn-block" onClick={onSave}>Save</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>);
        }
    }
}

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
        let {name, value}= e.target;

        if(name !== 'friend') {
            this.setState({
                history: this.state.history.push(this.state.person)
            });
        }

        switch(name) {
            case 'firstName':
                Actions.changeFirstName.onNext(value);
                break;
            case 'lastName':
                Actions.changeLastName.onNext(value);
                break;
            case 'countryName':
                Actions.changeCountry.onNext(value);
                break;
            case 'friend':
                this.setState({friend: value});
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
        return <View {...this.state}
            onSave={this.onSave}
            undo={this.undo}
            redo={this.redo}
            handleChange={this.handleChange}
            addFriend={this.addFriend}
            removeFriend={this.removeFriend}
        />
    }
}