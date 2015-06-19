import {CompositeDisposable} from 'rx';
import React, {Component} from 'react';
import {Map} from 'immutable';
import Store from '../store';

export default class extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if(this.props.person instanceof Map) {
            return (
                <div>
                    <p>
                        FirstName { this.props.person.get('firstName') } <br/>
                        LastName { this.props.person.get('lastName') } <br/>
                        Country { this.props.person.get('country').get('name') }
                    </p>
                    <p>Friends</p>
                    <ul>
                        {this.props.person.get('friends').toArray().map((friend, i) => (<li key={i}>{friend}</li>))}
                    </ul>
                </div>
            );
        } else {
            return (<div>Loading...</div>);
        }
    }
}