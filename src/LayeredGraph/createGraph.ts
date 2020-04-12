import { IEdge, IGraph, IGraphData } from './interfaces/interfaces';

/** Создаем структуру графа
 * @param data - узлы, ребра и пути в графе */
export const createGraph = (data: IGraphData): IGraph => {
  /** Граф */
  const graph: IGraph = {};
  /** Узлы и ребра */
  const { edges }: IGraphData = data;

  /** Добавляем узлы в граф  */
  edges.forEach((edge: IEdge) => {
    if (graph[edge.from] === undefined) {
      graph[edge.from] = {
        children: [],
        x: 0,
        y: 0,
        parents: [],
        process: 0,
        processSibling: 0
      };
    }

    if (graph[edge.to] === undefined) {
      graph[edge.to] = {
        children: [],
        x: 0,
        y: 0,
        parents: [],
        process: 0,
        processSibling: 0
      };
    }

    /** Добавляем родительские узлы потомкам */
    graph[edge.to].parents.push(edge.from);
    /** Узлам, у которых есть потомки, добавляем в edges список потомков */
    graph[edge.from].children.push(edge.to);
  });

  return graph;
}
