import React, { useState } from 'react';
import './App.css';
import Graph from './Graph/Graph';


import data1 from './mocks/mock-1';
import data2 from './mocks/mock-2';
import data3 from './mocks/mock-3';
import data4 from './mocks/mock-4';
import data5 from './mocks/mock-5';
import data6 from './mocks/graph1.json';
import data7 from './mocks/graph2.json';
import data8 from './mocks/graph3.json';

function App() {

  const datasets: any = [
    {
      id: 1,
      data: data1
    },
    {
      id: 2,
      data: data2
    },
    {
      id: 3,
      data: data3
    },
    {
      id: 4,
      data: data4
    },
    {
      id: 5,
      data: data5
    },
    {
      id: 6,
      data: data6
    },
    {
      id: 7,
      data: data7
    },
    {
      id: 8,
      data: data8
    }
  ]

  const [data, setData] = useState<any>(data1);
  const [active, setActive] = useState(1);

  const onClick = (d: any) => {
    setActive(d.id);
    setData(d.data);
  }

  return (
    <div className="root">
      <nav className="nav">
        {
          datasets.map((d: any) =>
            <button key={d.id} className={`nav__link ${active === d.id ? 'active' : ''}`}
                    onClick={() => onClick(d)}> DataSet {d.id}</button>)
        }
      </nav>
      <Graph data={data}/>
    </div>
  );
}

export default App;
