import { IEdge, IGraph, IGraphData } from './interfaces/interfaces';
import { GraphNode } from './GraphNode';

/** Создаем структуру графа
 * @param data - узлы, ребра и пути в графе */
export const createGraph = (data: IGraphData): IGraph => {
  /** Граф */
  const graph: IGraph = {};
  /** Добавляем узлы в граф  */
  data.edges.forEach((edge: IEdge) => {
    [edge.from, edge.to].forEach((edge: number) => {
      graph[edge] === undefined && (graph[edge] = new GraphNode(edge));
    });
    /** Добавляем родительские узлы потомкам */
    graph[edge.to].parents.push(edge.from);
    /** Узлам, у которых есть потомки, добавляем в edges список потомков */
    graph[edge.from].children.push(edge.to);
  });
  return graph;
};
