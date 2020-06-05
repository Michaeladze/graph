/** Балансировка графа */
import {
  IBalanceResult, IGraph, IMap, IMatrix, INumberMap, IPathEntry, IPathMap 
} from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';
import { fillGaps } from './fillGaps';

/** Результат проверки балансирвоки */
interface ICheckBalance {
  /** Коэффициент баланса всех узлов (левые - правые) */
  ratio: number;
  /** Коэффициент баланса реальных узлов (левые - правые) */
  realRatio: number;
}

/** Интерфейс, возвращаемый функцией processToMedian */
interface IMedianResult extends ICheckBalance {
  /** Матрица узлов */
  matrix: IMatrix;
  /** Медиана матрицы, соответсует координате X процесса */
  median: number;
}

/** Функция балансировки графа
 * @param graph - граф
 * @param matrix - матрица
 * @param process - узлы процесса */
export const balancing = (process: number[], graph: IGraph, matrix: IMatrix): IBalanceResult => {
  /** Определить медиану */
  let ptm: IMedianResult = processToMedian(graph, matrix);

  /** Ищем ветки */
  const pathMap: IPathMap = searchBranches(graph);

  /** Пути, которые уже были перемещены */
  const processedPaths: IMap<Set<number>> = {};

  /** Перемещенные реальные узлы */
  const processedNodes: IMap<boolean> = {};

  /** Кеш средних значений X */
  const averageXCache: INumberMap<number> = {};

  /** Рекурсивная функция балансирвоки */
  const recursiveBalancing = (graph: IGraph, matrix: IMatrix, pathMap: IPathMap) => {
    /** Путь, который будет переброшен на левую сторону */
    let pathToMove: IPathEntry | undefined;

    /** Ищем путь, наиболее подходящий для перемещения в левую часть */
    const paths: IPathEntry[] = Object.entries(pathMap);

    /** Массив приближенности длины путей к количеству узлов, которые нужно перекинуть на левую сторону (ratio).
     * Сортирвка сначала по realRatio, затем по координате Х, чтобы в вертикали граф был сбалансирован,
     * затем по приближенности к ratio */
    const approximations: number[][] = paths
      .map((p: IPathEntry, i: number) => {
        const delta: number = Math.abs(p[1].size - ptm.ratio);
        const realNodes: number[] = Array.from(p[1]).filter((n: number) => !graph[n].fake);
        const realDelta: number = Math.abs(realNodes.length - ptm.realRatio);
        const averageX: number = averageXCache[+p[0]] || getBranchAverageX(p, graph, averageXCache);
        return [delta, i, realDelta, averageX];
      })
      .sort((a1: number[], a2: number[]) => a1[2] - a2[2] || a1[0] - a2[0] || a2[3] - a1[3]);

    if (approximations.length > 0) {
      /** Порядковый номер пути */
      const index: number = approximations[0][1];

      /** Колбэк удаления pathToMove из списка путей */
      const removePath = () => {
        delete pathMap[paths[index][0]];
      };

      /** Количество уникальных сдвинутых путей. Если число не меняется, значит рекурсия  */
      const pathsCount: number = Object.keys(processedPaths).length;

      /** Определяем путь */
      pathToMove = paths[index];
      /** Сдвигаем путь на левую сторону */
      if (!processedPaths[pathToMove[0]]) {
        ptm = shiftToLeft(graph, pathToMove, ptm, processedPaths, processedNodes, removePath);
      }

      /** Если путь не испытан и есть новый путь, пробуем сдвинуть новый путь */
      if (ptm.ratio > 0 && pathsCount !== Object.keys(processedPaths).length) {
        recursiveBalancing(graph, ptm.matrix, pathMap);
      }
    }
  };

  recursiveBalancing(graph, matrix, pathMap);

  /** Заполняем образовавшиеся пустоты */
  fillGaps(graph, ptm.median);

  return {
    median: ptm.median,
    matrix: rearrangeMatrix(graph)
  };
};

/** Определить ширину графа и выставить процесс в x = медиана
 * @param graph
 * @param matrix */
function processToMedian(graph: IGraph, matrix: IMatrix): IMedianResult {
  let maxLengthRank: number = 0;
  matrix.forEach((rank: (number | undefined)[]) => {
    maxLengthRank = Math.max(rank.length, maxLengthRank);
  });

  /** Считаем медиану */
  const median: number = maxLengthRank; // Math.ceil(maxLengthRank / 2);

  /** Сдвигаем весь граф на +median */
  for (const key in graph) {
    graph[key].x = graph[key].x + median;
  }

  /** Перераспределяем узлы матрицы */
  matrix = rearrangeMatrix(graph);

  /** Считаем, в какую сторону добавить узлы */
  const { ratio, realRatio }: ICheckBalance = checkBalance(matrix, median, graph);

  return { ratio, realRatio, matrix, median };
}

/** Проверка сбалансированности графа
 * @param matrix - матрица
 * @param median - медиана матрицы
 * @param graph - граф */
function checkBalance(matrix: IMatrix, median: number, graph: IGraph): ICheckBalance {
  let left: number = 0;
  let right: number = 0;

  /** Количество реальных узлов слева и справа */
  let leftRealNodes: number = 0;
  let rightRealNodes: number = 0;

  for (let i: number = 0; i < matrix.length; i++) {
    for (let j: number = 0; j < matrix[i].length; j++) {
      if (j === median) {
        /** Пропускаем, если это узлы процесса */
        continue;
      }

      /** Увеличиваем количество узлов слева или справа */
      if (matrix[i][j] && j < median) {
        left++;
        if (!graph[matrix[i][j] as number].fake) {
          leftRealNodes++;
        }
      }
      if (matrix[i][j] && j > median) {
        right++;
        if (!graph[matrix[i][j] as number].fake) {
          rightRealNodes++;
        }
      }
    }
  }

  const ratio: number = Math.floor((right - left) / 2);
  const realRatio: number = Math.floor((rightRealNodes - leftRealNodes) / 2);

  /** Показатель сбалансированности. Если >0, то нужно перекинуть узлы на левую сторону */
  return { ratio, realRatio };
}

