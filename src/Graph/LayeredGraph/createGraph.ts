import { IEdge, IGraph, IGraphData } from './interfaces/interfaces';

/** Создаем структуру графа
 * @param data - узлы, ребра и пути в графе */
export const createGraph = (data: IGraphData): IGraph => {
  /** Граф */
  const graph: IGraph = {};
  /* шаблон узла*/
  const baseNode: string = `{
    "children": [],
    "x": 0,
    "y": 0,
    "parents": [],
    "isProcess": 0,
    "processSibling": 0,
    "fake": 0,
    "css": {}
  }`;
  /** Добавляем узлы в граф  */
  data.edges.forEach((edge: IEdge) => {
    [edge.from, edge.to].forEach((edge: number) => {
      graph[edge] === undefined && (graph[edge] = JSON.parse(baseNode));
    });
    /** Добавляем родительские узлы потомкам */
    graph[edge.to].parents.push(edge.from);
    /** Узлам, у которых есть потомки, добавляем в edges список потомков */
    graph[edge.from].children.push(edge.to);
  });
  return graph;
};
