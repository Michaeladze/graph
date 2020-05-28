import React, { useEffect, useRef, useState } from 'react';
import './Graph.scss';
import { IGraphData, IGraphResult, ILines, INodeElement } from '../LayeredGraph/interfaces/interfaces';
import { LayeredGraph } from '../LayeredGraph';
import GraphNode from '../GraphNode/GraphNode';
import TransformLayer from '../TransformLayer';

interface IProps {
  data: IGraphData;
}

const Graph: React.FC<IProps> = ({ data }) => {
  /** Сцена */
  const scene = useRef<HTMLDivElement>(null);
  const sceneSvg = useRef<SVGSVGElement>(null);
  /** Граф */
  const [graph, setGraph] = useState<LayeredGraph>();
  /** Узлы */
  const [nodes, setNodes] = useState<INodeElement[]>([]);
  /** Табл */
  const lines = useRef<ILines>({});

  // -------------------------------------------------------------------------------------------------------------------

  /** Отрисовка ребер после отрисовки узлов */
  useEffect(() => {
    if (scene.current && nodes.length > 0 && graph && sceneSvg.current) {
      lines.current = graph.drawEdges(scene.current, sceneSvg.current);
    }
  }, [scene, nodes, graph]);

  /** Перерисовка ребер при ресайзе */
  useEffect(() => {
    const draw = () => {
      if (scene.current && sceneSvg.current && graph) {
        graph.drawEdges(scene.current, sceneSvg.current);
      }
    };
    window.addEventListener('resize', draw);
    return () => {
      window.removeEventListener('resize', draw);
    }
  }, [graph])

  // -------------------------------------------------------------------------------------------------------------------

  /** Инициализируем граф */
  useEffect(() => {
    const graph = new LayeredGraph(data);
    const { nodes }: IGraphResult = graph.init();
    setGraph(graph);
    setNodes(nodes);
  }, [data]);

  // -------------------------------------------------------------------------------------------------------------------

  /** Флаг движения */
  const dragging = useRef<boolean>(false);
  /** Коорддината начала движения */
  const draggingStartCoordinates = useRef<[number, number]>([0, 0]);
  /** Узел, который будем двигать */
  const draggingNode = useRef<any>(null);

  /** Зажали мышь и начинаем движение */
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    draggingNode.current = e.currentTarget as HTMLDivElement;

    const { x, y }: DOMRect = draggingNode.current.getBoundingClientRect();
    draggingStartCoordinates.current = [e.clientX - x, e.clientY - y];
  };

  /** Отпустили мышь и заканчиваем движение */
  const onMouseUp = () => {
    dragging.current = false;
    draggingNode.current = null;
  };

  const onMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (draggingNode.current && dragging.current && scene.current && graph) {
      e.stopPropagation();
      const r: DOMRect = scene.current.getBoundingClientRect();
      const scale = r.width / scene.current.offsetWidth;
      const x = (e.clientX - draggingStartCoordinates.current[0] + scene.current.scrollLeft - r.x) / scale;
      const y = (e.clientY - draggingStartCoordinates.current[1] + scene.current.scrollTop - r.y) / scale;
      draggingNode.current.style.transform = `translate(${x}px, ${y}px)`;
      lines.current = graph.moveNode(draggingNode.current.id, x, y);
    }
  };

  /** Добавляем движение узла в window */
  useEffect(() => {
    if (graph) {
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      if (graph) {
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMove);
      }
    };
  }, [graph]);

  // -------------------------------------------------------------------------------------------------------------------

  /** Изменияем цвет линий на ховере */
  const onMouseEnter = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLDivElement;
    Object.keys(lines.current).forEach((key: string) => {
      const tmp: string[] = key.split('=>');
      if (tmp.includes(el.id) && !lines.current[key].disabled) {
        lines.current[key].line.style.stroke = lines.current[key].color.hover;
        lines.current[key].line.setAttribute('marker-end', `url(#${lines.current[key].marker.hover})`);
      }
    });
  };

  /** Сбарсываем ховер */
  const onMouseLeave = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLDivElement;
    Object.keys(lines.current).forEach((key: string) => {
      const tmp: string[] = key.split('=>');
      if (tmp.includes(el.id)) {
        lines.current[key].line.style.stroke = lines.current[key].color.default;
        lines.current[key].line.setAttribute('marker-end', `url(#${lines.current[key].marker.default})`);
      }
    });
  };

  // -------------------------------------------------------------------------------------------------------------------

  /** Выводим узлы на экран */
  const nodesJSX = nodes.map((n: any) => {
    return (
      <div
        key={n.name}
        id={n.name}
        className={`graph__node ${n.fake ? 'graph__node--fake' : ''}`}
        style={{
          width: n.css.width,
          height: n.css.height,
          transform: `translate(${n.css.translate.x}px, ${n.css.translate.y}px)`
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}>
        {n.node && <GraphNode item={n}/>}

        {n.fake === 1 && n.name}
      </div>
    );
  });

  // -------------------------------------------------------------------------------------------------------------------

  /** Восстановить вид */
  const reset = () => {
    if (graph) {
      lines.current = graph.reset();
    }
  }

  // -------------------------------------------------------------------------------------------------------------------

  return (
    <TransformLayer reset={reset} scene={scene.current} sceneSvg={sceneSvg.current}>
      <div className='scene' id='scene' ref={scene}>
        {nodesJSX}
      </div>
      <svg className='scene__svg' ref={sceneSvg}/>
    </TransformLayer>
  );
};

export default React.memo(Graph);
