import Rx from 'rx';
import {fromJS} from 'immutable';
import Actions from './actions';

const {when, fromPromise, fromEvent} = Rx.Observable;

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
        .flatMap(p =>
            when(
                Actions.changeFirstName.thenDo(firstName => person => person.set('firstName', firstName)),
                Actions.changeLastName.thenDo(lastName => person => person.set('lastName', lastName)),
                Actions.changeCountry.thenDo(country => person => person.setIn(['country', 'name'], country)),
                Actions.addFriend.thenDo(friend => person => person.set('friends', person.get('friends').push(friend))),
                Actions.removeFriend.thenDo(friendIndex => person => person.set('friends', person.get('friends').splice(friendIndex, 1))),
                Actions.save.debounce(200).thenDo(_ => person => saveToLocalStorage('person', person))
            ).startWith(p).scan((person, action) => action(person))
    )