import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'core-js/features/array/find';
import 'core-js/features/array/fill';
import 'core-js/features/array/includes';
import 'core-js/features/number/is-nan';
import 'core-js/features/string';
import 'core-js/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
