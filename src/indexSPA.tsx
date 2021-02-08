import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import App from './App';

const Root = (props: any) => {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

export default Root;
