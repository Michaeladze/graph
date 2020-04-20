import React from 'react';
import './GraphNode.css';

interface IProps {
  item: any;
}

const GraphNode: React.FC<IProps> = ({ item }) => {

  return (
    <div className={`node__content ${item.node.type ? 'node__content--bounds' : ''}`}>
      {item.node.type ?
        <>
          {item.node.type.toLowerCase() === 'start' ? 'Начало процесса' : 'Конец процесса'}
        </>
        :
        <>
          {item.node.metrics && <div className='node__content-metrics'>
            <div className="content-metrics__count">{item.node.metrics.count}</div>
            {!!item.node.metrics.cycling &&
            <div className="content-metrics__cycling">{item.node.metrics.cycling}%</div>}
          </div>}
          <div className='node__content-description'>
            <p className='node__content-name'>{item.node.name.toLowerCase()}</p>
          </div>
        </>
      }
    </div>
  );
};

export default GraphNode;
