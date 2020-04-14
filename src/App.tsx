import React from 'react';
import './App.css';
import Graph from './Graph/Graph';
import data from './mocks/mocks';

function App() {
  return (
    <div className="App">
      <Graph data={data}/>
    </div>
  );
}

export default App;
