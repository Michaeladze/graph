import { IGraph, IMatrix, IPathEntry, IRect } from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';

/** Ищем минимальную и максимальную координаты реальных узлов.
 * Все фейковые узлы, которые находятся дальше этих координат, сжимаются.  */
export const shrinkFakeNodes = (paths: IPathEntry[][], rect: IRect, graph: IGraph, median: number) => {
  let matrix: IMatrix = rearrangeMatrix(graph);

  /** Минимальная и максимальная координаты реальных узлов */
  let min: number = Number.MAX_SAFE_INTEGER;
  let max: number = Number.MIN_SAFE_INTEGER;

  matrix.forEach((row: (number | undefined)[]) => {
    row.forEach((n: number | undefined) => {
      if (n !== undefined && !graph[n].fake) {
        min = Math.min(min, graph[n].x);
        max = Math.max(max, graph[n].x);
      }
    });
  });

  /** Левая сторона */
  const left: number[][] = paths[0]
    .map((e: IPathEntry) => Array.from(e[1]).filter((n: number) => graph[n].fake && graph[n].x < min))
    .filter((e: number[]) => e.length)
    .sort((a: number[], b: number[]) => graph[b[0]].x - graph[a[0]].x);

  let x: number = min;

  left.forEach((nodes: number[]) => {
    nodes.forEach((n: number) => {
      if (graph[n].x !== x) {
        x = graph[n].x;
      }

      graph[n].css.width = rect.fakeWidth;
      graph[n].css.translate.x += (rect.width - rect.fakeWidth) * (min - x);
    });
  });

  /** Правая сторона */
  const right: number[][] = paths[1]
    .map((e: IPathEntry) => Array.from(e[1]).filter((n: number) => graph[n].fake && graph[n].x > max))
    .filter((e: number[]) => e.length)
    .sort((a: number[], b: number[]) => graph[a[0]].x - graph[b[0]].x);

  x = max;

  right.forEach((nodes: number[]) => {
    nodes.forEach((n: number) => {
      if (graph[n].x !== x) {
        x = graph[n].x;
      }

      graph[n].css.width = rect.fakeWidth;

      if (x > max) {
        graph[n].css.translate.x -= (rect.width - rect.fakeWidth) * (x - max - 1);
      }
    });
  });
};
