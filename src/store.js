import {update, fromPromise, fromEvent, from} from './rx-extensions';
import {fromJS} from 'immutable';
import {changeFirstName, changeLastName, changeCountry, addFriend, removeFriend, save, undo, redo} from './actions';

let defaultPerson = {
    firstName: 'Denis',
    lastName: 'Stoyanov',
    country: {
        name: 'UA'
    },
    friends: []
};

const emulateAjaxWithDelay = (key) => new Promise(resolve =>
        setTimeout(() => resolve(fromJS(JSON.parse(localStorage.getItem(key)) || defaultPerson)), 1000)
);

const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value.toJSON()));

    return fromJS(JSON.parse(localStorage.getItem(key, value)));
};

export default (key) => fromPromise(emulateAjaxWithDelay(key))
    .merge(fromEvent(window, 'storage').map(({newValue}) => fromJS(JSON.parse(newValue))))
    .flatMap(p => update(p,
        changeFirstName, (person, firstName) => person.set('firstName', firstName),
        changeLastName, (person, lastName) => person.set('lastName', lastName),
        changeCountry, (person, country) => person.setIn(['country', 'name'], country),
        addFriend, (person, friend) => person.set('friends', person.get('friends').push(friend)),
        removeFriend, (person, friendIndex) => person.set('friends', person.get('friends').splice(friendIndex, 1)),
        save.debounce(200), (person, _) => saveToLocalStorage('person', person),
        undo, (person, historyPerson) => historyPerson,
        redo, (person, futurePerson) => futurePerson
    )
)