import React from 'react';
import './App.css';
import Graph from './Graph/Graph';
import data from './mocks/mocks1';

function App() {
  return (
    <div className="App">
      <Graph data={data}/>
    </div>
  );
}

export default App;
