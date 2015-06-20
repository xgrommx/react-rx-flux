import Rx from 'rx';
import {fromJS} from 'immutable';
import Actions from './actions';

const {when, fromPromise, fromEvent} = Rx.Observable;

Rx.Observable.update = function () {
    const args = [].slice.call(arguments);

    return this.zip.apply(this,
        Rx.Observable.from(args.slice(1))
            .partition((_, i) => i % 2 === 0)
            .concat([(stream, callback) => ({stream, callback})])
    ).toArray()
        .flatMap(pairs =>
            Rx.Observable.when.apply(
                Rx.Observable,
                pairs.map(p =>
                    (Array.isArray(p.stream) ? p.stream.reduce((prev, next) => prev.and(next)) : p.stream).thenDo(function (args) {
                        return (prev) => p.callback.apply(p.callback, [prev].concat([].slice.call(arguments)));
                    })))
                )
        .startWith(args[0])
        .scan((prev, f) => f(prev))
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
        setTimeout(() => resolve(Promise.resolve(fromJS(JSON.parse(localStorage.getItem(key)) || defaultPerson))), 1000)
);

const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value.toJSON()));

    return fromJS(JSON.parse(localStorage.getItem(key, value)));
};

export default (key) =>
    fromPromise(emulateAjaxWithDelay(key))
        .merge(fromEvent(window, 'storage').map(({newValue}) => fromJS(JSON.parse(newValue))))
        .flatMap(p => Rx.Observable.update(p,
            Actions.changeFirstName, (person, firstName) => person.set('firstName', firstName),
            Actions.changeLastName, (person, lastName) => person.set('lastName', lastName),
            Actions.changeCountry, (person, country) => person.setIn(['country', 'name'], country),
            Actions.addFriend, (person, friend) => person.set('friends', person.get('friends').push(friend)),
            Actions.removeFriend, (person, friendIndex) => person.set('friends', person.get('friends').splice(friendIndex, 1)),
            Actions.save.debounce(200), (person, _) => saveToLocalStorage('person', person)
        )
    )