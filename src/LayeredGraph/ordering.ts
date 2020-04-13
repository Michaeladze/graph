import { IEntry, IGraph, IMatrix } from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';

/** [Описание]
 * [1] В порядке добавления на уровень выводим узлы в ряд
 * [2] В каждом ряду ищем (parent)-->(child) структуру
 * [3] Если находим, сдвигаем (child) на уровень вниз
 * [4] Перераспределяем узлы в матрице */

/** Функция распределения узлов по горизонтали
 * @param graph - граф
 * @param elementsOnRank - матрица элементов */
export const ordering = (graph: IGraph, elementsOnRank: IMatrix): IMatrix => {

  /** Копируем массив */
  const matrix: IMatrix = [...elementsOnRank];

  /** Выводим все узлы уровня в один ряд */
  for (const key in graph) {
    if (!graph[key].process) {
      const rank: number = graph[key].y;
      graph[key].x = matrix[rank].indexOf(+key);
    }
  }

  /** Ищем parent-child структуры и сдвигаем граф */
  return findParentChild(graph, matrix);
}

/** Находим узлы на одном уровне и если они являются parent->child структурой, растаскиваем их на разные уровни
 * @param graph - граф
 * @param elementsOnRank - массив количества узлов на уровне */
function findParentChild(graph: IGraph, elementsOnRank: IMatrix): IMatrix {

  /** Не эффективно */
  for (let rank: number = 0; rank < elementsOnRank.length; rank++) {
    const rankNodes: number[] = elementsOnRank[rank] as number[];

    rankNodes.forEach((node: number | undefined) => {
      graph[node as number].children.forEach((child: number) => {
        const index: number = rankNodes.indexOf(child);
        /** Если находим... */
        if (index >= 0) {
          /** Меняем child координаты и родительне является ущлов процесса */
          shiftRanks(rank, (node as number), (rankNodes[index] as number), graph);
          /** И перераспределяем узлы в матрице */
          elementsOnRank = rearrangeMatrix(graph);
        }
      })
    })
  }

  return elementsOnRank;
}

/** Сдвигаем уровни
 * @param rank - уровень, на котором происходит сдвиг
 * @param parent - родительский узел
 * @param child - дочерний узел
 * @param graph - граф */
function shiftRanks(rank: number, parent: number, child: number, graph: IGraph) {
  console.log(`${parent}-->${child}`);
  /** Сортируем граф по уровням */
  const entries: IEntry[] = Object.entries(graph).sort((a: IEntry, b: IEntry) => a[1].y - b[1].y);

  /** Родственные элементы дочернего узла */
  const relatives: number[] = [...graph[child].children, ...graph[child].parents];
  /** Узел процессса на уровне rank */
  const processNode: IEntry = entries.find(([e]: IEntry) =>
    graph[+e[0]].y === rank + 1 && graph[+e[0]].process) as IEntry;

  if (processNode) {
    /** Новый уровень */
    let startShiftingRank: number = rank

    /** Задаем сдвиг на 1 уровень вниз */
    if (relatives.indexOf(+processNode[0]) >= 0) {
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
  }

  /** Ставим дочерний узел под родительский. Если он является частью процесса, то меняем только Y */
  if (!graph[child].process && !graph[parent].process) {
    graph[child].x = graph[parent].x;
  }
  graph[child].y = graph[parent].y + 1;
}
