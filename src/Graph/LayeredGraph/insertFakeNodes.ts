import {
  IEdge, IFakeResult, IGraph, IGraphNode, IMatrix, IPathMap 
} from './interfaces/interfaces';
import { rearrangeMatrix } from './rearrangeMatrix';

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
 * @param matrix - матрица с ячейками
 * @param processList - процесс */
export const insertFakeNodes = (edges: IEdge[], graph: IGraph, matrix: IMatrix, processList: number[]): IFakeResult => {
  /** Копируем процесс */
  const process: number[] = [...processList];
  /** Индексы ребер, которые нужно удалить */
  let indexesToRemove: Set<number> = new Set();
  /** Таблица отслеживания путей. Нужно ддля последующей балансировки дерева. */
  const pathMap: IPathMap = {};

  /** Сортируем по длине ветки и Обходим все ребра и проверяем...*/
  edges
    .sort((e1: IEdge, e2: IEdge) => {
      const delta1: number = Math.abs(graph[e1.from].y - graph[e1.to].y);
      const delta2: number = Math.abs(graph[e2.from].y - graph[e2.to].y);
      return delta1 - delta2;
    })
    .forEach((edge: IEdge, i: number) => {
      let delta: number = graph[edge.from].y - graph[edge.to].y;
      if (Math.abs(delta) > 1) {
        /** Название пути */
        const pathName: string = `${edge.from}=>${edge.to}`;

        if (!pathMap[pathName]) {
          pathMap[pathName] = new Set<number>();
        }

        /** Если ребро не соединяет соседние узлы процесса и ребро пересекает >1 уровня, вставляем фейковый узел */
        const result = insertFakeNode(
          edge.from,
          edge.to,
          graph,
          edges,
          i,
          matrix,
          delta,
          indexesToRemove,
          pathMap[pathName],
          process
        );

        indexesToRemove = result.indexesToRemove;
        matrix = result.matrix;
      }
    });

  /** Конвертируем сет в массив и сортируем, чтобы при обходе не стереть нужное ребро */
  const indexes: number[] = Array.from(indexesToRemove).sort((n: number, m: number) => n - m);
  /** Удаляем ребра */
  for (let i: number = indexes.length - 1; i >= 0; i--) {
    edges.splice(indexes[i], 1);
  }

  return { edges, pathMap, process };
};

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
 * @param process - процесс
 * */
function insertFakeNode(
  from: number,
  to: number,
  graph: IGraph,
  edges: IEdge[],
  i: number,
  matrix: IMatrix,
  delta: number,
  indexesToRemove: Set<number>,
  path: Set<number>,
  process: number[]
): {
  indexesToRemove: Set<number>;
  matrix: IMatrix;
} {
  /** Добавляем индексы для удаления */
  indexesToRemove.add(i);

  /** Добавляем узлы, которые не являются частью процесса, в путь */
  if (graph[from].isProcess === 0) path.add(from);
  if (graph[to].isProcess === 0) path.add(to);

  /** Индекс последнего вставленного ребра в edges */
  let insertedNodeIndex: number = -1;

  /** Флаг процесса  */
  const isProcess: boolean = process
    .map((n: number, i: number) => `${n}=>${process[i + 1]}`)
    .includes(`${from}=>${to}`);

  /** Ищеем такой X, на котором можно провести вертикальную черту */
  const desiredX: number = findDesiredX(from, to, graph, matrix);

  /** Может показаться, что тут дублирование кода c findDesiredX. Но это не так.  */
  const n1: IGraphNode = graph[from];
  const n2: IGraphNode = graph[to];
  const c: boolean = n1.y > n2.y;
  let y: number = c ? n1.y - 1 : n1.y + 1;

  /** Переопределяем from  */
  let fromNode: number = from;

  for (y; c ? y > n2.y : y < n2.y; c ? y-- : y++) {
    /** Генерируем имя фейкового узла */
    const name: number = hashNodeName(from, to, y);
    path.add(name);

    insertedNodeIndex = insertNode(graph, edges, name, y, desiredX, fromNode, to, isProcess, process);
    indexesToRemove.add(insertedNodeIndex);
    fromNode = name;
  }

  return {
    indexesToRemove,
    matrix: rearrangeMatrix(graph)
  };
}

/** Функция хеширования названия фейкового узла
 * @param from - откуда идем
 * @param to - куда идем*
 * @param zeros - количетво нуле в имени
 * */
function hashNodeName(from: number, to: number, zeros: number): number {
  const s: string = new Array(zeros).fill('0').join('');
  return -Math.abs(+`${to}${s}${from}`);
}

/** Добавляем узел
 * @param graph - граф
 * @param edges - ребра
 * @param name - имя фейкового узла
 * @param row - ряд
 * @param col - колонка
 * @param from - откуда идем
 * @param to - куда идем
 * @param isProcess - флаг процесса, добавляеся фейковым узлам на уровне 0
 * @param process - процесс
 */
function insertNode(
  graph: IGraph,
  edges: IEdge[],
  name: number,
  row: number,
  col: number,
  from: number,
  to: number,
  isProcess: boolean,
  process: number[]
): number {
  /** Создаем новый узел в графе */
  graph[name] = {
    children: [to],
    x: col,
    y: row,
    parents: [from],
    isProcess: isProcess ? 1 : 0,
    processSibling: 0,
    fake: 1,
    css: {}
  };

  if (isProcess) {
    /** Добавляем узел в процесс */
    appendToProcess(to, name, process);
  }

  /** Добавляем name в дочерние узлы родителю и убираем непосредственную связь from - to */
  graph[from] = {
    ...graph[from],
    children: [...graph[from].children.filter((n: number) => n !== to), name]
  };

  /** Добавляем name в родительские узлы последователю и убираем непосредственную связь from - to */
  graph[to] = {
    ...graph[to],
    parents: [...graph[to].parents.filter((n: number) => n !== from), name]
  };

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

/** Вставить фейковый узел в процесс
 * @param to - потомок
 * @param node - текущий фейковый узел
 * @param process - процесс
 */
function appendToProcess(to: number, node: number, process: number[]) {
  const index: number = process.indexOf(to);
  if (index >= 0) {
    process.splice(index, 0, node);
  }
}

/** Между уровнями находим свободные ячейки, которые выстроены в одну вертикальную линию */
function findDesiredX(from: number, to: number, graph: IGraph, matrix: IMatrix): number {
  const n1: IGraphNode = graph[from];
  const n2: IGraphNode = graph[to];

  const c: boolean = n1.y > n2.y;

  /** Начинаем со следующего уровня */
  let y: number = c ? n1.y - 1 : n1.y + 1;

  /** Желательная координата */
  let x: number = Math.max(n1.x, n2.x);

  /** Итерируем, пока не найдем свободный столбец */
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let columnIsEmpty: boolean = true;
    for (y; c ? y > n2.y : y < n2.y; c ? y-- : y++) {
      if (matrix[y][x] !== undefined) {
        columnIsEmpty = false;
        break;
      }
    }

    if (columnIsEmpty) {
      break;
    }

    x++;
  }

  return x;
}
