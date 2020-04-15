import { IEdge, IFakeResult, IGraph, IMatrix, IPathMap } from './interfaces/interfaces';

/** [Описание]
 * [1] Определяем, если между узлами ребро тянется через >1 уровней
 * [2] Если да, то спускаемся на уровень вниз/поднимаемся вверх и обходим пока что от 0 до бесконечности,
 * пока не найдем свободную ячейку
 * [3] Когда находим свободную ячейку, вставляем в нее новый узел. Повторяем [1].
 * [4] Удаляем ребро, которое заменили на связь (from)-->(узел)-->(to)
 * */

/** Вставляем фейковые узлы
 * @param edges - ребра
 * @param graph - граф
 * @param matrix - матрица с ячейками */
export const insertFakeNodes = (edges: IEdge[], graph: IGraph, matrix: IMatrix): IFakeResult => {
  /** Индексы ребер, которые нужно удалить */
  let indexesToRemove: Set<number> = new Set();
  /** Таблица отслеживания путей. Нужно ддля последующей балансировки дерева. */
  const pathMap: IPathMap = {};

  /** Обходим все ребра и проверяем...*/
  edges.forEach((edge: IEdge, i: number) => {
    let delta: number = graph[edge.from].y - graph[edge.to].y;
    if (Math.abs(delta) > 1) {
      /** Название пути */
      const pathName: string = `${edge.from}=>${edge.to}`;
      if (pathMap[pathName] === undefined) {
        pathMap[pathName] = new Set<number>();
      }

      /** Если ребро не соединяет соседние узлы процесса и ребро пересекает >1 уровня, вставляем фейковый узел */
      indexesToRemove = insertFakeNode(edge.from, edge.to, graph, edges, i, matrix, delta, indexesToRemove, pathMap[pathName]);
    }
  });

  /** Конвертируем сет в массив и сортируем, чтобы при обходе не стереть нужное ребро */
  const indexes: number[] = Array.from(indexesToRemove).sort((n: number, m: number) => n - m);
  /** Удаляем ребра */
  for (let i: number = indexes.length - 1; i >= 0; i--) {
    edges.splice(indexes[i], 1);
  }

  return { edges, pathMap };
}


/** Вставляем фейковый узел
 * @param from - откуда идем
 * @param to - куда идем
 * @param graph - граф
 * @param edges - ребра
 * @param i - индекс последнего ребра, которое нужно удалить
 * @param matrix - матрица
 * @param delta - разница
 * @param indexesToRemove - индексы ребер, которые нужно удалить по окончании циклов
 * @param path - путь
 * */
function insertFakeNode(from: number, to: number, graph: IGraph, edges: IEdge[], i: number, matrix: IMatrix,
                        delta: number, indexesToRemove: Set<number>, path: Set<number>): Set<number> {

  /** Добавляем индексы для удаления */
  indexesToRemove.add(i);

  /** Генерируем имя фейкового узла */
  const name: number = hashNodeName(from, to);

  /** Добавляем узлы, которые не являются частью процесса, в путь */
  if (graph[from].process === 0) path.add(from);
  if (graph[to].process === 0) path.add(to);
  path.add(name);

  /** Индекс последнего вставленного ребра в edges */
  let insertedNodeIndex: number = -1;

  /** [1] Перемещаемся на уровень вверх/вниз */
  const newRank: number = delta > 0 ? graph[from].y - 1 : graph[from].y + 1;

  /** [2] Ищем на новом уровне свободную ячейку */
  for (let col: number = 0; col < matrix[newRank].length; col++) {

    /** Занимаем ячейку */
    if (matrix[newRank][col] === undefined) {
      matrix[newRank][col] = name;
      insertedNodeIndex = insertNode(graph, edges, name, newRank, col, from, to);
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
    /** Добавляем индексы для удаления */
    indexesToRemove.add(insertedNodeIndex);
    return insertFakeNode(name, to, graph, edges, insertedNodeIndex, matrix, delta, indexesToRemove, path);
  }

  return indexesToRemove;
}

/** Функция хеширования названия фейкового узла
 * @param from - откуда идем
 * @param to - куда идем*/
function hashNodeName(from: number, to: number): number {
  return -Math.abs(+`${from}${to}`);
}

/** Добавляем узел
 * @param graph - граф
 * @param edges - ребра
 * @param name - имя фейкового узла
 * @param row - ряд
 * @param col - колонка
 * @param from - откуда идем
 * @param to - куда идем
 */
function insertNode(graph: IGraph,
                    edges: IEdge[],
                    name: number,
                    row: number,
                    col: number,
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
    fake: 1,
    css: {}
  };

  /** Добавляем name в дочерние узлы родителю и убираем непосредственную связь from - to */
  graph[from] = {
    ...graph[from],
    children: [...graph[from].children.filter((n: number) => n !== to), name]
  }

  /** Добавляем name в родительские узлы последователю и убираем непосредственную связь from - to */
  graph[to] = {
    ...graph[to],
    parents: [...graph[to].parents.filter((n: number) => n !== from), name]
  }

  /** Заменяем в массиве ребер текущее ребро двумя новыми */
  edges.push({
    from: from,
    to: name
  });
  edges.push({
    from: name,
    to: to
  });

  return edges.length - 1;
}
