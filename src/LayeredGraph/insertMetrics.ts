/** Вставляем в фейковые узлы количество переходов */
import { IEdge, IGraph, INodeMetrics, IPathMap } from './interfaces/interfaces';

/** В первый фейковый узел на пути вставляем количество переходов */
export const insertMetrics = (graph: IGraph, edges: IEdge[], pathMap: IPathMap) => {
  for (const key in pathMap) {
    const array: number[] = Array.from(pathMap[key]);

    for (let i: number = 0; i < array.length; i++) {
      const [from, to]: string[] = key.split('=>');

      /** Ищем нужное ребром from-to в массиве edges */
      const index: number = edges.findIndex((e: IEdge) => e.from === +from && e.to === +to)

      if (index >= 0 && graph[array[i]].fake && edges[index].metrics) {
        graph[array[i]].count = +(edges[index].metrics as INodeMetrics).count || 0;
        break;
      }
    }

  }
}
