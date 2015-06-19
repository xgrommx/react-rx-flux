import {Subject} from 'rx';

export default {
    changeFirstName: new Subject(),
    changeLastName: new Subject(),
    changeCountry: new Subject(),
    addFriend: new Subject(),
    removeFriend: new Subject(),
    save: new Subject()
}