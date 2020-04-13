/** Балансировка графа */
import { IGraph, IMatrix } from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';

/** Функция балансировки графа
 * @param graph - граф
 * @param matrix - матрица */
export const balancing = (graph: IGraph, matrix: IMatrix) => {
  processToMedian(graph, matrix);
}

/** [1] Определить ширину графа и выставить процесс в x = медиана
 * @param graph
 * @param matrix */
function processToMedian(graph: IGraph, matrix: IMatrix) {
  let maxLengthRank: number = 0;
  matrix.forEach((rank: (number | undefined)[]) => {
    if (rank.length > maxLengthRank) {
      maxLengthRank = rank.length;
    }
  });

  /** Считаем медиану */
  const median: number = Math.floor(maxLengthRank / 2);

  /** Сдвигаем весь граф на +median */
  for (const key in graph) {
    graph[key].x = graph[key].x + median;
  }

  /** Перераспределяем узлы матрицы */
  rearrangeMatrix(graph);
}
