import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';

import Root from './indexSPA';

const reactLifecycles = singleSpaReact({
  // @ts-ignore
  React,
  ReactDOM,
  rootComponent: Root,
  domElementGetter: () => {
    let div = document.getElementById('container');
    if (!div) {
      div = document.createElement('div');
      div.id = 'container';
    }
    return div;
  },
  errorBoundary(err, info, props) {
    console.log('---------------');
    console.log(err);
    console.log(info);
    console.log(props);
    console.log('---------------');
    // https://reactjs.org/docs/error-boundaries.html
    return <div>This renders when a catastrophic error occurs</div>;
  }
});

export const bootstrap = reactLifecycles.bootstrap;
export const mount = reactLifecycles.mount;
export const unmount = reactLifecycles.unmount;
