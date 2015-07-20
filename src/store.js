import Rx from 'rx';
import RxExtensions, {update} from './rx-extensions';
import I, {fromJS} from 'immutable';
import Actions from './actions';

const {fromPromise, fromEvent, from} = Rx.Observable;

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
        Actions.changeFirstName, (person, firstName) => person.set('firstName', firstName),
        Actions.changeLastName, (person, lastName) => person.set('lastName', lastName),
        Actions.changeCountry, (person, country) => person.setIn(['country', 'name'], country),
        Actions.addFriend, (person, friend) => person.set('friends', person.get('friends').push(friend)),
        Actions.removeFriend, (person, friendIndex) => person.set('friends', person.get('friends').splice(friendIndex, 1)),
        Actions.save.debounce(200), (person, _) => saveToLocalStorage('person', person),
        Actions.undo, (person, historyPerson) => historyPerson,
        Actions.redo, (person, futurePerson) => futurePerson
    )
)