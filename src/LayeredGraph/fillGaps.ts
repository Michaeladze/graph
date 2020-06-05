import { IGraph, IMatrix } from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';

/** Сдвигаем узлы справа от процесса левее, заполняя образовавшиеся пустоты  */
export const fillGaps = (graph: IGraph, median: number = 0): IMatrix => {
  let matrix: IMatrix = rearrangeMatrix(graph);

  /** Идем от медины к концу каждого ряда и переставляем узлы влево на свободную позицию  */
  for (let i: number = 0; i < matrix.length; i++) {
    /** Очередь */
    let undefinedQueue: number[] = [];

    /** Правая сторона */
    for (let j: number = median; j < matrix[i].length; j++) {
      if (matrix[i][j] === undefined) {
        /** Запоминаем пустую ячейку */
        undefinedQueue.push(j);
      } else {
        if (graph[matrix[i][j] as number].fake) {
          continue;
        }

        const c: number | undefined = undefinedQueue.shift();
        if (c) {
          /** Вставляем узел в первую доступную пустую ячейку */
          graph[matrix[i][j] as number].x = c;
          matrix[i][c] = matrix[1][j];
          matrix[i][j] = undefined;
          undefinedQueue.push(j);
        }
      }
    }

    undefinedQueue = [];

    /** Левая сторона */
    for (let j: number = median - 1; j >= 0; j--) {
      if (matrix[i][j] === undefined) {
        /** Запоминаем пустую ячейку */
        undefinedQueue.push(j);
      } else {
        if (graph[matrix[i][j] as number].fake) {
          continue;
        }

        const c: number | undefined = undefinedQueue.shift();
        if (c) {
          /** Вставляем узел в первую доступную пустую ячейку */
          graph[matrix[i][j] as number].x = c;
          matrix[i][c] = matrix[1][j];
          matrix[i][j] = undefined;
          undefinedQueue.push(j);
        }
      }
    }
  }

  return matrix;
};
