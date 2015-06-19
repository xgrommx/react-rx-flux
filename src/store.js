import Rx from 'rx';
import {fromJS} from 'immutable';
import Actions from './actions';

const {when, fromPromise, fromEvent} = Rx.Observable;

Rx.Observable.update = function (initial, ...patterns) {
    const observables = this.from(patterns).partition((_, i) => i % 2 === 0);

    const cb = function () {
        var args = [].slice.call(arguments);
        return (prev) => this.apply(this, [prev].concat(args));
    };

    return observables[0]
        .zip(observables[1], (stream, callback) => ({stream, callback})).toArray().flatMap(pairs =>
            Rx.Observable.when.apply(Rx.Observable, pairs.map(p => {
                if (Array.isArray(p.stream)) {
                    var obs = p.stream[0];
                    for (var i = 1; i < p.stream.length; i++) {
                        obs = obs.and(p.stream[i]);
                    }
                    return obs.thenDo(cb.bind(p.callback));
                } else {
                    return p.stream.thenDo(cb.bind(p.callback));
                }
            })).startWith(initial).scan((prev, f) => f(prev))
    )
};

let defaultPerson = {
    firstName: 'Denis',
    lastName: 'Stoyanov',
    country: {
        name: 'UA'
    },
    friends: []
};

const emulateAjaxWithDelay = (key) => new Promise(resolve =>
        setTimeout(() => resolve(Promise.resolve(fromJS(JSON.parse(localStorage.getItem(key)) || defaultPerson))), 2000)
);

const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value.toJSON()));

    return fromJS(JSON.parse(localStorage.getItem(key, value)));
};

export default (key) =>
    fromPromise(emulateAjaxWithDelay(key))
        .merge(fromEvent(window, 'storage')
            .map(({newValue}) => fromJS(JSON.parse(newValue))))
        .flatMap(p => Rx.Observable.update(p,
            Actions.changeFirstName, (person, firstName) => person.set('firstName', firstName),
            Actions.changeLastName, (person, lastName) => person.set('lastName', lastName),
            Actions.changeCountry, (person, country) => person.setIn(['country', 'name'], country),
            Actions.addFriend, (person, friend) => person.set('friends', person.get('friends').push(friend)),
            Actions.removeFriend, (person, friendIndex) => person.set('friends', person.get('friends').splice(friendIndex, 1)),
            Actions.save.debounce(200), (person, _) => saveToLocalStorage('person', person)
        )
    )