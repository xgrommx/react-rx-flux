import {fromJS} from 'immutable';
import {changeFirstName, changeLastName, changeCountry, addFriend, removeFriend, save, undo, redo} from './actions';
import flyd, {stream, merge} from 'flyd';
import scanMerge from 'flyd-scanmerge';
import flatMap from 'flyd-flatmap';

let defaultPerson = {
    firstName: 'Denis',
    lastName: 'Stoyanov',
    country: {
        name: 'UA'
    },
    friends: []
};

const fromPromise = (promise) => {
    var s = flyd.stream();

    promise.then(v => s(v));

    return flyd.immediate(flyd.stream([s], function () {
        return s();
    }));
};

const emulateAjaxWithDelay = (key) => new Promise(resolve =>
        setTimeout(() => resolve(fromJS(JSON.parse(localStorage.getItem(key)) || defaultPerson)), 1000)
);


const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value.toJSON()));

    return fromJS(JSON.parse(localStorage.getItem(key, value)));
};

const ajaxStream = (key) => fromPromise(emulateAjaxWithDelay(key));

export default (key) => flatMap(person => {
    return scanMerge(
        [
            [changeFirstName, (person, firstName) => {
                console.log(person);
                console.log(firstName);
                return person.set('firstName', firstName);
            }],
            [changeLastName, (person, lastName) => person.set('lastName', lastName)],
            [changeCountry, (person, country) => person.setIn(['country', 'name'], country)],
            [addFriend, (person, friend) => person.set('friends', person.get('friends').push(friend))],
            [removeFriend, (person, friendIndex) => person.set('friends', person.get('friends').splice(friendIndex, 1))],
            [save, (person, _) => saveToLocalStorage('person', person)],
            [undo, (person, historyPerson) => historyPerson],
            [redo, (person, futurePerson) => futurePerson]
        ],
        person
    )
}, ajaxStream(key));