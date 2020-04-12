import { IEntry, IGraph, IGraphData, INumberMap } from './interfaces/interfaces';

/** [Описание]
 * [1] Выбираем среди путей путь с наибольшей частотой (весом). Этот путь называется Процесс.
 * Так как массив с бекенда приходит отсортированный, то за процесс берем первый путь paths[0].path.
 * [2] Узлам процесса устанавливается флаг process = 1 и уровень y в том порядке, в котором они находятся.
 * [3] Определяются узлы, связанные с узлами процесса. Для этих узлов устанавливается флаг processSibling = 1.
 * [4] Для всех узлов, не являющихся частью процесса, считается степень приближенности к узлам процесса, а так же узлам
 * для которых уже был определен уровень.
 * [5] Уровень нормализуется, т.е. приводится к последовательности 0, 1, 2..., n.
 * [6] Для следующего шага 'ordering' возвращаются элементы, распределенные по уровням elementsOnRank.
 * */

/** Распределение узлов по уровням
 * @param data - данные графа
 * @param graph - граф */
export const ranking = ({ paths }: IGraphData, graph: IGraph): number[][] => {
  let elementsOnRank: number[][] = [];

  if (paths && paths.length > 0) {
    const process: number[] = paths[0].path;
    const processGraph: IGraph = setProcessRank(process, graph);
    arrangeRanks(processGraph, graph);
    elementsOnRank = normalize(graph);
  }

  return elementsOnRank;
}

/** Устанавливаем уровень узлам процесса
 * @param process - последовательность узлов
 * @param graph - граф */
function setProcessRank(process: number[], graph: IGraph): IGraph {
  const processGraph: IGraph = {};

  /** Добавляем в процесс узлы начала и конца */
  process = [0, ...process, 1];

  process.forEach((node: number, rank: number) => {
    /** Если критический путь */
    if (graph[node].y <= rank) {
      graph[node].y = rank + 1;
      graph[node].process = 1;
    }
    processGraph[node] = graph[node];
  });

  return processGraph;
}

/** Определяем узлы, связанные с процессом
 * @param process - последовательность узлов
 * @param graph - граф */
function connectedWithProcess(process: IGraph, graph: IGraph) {
  for (const node in graph) {
    /** Если узел не является узлом процесса и у него еще не определили приближенность к процессу */
    if (!graph[node].processSibling && !graph[node].process) {
      /** Проверяем, если среди дочерних или родителських узлов есть узел процесса */
      const relatives: number[] = [...graph[node].children, ...graph[node].parents];
      const indicator: boolean = relatives.some((n: number) => process[n] && process[n].process);
      graph[node].processSibling = indicator ? 1 : 0;
    }

    /** Узлы процесса -> processSibling = 0 */
    if (graph[node].process) {
      graph[node].processSibling = 0;
    }
  }
}

/** Приближаем остальные узлы к уровням узлов процесса по среднему значению уровня
 * @param process - последовательность узлов
 * @param graph - граф */
function arrangeRanks(process: IGraph, graph: IGraph) {

  /** [1] Определяем узлы, связанные с процессом */
  connectedWithProcess(process, graph);

  /** [2] Сортируем по приближенности к процессу */
  const entries: IEntry[] = Object.entries(graph)
    .sort((a: IEntry, b: IEntry) => b[1].processSibling - a[1].processSibling)
    .filter((a: IEntry) => !graph[+a[0]].process);

  entries.forEach((e: IEntry) => {
      /** Накопленный уровень всех родственников */
      let mRank = 0;
      /** Число учитываемых родственников */
      let relativesCount: number = 0;
      /** Узлы, связанные с текущим узлов */
      const relatives: number[] = [...e[1].children, ...e[1].parents];

      /** Суммируем уровни всех родственников */
      relatives.forEach((n: number) => {
        mRank += graph[n].y;
        /** Если узел, не являющийся частью процесса, еще не был переставлен на уровень, то его не учитываем */
        if (!(graph[n].process === 0 && graph[n].y === 0)) {
          relativesCount++;
        }
      });

      /** Усредненный уровень. Приведим все к 0.5, чтобы узлы были на одном уровне и граф не расползался в высоту */
      graph[+e[0]].y = Math.ceil(mRank / relativesCount) + 1;
      // graph[+e[0]].y = Math.floor(mRank / relativesCount) + 0.5;
    }
  )
}

/** Нормализация уровней
 * @param graph - граф */
function normalize(graph: IGraph): number[][] {
  /** Количество элементов на уровне */
  const elementsOnRank: number[][] = [];

  /** Собираем массив entries графа, отсортированный по уровню и принадлежности процессу */
  const entries: IEntry[] = Object.entries(graph).sort((a: IEntry, b: IEntry) =>
    (b[1].process - a[1].process) || a[1].y - b[1].y);

  /** Таблица мэппинга уровня и индекса для нормализации */
  const map: INumberMap<number> = {};
  /** Указатель для итерации */
  let pointer: number = 0;
  /** Текущий индекс */
  let index: number = 0;

  /** Если в таблице map нет ключа Y, то создаем его и присваиваем ему index. Index увеличиваем на 1.
   * Если встречаем узел с таким уже записанным в map уровнем, берем нормализованный уровень из map */
  while (pointer < entries.length) {
    const current = entries[pointer];
    const n: number = current[1].y;
    let ind: number = index;

    if (map[n] === undefined) {
      map[n] = index;
      index++;
    } else {
      ind = map[n];
    }
    /** Если в ряду нет массива, то создаем его */
    if (elementsOnRank[ind] === undefined) {
      elementsOnRank[ind] = [];
    }
    /** Добавляем узел в ряд. Если узел процесса, добавляем как есть, если нет - смотрим,
     * есть ли в ряду узлы. Если нет, вставляем, начиная с индекса 1 */
    if (graph[+current[0]].process === 1 || elementsOnRank[ind].length > 0) {
      elementsOnRank[ind].push(+current[0]);
    } else {
      elementsOnRank[ind][elementsOnRank[ind].length + 1] = +current[0];
    }

    graph[+current[0]].y = map[n];

    pointer++;
  }

  return elementsOnRank;
}
