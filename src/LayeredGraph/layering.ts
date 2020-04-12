/** распределение по уровням */
import { IGraph, INumberMap } from './interfaces/interfaces';

/** Распределение узлов по уровням
 * @param start: number - узел, с которого идет начала обхода дерева
 * @param graph: IGraph - объект графа
 * @return : IGraph - новый граф с распределенными уровнями */
export const layering = (start: number, graph: IGraph): IGraph => {
  /** Создаем объект с посещенными узлами */
  const visitedBy: INumberMap<INumberMap<boolean>> = {};

  depthFirstSearch(start, graph, 0, visitedBy);
  return graph;
}

/** РОбход графа в глубину
 * @param nodeId: number - узел, который будет обрабатываться на текущей итерации
 * @param graph: IGraph - объект графа
 * @param layer: number - номер уровня
 * @param visitedBy: INumberMap<INumberMap<boolean>> - список посещенных узлов */
function depthFirstSearch(nodeId: number, graph: IGraph, layer: number = 0, visitedBy: INumberMap<INumberMap<boolean>>) {

  /** Назначаем уровень узлу */
  graph[nodeId].y = layer;

  /** Для каждого узла, соединенного с nodeId, проверяем... */
  graph[nodeId].children.forEach((node: number) => {

    /** ...если отсутствует visitedBy, то создаем его. */
    if (visitedBy[node] === undefined) {
      visitedBy[node] = {};
    }

    /** Проверяем, если дочерний узел node не посещался текущим узлом nodeId, то... */
    if (!visitedBy[node][nodeId]) {

      /** ...считаем уровень. Если уровень у узла уже есть и он больше, чем layer, то
       * оставляем уровень узла. Иначе выбираем layer + 1 */
      const l: number = graph[node].y > layer ? graph[node].y : layer + 1;

      /** Помечаем узел как пройденный из узла nodeId */
      visitedBy[node][nodeId] = true;

      /** Рекурсивно обходим дочерние узлы узла node */
      depthFirstSearch(node, graph, l, visitedBy);
    }

  });

}
