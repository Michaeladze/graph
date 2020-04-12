import { IEdge, IGraph, IGraphData, IMatrix } from './interfaces/interfaces';

/** Вставляем фейковые узлы
 * @param data - данные
 * @param graph - граф
 * matrix - матрица с ячейками */
export const insertFakeNodes = (data: IGraphData, graph: IGraph, matrix: IMatrix) => {

  /** Обходим все ребра и проверяем...*/
  data.edges.forEach((edge: IEdge, i: number) => {
    let delta: number = graph[edge.from].y - graph[edge.to].y;
    if (Math.abs(delta) > 1) {
      /** Если ребро пересекает >1 уровня, вставляем фейковый узел */
      insertFakeNode(edge.from, edge.to, graph, data, i, matrix, delta);
    }
  });
}


/** Вставляем фейковый узел
 * @param from - откуда идем
 * @param to - куда идем
 * @param graph - граф
 * @param data - данные
 * @param i - индекс последнего ребра, которое нужно удалить
 * @param matrix - матрица
 * @param delta - разница */
function insertFakeNode(from: number, to: number, graph: IGraph, data: IGraphData, i: number, matrix: IMatrix, delta: number) {
  /** Генерируем имя фейкового узла */
  const name: number = hashNodeName(from, to);
  /** Индекс последнего вставленного ребра в edges */
  let insertedNodeIndex: number = -1;

  /** [1] Перемещаемся на уровень вверх/вниз */
  const newRank: number = delta > 0 ? graph[from].y - 1 : graph[from].y + 1;

  /** [2] Ищем на новом уровне свободную ячейку */
  for (let col: number = 0; col < matrix[newRank].length; col++) {

    /** Занимаем ячейку */
    if (matrix[newRank][col] === undefined) {
      matrix[newRank][col] = name;
      insertedNodeIndex = insertNode(graph, data, name, newRank, col, i, from, to);
      break;
    }

    /** Если дошли до границы матрицы, расширяем ее */
    if (col === matrix[newRank].length - 1) {
      matrix[newRank].push(undefined);
    }
  }

  /** [3] Если разница уровней все еще больше 1, то рекурсивно вызываем insertFakeNode */
  delta = newRank - graph[to].y;
  if (Math.abs(delta) > 1) {
    insertFakeNode(name, to, graph, data, insertedNodeIndex, matrix, delta);
  }
}

/** Функция хеширования названия фейкового узла
 * @param from - откуда идем
 * @param to - куда идем*/
function hashNodeName(from: number, to: number): number {
  return -Math.abs(+`${from}${to}`);
}

/** Добавляем узел
 * @param graph - граф
 * @param data - данные
 * @param name - имя фейкового узла
 * @param row - ряд
 * @param col - колонка
 * @param i - индекс ребра, которое нужно удалить
 * @param from - откуда идем
 * @param to - куда идем
 */
function insertNode(graph: IGraph,
                    data: IGraphData,
                    name: number,
                    row: number,
                    col: number,
                    i: number,
                    from: number,
                    to: number): number {

  /** Создаем новый узел в графе */
  graph[name] = {
    children: [to],
    x: col,
    y: row,
    parents: [from],
    process: 0,
    processSibling: 0,
    fake: 1
  };

  /** Заменяем в массиве ребер текущее ребро двумя новыми */
  data.edges.push({
    from: from,
    to: name
  });
  data.edges.push({
    from: name,
    to: to
  });
  data.edges.splice(i, 1);

  return data.edges.length - 1;
}
