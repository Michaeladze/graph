/** Перерисовываем матрицу. Это быстрее и проще, чем пересчитывать индексы */
import { IGraph, IMatrix } from './interfaces/interfaces';

/** Перераспределение узлов в матрице
 * @param graph - граф */
export const rearrangeMatrix = (graph: IGraph): IMatrix => {
  const matrix: IMatrix = [];

  for (const key in graph) {
    if (matrix[graph[key].y] === undefined) {
      matrix[graph[key].y] = [];
    }

    matrix[graph[key].y][graph[key].x] = +key;
  }

  return matrix;
}
