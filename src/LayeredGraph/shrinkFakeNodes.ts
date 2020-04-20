import { IGraph, IGraphNode, IMatrix } from './interfaces/interfaces';

/** Сжимаем фейковые узлы, чтобы они не растягивали экран */
export const shrinkFakeNodes = (graph: IGraph, matrix: IMatrix, median: number) => {


  for (let i: number = 0; i < matrix.length; i++) {

    let accDelta: number = 0;

    /** Правая сторона */
    for (let j: number = median + 1; j < matrix[i].length; j++) {
      if (matrix[i][j]) {
        const current: IGraphNode = graph[matrix[i][j] as number];
        const width: number = current.css.width;

        if (current.fake) {
          current.css.translate.x -= accDelta;
          current.css.width = 20;
          accDelta += width;
        } else {
          current.css.translate.x -= accDelta;
        }
      }
    }

    accDelta = 0;

    /** Левая сторона */
    for (let j: number = median - 1; j >= 0; j--) {
      if (matrix[i][j]) {
        const current: IGraphNode = graph[matrix[i][j] as number];
        const width: number = current.css.width;

        if (current.fake) {
          current.css.width = 20;
          accDelta += (width - current.css.width);
          current.css.translate.x += accDelta;
        } else {
          current.css.translate.x -= accDelta;
        }
      }
    }
  }
}
