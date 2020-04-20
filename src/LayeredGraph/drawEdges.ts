/** Рисуем ребра */
import { IEdge, IGraph, IGraphNode, IMap, IPathMap } from './interfaces/interfaces';
import * as d3 from 'd3';

export const drawEdges = (edges: IEdge[], graph: IGraph, pathMap: IPathMap, process: number[]) => {

  const w = 2000;
  const h = 2000;
  const svg = d3.select('.scene')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

  const points: IMap<[number, number][]> = getCoords(graph, pathMap, edges);

  for (const path in points) {
    const coords: [number, number][] = points[path];

    const l = d3.line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveMonotoneY)
    // .curve(d3.curveCatmullRom.alpha(1))

    const isProcess: boolean = process.join('=>').indexOf(path) >= 0;

    svg.append('path')
      // @ts-ignore
      .attr('d', l(coords))
      .style('fill', 'none')
      .style('stroke', '#A5BFDD')
      .style('stroke-width', isProcess ? '3px' : '1px')
  }

  // appendOverlayRect(graph, svg);
}

/** Считаем координаты */
function getCoords(graph: IGraph, pathMap: IPathMap, edges: IEdge[]): IMap<[number, number][]> {
  let coords: IMap<[number, number][]> = {};

  /** Обработка длинных путей между реальными и фейковыми узлами */
  for (const key in pathMap) {
    const [from, to] = key.split('=>');
    coords[key] = [];
    coords[key].push(calculateCoords(graph[+from]));

    const paths: number[] = Array.from(pathMap[key]);

    for (let i: number = 0; i < paths.length; i++) {
      if (paths[i] === +from || paths[i] === +to) {
        continue;
      }
      coords[key].push(calculateCoords(graph[paths[i]]));
    }

    coords[key].push(calculateCoords(graph[+to]));
  }

  /** Обработка коротких путей между реальными узлами */
  edges.forEach((edge: IEdge) => {
    const id: string = `${edge.from}=>${edge.to}`;
    if (coords[id] === undefined && !graph[edge.from].fake && !graph[edge.to].fake) {
      coords[id] = [calculateCoords(graph[edge.from]), calculateCoords(graph[edge.to])];
    }
  })


  return coords;
}

/** Пересчет координаты */
function calculateCoords(node: IGraphNode): [number, number] {
  return [
    node.css.translate.x + node.css.width / 2,
    node.css.translate.y + node.css.height / 2,
  ]
}

/** Добавляем подложки под узлы, чтобы считать пересечения с ребрами */
function appendOverlayRect(graph: IGraph, svg: any) {
  for (const key in graph) {
    if (!graph[key].fake) {
      const c: IGraphNode = graph[key];
      svg.append('rect')
        .attr('id', `rect-${key}`)
        .style('x', c.css.translate.x)
        .style('rx', '8')
        .style('y', c.css.translate.y)
        .style('ry', '8')
        .style('width', c.css.width)
        .style('height', c.css.height)
        .style('stroke', 'crimson')
        .style('fill', 'transparent')
        .style('stroke-width', '1px')
    }
  }
}
