import { IGraph } from './interfaces/interfaces';

/** Прижимаем граф после всех трансформаций к левому краю
 * @param graph - граф
 */
export const stickToLeft = (graph: IGraph) => {
  /** [1] Ищем минимиальную координату Х */
  let minX: number = Number.MAX_SAFE_INTEGER;

  const keys: string[] = Object.keys(graph);

  keys.forEach((key: string) => {
    minX = Math.min(minX, graph[+key].css.translate.x);
  });

  /** [2] Двигаем все узлы влево на minX */
  keys.forEach((key: string) => {
    graph[+key].css.translate.x -= minX;
  });
};
