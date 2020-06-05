import {
  IGraph, IMatrix, IPathEntry, IPathMap, IRect 
} from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';

/** Стягиваем фейковые узлы, чтобы они не растягивали экран
 * @param graph - граф
 * @param median - медиана
 * @param rect - базовые размеры узлов
 * @param pathMap - ветки
 */
export const translateFakeNodes = (
  graph: IGraph,
  median: number,
  rect: IRect,
  pathMap: IPathMap
): {
  median: number;
  paths: IPathEntry[][];
} => {
  let matrix: IMatrix = rearrangeMatrix(graph);

  /** [1] Разделяем ветки на левые и правые. Те, которые пересекают медиану, не трогаем */
  const leftPaths: IPathMap = {};
  const rightPaths: IPathMap = {};

  Object.keys(pathMap).forEach((key: string) => {
    const array: number[] = Array.from(pathMap[key]);

    /** Так как могуть быть ветки, пересекающие медиану, нужно проверить и right и left */
    const right: boolean = array.every((n: number) => graph[n].x > median);
    const left: boolean = array.every((n: number) => graph[n].x < median);

    if (right) rightPaths[key] = pathMap[key];
    if (left) leftPaths[key] = pathMap[key];
  });

  /** [2] Сортируем по координате X */
  const leftEntries: IPathEntry[] = Object.entries(leftPaths);
  const rightEntries: IPathEntry[] = Object.entries(rightPaths);

  /** Функция сдвига */
  const shift = (x: number, path: number[]) => {
    let valid: boolean = true;
    for (let i: number = 0; i < path.length; i++) {
      if (!graph[path[i]].fake) {
        continue;
      }

      const y: number = graph[path[i]].y;
      valid = matrix[y][x] === undefined || (matrix[y][x] !== undefined && path.indexOf(matrix[y][x] as number) >= 0);

      if (!valid) {
        break;
      }
    }

    if (valid) {
      for (let i: number = 0; i < path.length; i++) {
        if (graph[path[i]].fake) {
          graph[path[i]].x = x;
        }
      }

      matrix = rearrangeMatrix(graph);
    }
  };

  /** [3] Левая сторона */
  leftEntries.forEach((e: IPathEntry) => {
    const path: number[] = Array.from(e[1]);
    let x: number = Number.MAX_SAFE_INTEGER;

    path.forEach((n: number) => {
      x = Math.min(graph[n].x, x);
    });

    for (x; x < median; x++) {
      shift(x, path);
    }
  });

  /** [4] Правая сторона */
  rightEntries.forEach((e: IPathEntry) => {
    const path: number[] = Array.from(e[1]);
    let x: number = Number.MIN_SAFE_INTEGER;

    path.forEach((n: number) => {
      x = Math.max(graph[n].x, x);
    });

    for (x; x > median; x--) {
      shift(x, path);
    }
  });

  /** [5] Сдвигаем координату всех элементов */
  const keys: string[] = Object.keys(graph);

  let min: number = Number.MAX_SAFE_INTEGER;
  keys.forEach((n: string) => {
    min = Math.min(min, graph[+n].x);
  });

  keys.forEach((n: string) => {
    graph[+n].x -= min;
  });

  const newMedian: number = median - min;

  return {
    median: newMedian,
    paths: [leftEntries, rightEntries]
  };
};
