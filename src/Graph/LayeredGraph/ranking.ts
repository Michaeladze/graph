import { IEntry, IGraph, IGraphData, IMatrix } from './interfaces/interfaces';
import { connectedness } from './connectedness';

/** [Описание]
 * [1] Выбираем среди путей путь с наибольшей частотой (весом). Этот путь называется Процесс.
 * Так как массив с бекенда приходит отсортированный, то за процесс берем первый путь paths[0].path.
 * [2] Узлам процесса устанавливается флаг process = 1 и уровень y в том порядке, в котором они находятся.
 * [3] Определяются узлы, связанные с узлами процесса. Для этих узлов устанавливается флаг processSibling = 1.
 * [4] Для всех узлов, не являющихся частью процесса, считается степень приближенности к узлам процесса, а так же узлам
 * для которых уже был определен уровень.
 * [5] Уровень нормализуется, т.е. приводится к последовательности 0, 1, 2..., n.
 * [6] Для следующего шага 'ordering' возвращаются элементы, распределенные по уровням matrix.
 * */

/** Распределение узлов по уровням
 * @param data - данные графа
 * @param graph - граф
 * @param process - процесс */
export const ranking = ({ paths }: IGraphData, graph: IGraph, process: number[]): IMatrix => {
  let matrix: IMatrix = [];
  const processGraph: IGraph = setProcessRank(process, graph);
  arrangeRanks(processGraph, graph);
  matrix = normalize(graph);
  return matrix;
};

/** Устанавливаем уровень узлам процесса
 * добавляются флаги в структуру графа только
 * process - узел является узлом основного процесса если 1
 * y - номер уровня в графе
 * @param process - последовательность узлов
 * @param graph - граф */
function setProcessRank(process: number[], graph: IGraph): IGraph {
  const processGraph: IGraph = {};

  /** Убираем дублирующиеся узлы из процесса с помощью Set */
  Array.from(new Set(process)).forEach((node: number, rankY: number) => {
    graph[node].y = rankY + 1;
    graph[node].isProcess = 1;
    processGraph[node] = graph[node];
  });
  return processGraph;
}

// /** Определяем узлы, связанные с процессом
//  * @param process - последовательность узлов
//  * @param graph - граф */
// function connectedWithProcess(process: IGraph, graph: IGraph) {
// for (const node in graph) {
//   /** Если узел не является узлом процесса и у него еще не определили приближенность к процессу */
//   if (graph.hasOwnProperty(node) && !graph[node].processSibling && !graph[node].isProcess) {
//     /** Проверяем, если среди дочерних или родителських узлов есть узел процесса */
//     const relatives: number[] = [...graph[node].children, ...graph[node].parents];
//     graph[node].processSibling = +relatives.some((n: number) => process[n] && process[n].isProcess);
//   }
// }
// }

/** Приближаем остальные узлы к уровням узлов процесса по среднему значению уровня
 * @param process - последовательность узлов
 * @param graph - граф */
function arrangeRanks(process: IGraph, graph: IGraph) {
  /** [1] Определяем узлы, связанные с процессом */
  connectedness(process, graph);

  /** [2] Сортируем по приближенности к процессу */
  const entries: IEntry[] = Object.entries(graph)
    .filter((a: IEntry) => !graph[+a[0]].isProcess)
    .sort((a: IEntry, b: IEntry) => a[1].processSibling - b[1].processSibling);

  entries.forEach((e: IEntry) => {
    /** Накопленный уровень всех родственников */
    let mRank = 0;
    /** Число учитываемых родственников */
    let relativesCount: number = 0;
    /** Узлы, связанные с текущим узлов */

    /** Суммируем уровни всех родственников, кроме конца процесса */
    [...e[1].children, ...e[1].parents].forEach((n: number) => {
      if (graph[n].type !== 'end') {
        mRank += graph[n].y;
        /** Если узел, не являющийся частью процесса, еще не был переставлен на уровень, то его не учитываем */
        (graph[n].isProcess || graph[n].y) && relativesCount++;
      }
    });

    /** Усредненный уровень. Приведим все к 0.5, чтобы узлы были на одном уровне и граф не расползался в высоту */
    const y: number = Math.ceil(mRank / relativesCount) + 1;
    e[1].y = isNaN(y) ? 0 : y;
  });
}

/** Нормализация уровней
 * @param graph - граф */
function normalize(graph: IGraph): IMatrix {
  /** Количество элементов на уровне */
  const matrix: IMatrix = [];

  /** Собираем массив entries графа, отсортированный по уровню и принадлежности процессу */
  const entries: IEntry[] = Object.entries(graph).sort(
    (a: IEntry, b: IEntry) => b[1].isProcess - a[1].isProcess || a[1].y - b[1].y
  );

  /** Находи конец и ставим его в конец списка */
  const endIndex: number = entries.findIndex((e: IEntry) => e[1].type === 'end');
  entries.push(entries[endIndex]);
  entries.splice(endIndex, 1);

  /** Таблица мэппинга уровня и индекса для нормализации */
  // const map: INumberMap<number> = {};
  const map = new Map();

  /** Если в таблице map нет ключа Y, то создаем его и присваиваем ему index. Index увеличиваем на 1.
   * Если встречаем узел с таким уже записанным в map уровнем, берем нормализованный уровень из map */
  entries.forEach((item: IEntry) => {
    // текущий уровень элемента
    const currentY: number = item[1].y;
    //текущяя длина массива с уровнями
    let idx: number = map.size;

    !map.has(currentY) ? map.set(currentY, idx) : (idx = map.get(currentY));
    /** Если в ряду нет массива, то создаем его */
    !matrix[idx] && (matrix[idx] = []);
    /**  если не узел процесса и первый в массиве пропускаем первый элемент*/
    !item[1].isProcess && !matrix[idx].length && matrix[idx].push(undefined);
    //Добавляем узел в ряд.
    matrix[idx].push(+item[0]);
    graph[+item[0]].y = map.get(currentY);
  });

  return matrix;
}
