/** Балансировка графа */
import { IBalanceResult, IGraph, IMap, IMatrix, IPathMap } from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';
import { initProcess } from './initProcess';

/** Интерфейс, возвращаемый функцией processToMedian */
interface IMedianResult {
  ratio: number;
  matrix: IMatrix;
  median: number;
}

/** Тип пути */
type IEntry = [string, Set<number>];

/** Функция балансировки графа
 * @param graph - граф
 * @param matrix - матрица
 * @param pathMap - таблица путей
 * @param process - узлы процесса */
export const balancing = (process: number[], graph: IGraph, matrix: IMatrix, pathMap: IPathMap): IBalanceResult => {
  /** Определить медиану */
  let ptm: IMedianResult = processToMedian(graph, matrix);

  /** Исключаем из pathMap соседние узлы процесса */
  pathMap = removeNeighbours(process, pathMap);

  /** Пути, которые уже были перемещены */
  const processedPaths: IMap<number> = {};

  /** Рекурсивная функция балансирвоки */
  const recursiveBalancing = (graph: IGraph, matrix: IMatrix, pathMap: IPathMap) => {
    /** Путь, который будет переброшен на левую сторону */
    let pathToMove: IEntry | undefined;

    /** Ищем путь, наиболее подходящий для перемещения в левую часть */
    const paths: IEntry[] = Object.entries(pathMap);

    /** Массив приближенности длины путей к количеству узлов, которые нужно перекинуть на левую сторону (ratio)*/
    const approximations: number[][] = paths
      .map((p: IEntry, i: number) => [Math.abs(p[1].size - ptm.ratio), i])
      .filter((p: number[]) => !processedPaths[p[0]])
      .sort((a1: number[], a2: number[]) => a1[0] - a2[0]);
    /** Индекс приближенности */
    const index: number = approximations[0][1];

    /** Колбэк удаления pathToMove из списка путей */
    const removePath = () => {
      delete pathMap[paths[index][0]]
    }

    /** Определяем путь */
    pathToMove = paths[index];
    /** Сдвигаем путь на левую сторону */
    ptm = shiftToLeft(graph, pathToMove, ptm, processedPaths, removePath);

    /** Если дерево не  и путь не испытан, пробуем сдвинуть новый путь */
    if (ptm.ratio !== 0) {
      recursiveBalancing(graph, ptm.matrix, pathMap);
    }
  }

  recursiveBalancing(graph, matrix, pathMap);

  return {
    median: ptm.median,
    matrix: ptm.matrix
  };
}

/** Определить ширину графа и выставить процесс в x = медиана
 * @param graph
 * @param matrix */
function processToMedian(graph: IGraph, matrix: IMatrix): IMedianResult {
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
  matrix = rearrangeMatrix(graph);

  /** Считаем, в какую сторону добавить узлы */
  const ratio: number = checkBalance(matrix, median);

  return { ratio, matrix, median };
}

/** Проверка сбалансированности графа
 * @param matrix - матрица
 * @param median - медиана матрицы */
function checkBalance(matrix: IMatrix, median: number): number {
  let left: number = 0;
  let right: number = 0;

  for (let i: number = 0; i < matrix.length; i++) {
    for (let j: number = 0; j < matrix[i].length; j++) {
      if (j === median) {
        /** Пропускаем, если это узлы процесса */
        continue;
      }

      /** Увеличиваем количество узлов слева или справа */
      if (matrix[i][j] && j < median) left++;
      if (matrix[i][j] && j > median) right++;
    }
  }

  /** Показатель сбалансированности. Если >0, то нужно перекинуть узлы на левую сторону */
  return Math.floor((right - left) / 2);
}

/** Перемещение узлов на левую сторону
 * @param graph - граф
 * @param pathToMove - путь, который нужно переместить на левую сторону
 * @param ptm - объект с медианой, матрицей и ratio
 * @param processedPaths - пути, которые уже были испытаны
 * @param cb - колбек при успешном сдвиге (удаление)
 */
function shiftToLeft(graph: IGraph, pathToMove: IEntry, ptm: IMedianResult,
                     processedPaths: IMap<number>, cb: () => void): IMedianResult {

  /** Помечаем путь как пройденный */
  if (processedPaths[pathToMove[0]] === undefined) {
    processedPaths[pathToMove[0]] = 1;
  }

  /** Флаг показаывает, произошел ли сдвиг */
  let shifted: boolean = false;

  pathToMove[1].forEach((node: number) => {
    /** Ищем на уровне узла свободные ячейки на левой стороне процесса */
    for (let x: number = ptm.median; x >= 0; x--) {
      if (ptm.matrix[graph[node].y][x] === undefined) {

        // /** Сдвигаем все узлы справа того же уровня на один влево, чтобы заполнить пустоты  */
        // for (let rx: number = graph[node].x + 1; rx < ptm.matrix[graph[node].y].length; rx++) {
        //   const n: number | undefined = ptm.matrix[graph[node].y][rx];
        //   if (n && graph[n].x !== ptm.median && ptm.matrix[graph[node].y][graph[n].x - 1] === undefined) {
        //     graph[n].x = graph[n].x - 1;
        //   }
        // }

        /** Устанавливаем узлу графа новую координату */
        graph[node].x = x;

        /** Сдвиг произошел */
        shifted = true;
        cb();
        break;
      }
    }
  });

  return {
    ...ptm,
    matrix: rearrangeMatrix(graph),
    ratio: shifted ? ptm.ratio - pathToMove[1].size : ptm.ratio
  };
}

/** Исключаем соседние узлы процесса
 * @param process - процесс
 * @param pathMap - таблица путей
 */
function removeNeighbours(process: number[], pathMap: IPathMap): IPathMap {
  const sequence: string = initProcess(process).join('=>');

  for (const path in pathMap) {
    /** Если путь является частью процесса и узлы находятс яна соседних уровнях, удаляем путь */
    if (sequence.indexOf(path) >= 0) {
      delete pathMap[path];
    }
  }

  return pathMap;

}