/** Перемещение узлов на левую сторону
 * @param graph - граф
 * @param pathToMove - путь, который нужно переместить на левую сторону
 * @param ptm - объект с медианой, матрицей и ratio
 * @param processedPaths - пути, которые уже были испытаны
 * @param processedNodes - массив реальных узлов, которые были перемещены влево
 * @param cb - колбек при успешном сдвиге (удаление)
 */
function shiftToLeft(
  graph: IGraph,
  pathToMove: IPathEntry,
  ptm: IMedianResult,
  processedPaths: IMap<Set<number>>,
  processedNodes: IMap<boolean>,
  cb: () => void
): IMedianResult {
  /** Помечаем путь как пройденный */
  if (processedPaths[pathToMove[0]] === undefined) {
    processedPaths[pathToMove[0]] = pathToMove[1];
  }

  /** Проходим по pathToMove[1] и исключаем уже обработанные узлы */
  let processedCount: number = 0;
  /** Количество реальных узлов, которые есть в ветке */
  let realNodesCount: number = 0;

  /** Флаг показаывает, произошел ли сдвиг */
  let shifted: boolean = false;

  /** Инвертируем координату X */
  pathToMove[1].forEach((node: number) => {
    if (!processedNodes[node]) {
      processedCount++;

      if (!graph[node].fake) {
        realNodesCount++;
      }
    }

    graph[node].x = ptm.median - (graph[node].x - ptm.median);
    ptm.matrix[graph[node].y][graph[node].x] = node;

    shifted = true;
    processedNodes[node] = true;
    cb();
  });

  return {
    ...ptm,
    matrix: ptm.matrix,
    ratio: shifted ? ptm.ratio - processedCount : ptm.ratio,
    realRatio: shifted ? ptm.realRatio - realNodesCount : ptm.realRatio
  };
}

/** Поиск веток. Ветка - это последовательность узлов от процесса к процессу
 * @param graph - граф
 */
function searchBranches(graph: IGraph): IPathMap {
  /** Таблица путей */
  const pathMap: IPathMap = {};
  /** Ветки */
  const branches: IMap<boolean> = {};

  /** Собираем пути от (процесса)=к=>(процессу) обходом вглубину */
  const dfs = (node: number, acc: INumberMap<boolean>, from: number) => {
    const path: string = Object.keys(acc).join('=>');
    if (!branches[path] && path) {
      branches[path] = true;
    }

    [...graph[node].parents, ...graph[node].children].forEach((n: number) => {
      if (!acc[n] && !graph[n].isProcess) {
        const path: string = Object.keys(acc).join('=>');
        if (branches[path]) {
          delete branches[path];
        }
        dfs(n, { ...acc, [n]: true }, from);
      }
    });
  };

  /** Обходом в ширину собираем все узлы вокруг реальных узлов, пока не дойдем до узлов процесса */
  const bfs = (node: number): Set<number> => {
    const branches: IMap<number[]> = {};
    const stack: number[] = [node];

    while (stack.length) {
      const c = stack.pop() as number;

      if (!branches[c]) {
        branches[c] = [];
      }

      [...graph[c].children, ...graph[c].parents].forEach((n: number) => {
        if (!branches[n] && !graph[n].isProcess) {
          stack.push(n);
        }
        if (!graph[n].isProcess) {
          branches[c].push(n);
        }
      });
    }

    const values: number[] = Object.values(branches).reduce((acc: number[], e: number[]) => [...acc, ...e], []);
    return new Set(values);
  };

  /** Обходим граф. DFS собирает отдельные ветки. BFS собирает кластеры. */
  for (const key in graph) {
    if (graph[key].isProcess) {
      dfs(+key, {}, +key);
    }

    if (!graph[key].isProcess && !graph[key].fake) {
      pathMap[`${key}`] = bfs(+key);
    }
  }

  /** Собираем PathMap на основе веток */
  const keys: string[] = Object.keys(branches);

  keys.forEach((branch: string) => {
    const path: string[] = branch.split('=>');
    const from = path[0];
    const to = path[path.length - 1];

    /** Из того, что собрал DFS, забираем только ветки из фейковых узлов. */
    if (graph[+from].fake) {
      pathMap[`${from}=>${to}`] = new Set(path.map((n: string) => +n));
    }
  });

  /** Сравниваем ветки */
  const compareSets = (s1: Set<number>, s2: Set<number>) => {
    if (s1.size !== s2.size) return false;
    return Array.from(s1).sort().join('') === Array.from(s2).sort().join('');
  };

  /** После BFS и DFS могут быть одинаковые ветки, так как узлы связаны между собой. Их нужно исключить. */
  const entries: [string, Set<number>][] = Object.entries(pathMap);
  for (let i: number = 0; i < entries.length; i++) {
    for (let j: number = i + 1; j < entries.length; j++) {
      if (compareSets(entries[i][1], entries[j][1])) {
        delete pathMap[entries[i][0]];
      }
    }
  }

  return pathMap;
}

/** Средняя координата X ветки */
function getBranchAverageX(branch: IPathEntry, graph: IGraph, averageXCache: INumberMap<number>) {
  let avgX: number = 0;

  branch[1].forEach((n: number) => {
    avgX += graph[n].x;
  });

  averageXCache[+branch[0]] = Math.round(avgX / branch[1].size);
  return averageXCache[+branch[0]];
}
