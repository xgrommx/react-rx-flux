import {ReplaySubject} from 'rx';

export default {
    changeFirstName: new ReplaySubject(),
    changeLastName: new ReplaySubject(),
    changeCountry: new ReplaySubject(),
    addFriend: new ReplaySubject(),
    removeFriend: new ReplaySubject(),
    save: new ReplaySubject(),
    undo: new ReplaySubject(),
    redo: new ReplaySubject()
}