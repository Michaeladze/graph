import React, { useEffect, useState } from 'react';
import './App.css';
import Graph from './Graph/Graph';
import { IGraphData } from './Graph/LayeredGraph/interfaces/interfaces';

function App() {

  const [data, setData] = useState<IGraphData | null>(null)

  useEffect(() => {
    window.addEventListener('renderGraph', (e: any) => {
      setData(e.detail);
    });
  }, [])

  return (
    <div className="App">
      {data && <Graph data={data}/>}
    </div>
  );
}

export default App;
