import { IEntry, IGraph, IMatrix } from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';
import { fillGaps } from './fillGaps';

/** [Описание]
 * [1] В порядке добавления на уровень выводим узлы в ряд
 * [2] В каждом ряду ищем (parent)-->(child) структуру
 * [3] Если находим, сдвигаем (child) на уровень вниз
 * [4] Перераспределяем узлы в матрице */

/** Функция распределения узлов по горизонтали
 * @param graph - граф
 * @param matrix - матрица элементов
 * @param end - индекс последнего узла */
export const ordering = (graph: IGraph, matrix: IMatrix, end: number): IMatrix => {
  /** Выводим все узлы уровня в один ряд */
  for (const key in graph) {
    if (!graph[key].isProcess) {
      const rank: number = graph[key].y;
      graph[key].x = matrix[rank].indexOf(+key);
    }
  }

  /** Передвигаем последний узел на последний ряд, если уже не там и он один на этом ряду */
  if (matrix[matrix.length - 1].length > 1) {
    graph[end].y = matrix.length;
  }

  /** Ищем parent-child структуры и сдвигаем граф */
  matrix = findParentChild(graph, rearrangeMatrix(graph));
  normalizeRows(matrix, graph);

  return fillGaps(graph);
};

/** Находим узлы на одном уровне и если они являются parent->child структурой, растаскиваем их на разные уровни
 * @param graph - граф
 * @param matrix - массив количества узлов на уровне */
function findParentChild(graph: IGraph, matrix: IMatrix): IMatrix {
  /** Не эффективно */
  for (let rank: number = 0; rank < matrix.length; rank++) {
    const rankNodes: number[] = matrix[rank] as number[];

    /** При динамическом добавлении могут возникнуть пустые ряды, поэтому нужна проверка */
    if (rankNodes) {
      rankNodes.forEach((node: number | undefined) => {
        graph[node as number].children.forEach((child: number) => {
          const index: number = rankNodes.indexOf(child);
          /** Если находим... */
          if (index >= 0 && node !== rankNodes[index]) {
            /** Меняем child координаты и родительне является ущлов процесса */
            shiftRanks(rank, node as number, rankNodes[index] as number, graph, matrix);
            /** И перераспределяем узлы в матрице */
            matrix = rearrangeMatrix(graph);
          }
        });
      });
    }
  }

  return matrix;
}

/** Сдвигаем уровни
 * @param rank - уровень, на котором происходит сдвиг
 * @param parent - родительский узел
 * @param child - дочерний узел
 * @param graph - граф
 * @param matrix - матрица
 * */
function shiftRanks(rank: number, parent: number, child: number, graph: IGraph, matrix: IMatrix) {
  /** Сортируем граф по уровням */
  const entries: IEntry[] = Object.entries(graph).sort((a: IEntry, b: IEntry) => a[1].y - b[1].y);

  /** Родственные элементы дочернего узла */
  const relatives: number[] = [...graph[child].children, ...graph[child].parents];
  /** Узел процессса на уровне rank */
  const processNode: IEntry = entries.find(
    ([e]: IEntry) => graph[+e[0]].y === rank + 1 && graph[+e[0]].isProcess
  ) as IEntry;

  /** Новый уровень */
  let startShiftingRank: number = rank;

  /** Задаем сдвиг на 1 уровень вниз */
  const condition: boolean =
    (processNode && relatives.indexOf(+processNode[0]) >= 0) || matrix[rank + 1][graph[parent].x] !== undefined;
  if (condition) {
    startShiftingRank = rank + 1;
  }

  /** Если сдвиг произошел, то сдвигаем все узлы снизу */
  if (startShiftingRank > rank) {
    entries.forEach((e: IEntry) => {
      const name: number = +e[0];
      /** Когда доходим до уровня, где происходит перемещение узла,
       * все последующие узлы сдвигаем на один */
      if (e[1].y >= startShiftingRank) {
        graph[name].y += 1;
      }
    });
  }

  /** Ставим дочерний узел под родительский. Если он является частью процесса, то меняем только Y */
  if (!graph[child].isProcess && !graph[parent].isProcess) {
    graph[child].x = graph[parent].x;
  }
  graph[child].y = graph[parent].y + 1;
}

/** Нормализация рядов */
function normalizeRows(matrix: IMatrix, graph: IGraph) {
  /** Таблица мэппинга уровня и индекса для нормализации */
  // const map: INumberMap<number> = {};
  const map = new Map();

  /** Если в таблице map нет ключа Y, то создаем его и присваиваем ему index. Index увеличиваем на 1.
   * Если встречаем узел с таким уже записанным в map уровнем, берем нормализованный уровень из map */
  matrix.forEach((row: (number | undefined)[], currentY: number) => {
    let idx: number = map.size;

    !map.has(currentY) ? map.set(currentY, idx) : (idx = map.get(currentY));
    /** Если в ряду нет массива, то создаем его */
    !matrix[idx] && (matrix[idx] = []);

    row.forEach((n: number | undefined) => {
      if (n !== undefined) {
        graph[n].y = map.get(currentY);
      }
    });
  });
}
