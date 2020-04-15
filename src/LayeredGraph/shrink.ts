import { IBalanceResult, IGraph, IMatrix } from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';

/** Убираем пустые ячейки
 * @param graph - граф
 * @param matrix - матрица
 * @param median - медиана
 */
export const shrink = (graph: IGraph, matrix: IMatrix, median: number): IBalanceResult => {
  /** Количество ячеек, на которое можно сдвинуть матрицу влево */
  let shrinkLeft: number = 0;

  for (let i: number = 0; i < matrix.length; i++) {

    /** Очередь */
    let undefinedQueue: number[] = [];

    /** Идем от медианы в лево и переставляем узлы местами */
    for (let j: number = median - 1; j >= 0; j--) {
      swapNodes(graph, matrix, i, j, undefinedQueue);
    }

    /** Для первого уровня сразу переопределяем shrinkLeft */
    if (i === 0) {
      shrinkLeft = undefinedQueue.length
    }
    /** Для каждого уровня определяем количество ячеек, которое осталось слева. Если оно меньше, чем
     * shrinkLeft, то переопределяем shrinkLeft */
    if (undefinedQueue.length < shrinkLeft) {
      shrinkLeft = undefinedQueue.length;
    }

    /** Очищаем очередь и начинаем обход правой стороны */
    undefinedQueue = [];

    /** Идем от медианы в право и переставляем узлы местами */
    for (let j: number = median + 1; j < matrix[i].length; j++) {
      swapNodes(graph, matrix, i, j, undefinedQueue);
    }

  }

  /** Сдвигаем матрицу влево */
  translateLeft(graph, shrinkLeft);

  return {
    matrix: rearrangeMatrix(graph),
    median: median - shrinkLeft
  };
}

/** Меняем ячейки местами
 * @param graph - граф
 * @param matrix - матрица
 * @param i - вертикаль
 * @param j - горизонталь
 * @param undefinedQueue - очередь с пустыми ячейками
 */
function swapNodes(graph: IGraph, matrix: IMatrix, i: number, j: number, undefinedQueue: number[]) {
  if (matrix[i][j] === undefined) {
    undefinedQueue.push(j)
  } else {
    const c: number | undefined = undefinedQueue.shift();
    if (c) {
      graph[matrix[i][j] as number].x = c;
      matrix[i][c] = matrix[1][j]
      matrix[i][j] = undefined;
      undefinedQueue.push(j);
    }
  }
}

/** Сдвигаем матрицу на количество свободных ячеек влево
 * @param graph - граф
 * @param shrinkLeft - на сколько можно сдвинуть влево
 */
function translateLeft(graph: IGraph, shrinkLeft: number) {
  for (const node in graph) {
    graph[node].x = graph[node].x - shrinkLeft;
  }
}

