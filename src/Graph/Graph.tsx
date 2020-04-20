import React, { useEffect, useState } from 'react';
import './Graph.css';
import { IGraphData } from '../LayeredGraph/interfaces/interfaces';
import { LayeredGraph } from '../LayeredGraph';
import GraphNode from '../GraphNode/GraphNode';

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
          className={`graph__node ${n.fake ? 'graph__node--fake' : ''}`}
          style={{
            width: n.css.width,
            height: n.css.height,
            transform: `translate(${n.css.translate.x}px, ${n.css.translate.y}px)`
          }}>
          {n.node && <GraphNode item={n}/>}
          {n.count && <span className='graph__edge-count'>{n.count}</span>}
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
