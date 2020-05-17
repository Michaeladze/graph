import React from 'react';
import './App.css';
import Graph from './Graph/Graph';

function App() {

  // @ts-ignore
  const data = window.GRAPH_DATA;

  return (
    <div className="App">
      <Graph data={data}/>
    </div>
  );
}

export default App;
