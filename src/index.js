import React from 'react';
import App from './views/main';

React.render(<App />, document.body);

window.addEventListener('patch', () => {
    React.render(<App />, document.body);
});