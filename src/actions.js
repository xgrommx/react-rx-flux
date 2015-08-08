import {stream} from 'flyd/lib/index';

export default {
    changeFirstName: stream(),
        changeLastName: stream(),
        changeCountry: stream(),
        addFriend: stream(),
        removeFriend: stream(),
        save: stream(),
        undo: stream(),
        redo: stream()
}