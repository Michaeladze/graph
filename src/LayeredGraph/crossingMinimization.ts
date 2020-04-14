import { IGraph, IMatrix } from './interfaces/interfaces';

/** Алгоритм уменьшения количества пересечений ребер
 * @param graph - граф
 * @param matrix - матрица
 */
export const crossingMinimization = (graph: IGraph, matrix: IMatrix) => {

  /** Для каждого уровня матрицы считаем количество пересечений со следующим уровнем */
  for (let i: number = 0; i < matrix.length; i++) {
    if (matrix[i + 1]) {
      const count: number = crossingCount(matrix[i], matrix[i + 1], graph);
      console.log(`Между ${i} и ${i+1} уровнями ${count} пересечений`);
    }
  }
}

/** Функция считает количество пересечений между уровнями
 * @param layer1 - уровень 1
 * @param layer2 - уровень 2
 * @param graph - граф */
function crossingCount(layer1: (number | undefined)[], layer2: (number | undefined)[], graph: IGraph): number {

  let l1: number[] = [];
  let l2: number[] = [];

  /** Собираем массивы пересечений l1 и l2.   */
  for (let i: number = 0; i < layer1.length; i++) {
    const relatives = layer1[i] !== undefined ? [
      ...graph[layer1[i] as number].parents,
      ...graph[layer1[i] as number].children
    ] : [];

    for (let j: number = 0; j < layer2.length; j++) {
      if (layer2[j] !== undefined && relatives.indexOf(layer2[j] as number) >= 0) {
        l1.push(i);
        l2.push(j)
      }
    }
  }

  /** Число пересечений */
  let connectionsBetweenLayers = 0;

  /** Считаем число пересечений */
  for (let a = 0; a < l1.length; a++) {
    for (let b = a; b < l1.length; b++) {
      if (linesCrossing(l1[a], l2[a], l1[b], l2[b])) {
        connectionsBetweenLayers++
      }
    }
  }

  return connectionsBetweenLayers;
}

/** Определяем, есть ли пересечение на перекрестных усзлах
 * @param a1 - перекрестные узлы
 * @param a2 - перекрестные узлы
 * @param b1 - перекрестные узлы
 * @param b2 - перекрестные узлы
 */
function linesCrossing(a1: number, a2: number, b1: number, b2: number): boolean {
  return ((a1 < b1 && a2 > b2) || (a1 > b1 && a2 < b2))
}
