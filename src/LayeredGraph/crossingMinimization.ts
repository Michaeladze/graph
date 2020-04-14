import { IBalanceResult, IGraph, IPathMap } from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';

/** Алгоритм уменьшения количества пересечений ребер
 * @param graph - граф
 * @param balance - результат выполнения балансировки
 * @param pathMap - таблица путей
 */
export const crossingMinimization = (graph: IGraph, { matrix, median }: IBalanceResult, pathMap: IPathMap) => {

  let processed: any = {};

  const iter = () => {
    /** Для каждого уровня матрицы меняем узлы местами и смотрим, если пересечений стало меньше */
    for (let i: number = 0; i < matrix.length; i++) {
      if (matrix[i + 1]) {
        console.log('======', i, '=======')
        /** Минимальное число пересечений */
        let minCount: number = Number.MAX_SAFE_INTEGER;
        /** Указатели на индексы и узлы */
        let index1: number = -1;
        let index2: number = -1;
        let node1: number | undefined;
        let node2: number | undefined;

        /** Обходим каждый узел уровня и меняем его с другим узлом */
        loop:
        for (let j: number = 0; j < matrix[i].length; j++) {
          for (let c: number = j + 1; c < matrix[i].length; c++) {
            /** Если это не медиана и хотя бы один узел не undefined */
            if (j !== median && c !== median &&
              ((matrix[i][j] !== undefined && matrix[i][c] === undefined) ||
                (matrix[i][j] !== undefined && matrix[i][c] !== undefined) ||
                (matrix[i][j] === undefined && matrix[i][c] !== undefined))) {
              /** Меняем местами два соседних элемента и проверяем, сколько пересечений */
              const tmp = matrix[i][j];
              matrix[i][j] = matrix[i][c];
              matrix[i][c] = tmp;

              /** Количество пересечений */
              const count: number = crossingCount(matrix[i], matrix[i + 1], graph);

              if (processed[`${matrix[i][j]}<=>${matrix[i][c]}`] === undefined) {
                /** Помечаем связку как пройденную */
                processed[`${matrix[i][j]}<=>${matrix[i][c]}`] = count;

                if (count < minCount) {
                  /** Если нашли такой кейс, где число пересечений меньше минимального,
                   * делаем его минимальным */
                  minCount = count;
                  index1 = j;
                  index2 = c;
                  node1 = matrix[i][j];
                  node2 = matrix[i][c];

                  if (count === 0) {
                    /** Если число пересечений равно 0, то выходим из цикла */
                    matrix[i][c] = matrix[i][j];
                    matrix[i][j] = tmp;
                    break loop;
                  }
                }

                /** Откатываем swap, чтобы не нарушить итерацию */
                matrix[i][c] = matrix[i][j];
                matrix[i][j] = tmp;
              }
            }
          }
        }

        if (node1 && node2) {
          /** Если есть два узла, которые удалось поменять местами, присваиваем им новые X  */
          graph[node1].x = index1;
          graph[node2].x = index2;
        }
      }
    }

    /** Перераспределяем матрицу */
    matrix = rearrangeMatrix(graph);
  }

  /** Несколько раз выполняем итерацию для более точного результата */
  for (let i = 0; i < 10; i++) {
    iter();
    if (i % 3 === 0) {
      processed = {};
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
