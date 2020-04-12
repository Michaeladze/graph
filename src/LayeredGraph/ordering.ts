import { IEntry, IGraph, IGraphData, INumberMap } from './interfaces/interfaces';

export const ordering = (data: IGraphData, graph: IGraph, elementsOnRank: number[][]) => {

  /** Копируем массив */
  const elementsOnRankTmp: number[][] = [...elementsOnRank];
  console.log(elementsOnRank)

  /** Выводим все узлы уровня в один ряд */
  for (const key in graph) {
    if (!graph[key].process) {
      const rank: number = graph[key].y;
      graph[key].x = elementsOnRankTmp[rank].indexOf(+key);
    }
  }

  /** Ищем parent-child структуры и сдвигаем граф */
  // findParentChild(graph, elementsOnRank);
}

/** Находим узлы на одном уровне и если они являются parent->child структурой, растаскиваем их на разные уровни
 * @param graph - граф
 * @param elementsOnRank - массив количества узлов на уровне */
function findParentChild(graph: IGraph, elementsOnRank: number[]) {

  /** [1] Находим уровни, где больше 1 узла */
  const entries: INumberMap<IEntry[]> = Object.entries(graph)
    .filter((e: IEntry) => elementsOnRank[e[1].y] > 1)
    .reduce((acc: INumberMap<IEntry[]>, e: IEntry) => {
      if (acc[e[1].y] === undefined) {
        acc[e[1].y] = [];
      }
      acc[e[1].y].push(e);
      return acc;
    }, {});


  /** [2] В каждом ряду ищем пары parent->child. Не супер эффективно, к сожалению */
  for (const rank in entries) {
    const nodes: number[] = entries[rank].map((e: IEntry) => +e[0]);
    entries[rank].forEach((e: IEntry) => {
      for (let i = 0; i < e[1].children.length; i++) {
        const index: number = nodes.indexOf(e[1].children[i]);
        /** Если находим, меняем child координаты и родительне является ущлов процесса */
        if (index >= 0) {
          shiftRanks(+rank, +e[0], nodes[index], graph);
        }
      }
    })
  }
}

/** Сдвигаем уровни
 * @param rank - уровень, на котором происходит сдвиг
 * @param parent - родительский узел
 * @param child - дочерний узел
 * @param graph - граф */
function shiftRanks(rank: number, parent: number, child: number, graph: IGraph) {
  /** Сортируем граф по уровням */
  const entries: IEntry[] = Object.entries(graph).sort((a: IEntry, b: IEntry) => a[1].y - b[1].y);

  /** Если передвигаемый (дочерний) узел связан с узлом процесса на новом уровне, двигаем процесс */
  const relatives: number[] = [...graph[child].children, ...graph[child].parents];
  /** Узел процессса на уровне rank */
  const processNode: IEntry = entries.find((e: IEntry) =>
    graph[+e[0]].y === rank + 1 && graph[+e[0]].process) as IEntry;

  if (processNode) {
    /** Новый уровень */
    let startShiftingRank: number = rank

    /** Задваем сдвиг на 1 уровень вниз */
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
  if (!graph[child].process  && !graph[parent].process) {
    graph[child].x = graph[parent].x;
  }
  graph[child].y = graph[parent].y + 1;
}
