import React, { useEffect, useState } from 'react';
import './Graph.css';
import { IGraphData } from '../LayeredGraph/interfaces/interfaces';
import { LayeredGraph } from '../LayeredGraph';

interface IProps {
  data: IGraphData;
}

const Graph: React.FC<IProps> = ({ data }) => {

  const [nodes, setNodes] = useState<any>([]);

  useEffect(() => {
    const graph = new LayeredGraph(data);
    const { nodes }: any = graph.init();
    setNodes(nodes);
  }, []);

  /** Выводим ухлы на экран */
  const nodesJSX = nodes.map((n: any) => {
      return (
        <div
          key={n.name}
          id={n.name.replace(/\s/g, '-').toLowerCase()}
          className={`node ${n.process ? 'node--process' : ''} ${n.fake ? 'node--fake' : ''}`}
          style={{
            width: n.css.width,
            height: n.css.height,
            transform: `translate(${n.css.translate.x}px, ${n.css.translate.y}px)`
          }}>
          {n.fake ? 'F' : n.name}
        </div>
      )
    }
  )

  return (
    <div className='scene'>
      {nodesJSX}
    </div>
  );
};

export default Graph;
