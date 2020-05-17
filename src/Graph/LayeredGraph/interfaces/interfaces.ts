/** Матрики узла */
export interface INodeMetrics {
  count: number | string;
  cycling: number | string;
}

/** Метрики ребра */
export interface IEdgeMetrics extends INodeMetrics {
  time: {
    min: number;
    max: number;
    mean: number;
    var: number;
    stdDev: number;
  };
}

/** Узел */
export interface INode {
  name: string;
  type?: string;
  metrics?: INodeMetrics;
}

/** Ребро */
export interface IEdge {
  from: number;
  to: number;
  metrics?: IEdgeMetrics;
  status?: string;
}

/** Путь */
export interface IPath {
  path: number[];
  count: number;
}

/** Данные графа */
export interface IGraphData {
  nodes: INode[];
  edges: IEdge[];
  paths: IPath[];
}

/** Граф */
export interface IGraph {
  [key: number]: IGraphNode;
}

/** Узел графа */
export interface IGraphNode {
  /** Дочерние узлы */
  children: number[];
  /** Родительские узлы */
  parents: number[];
  /** Координата X в матрице */
  x: number;
  /** Координата Y в матрице */
  y: number;
  /** Является ли узел частью процесса */
  isProcess: 1 | 0;
  /** Узлы, связанные с процессом */
  processSibling: number;
  /** Фейковый узел */
  fake: number;
  /** css стили */
  css: IMap<any>;
  /** Тип узла */
  type?: string;
}

export interface INumberMap<V> {
  [key: number]: V;
}

export interface IMap<V> {
  [key: string]: V;
}

/** Object.entries(graph) */
export type IEntry = [string, IGraphNode];

/** Матрица */
export type IMatrix = (number | undefined)[][];

/** Тип для таблицы путей */
export type IPathMap = IMap<Set<number>>;

/** Возвращаемое значение insertFakeNodes */
export interface IFakeResult {
  edges: IEdge[];
  pathMap: IPathMap;
  process: number[];
}

/** Интерфейс, который возвращает балансировка */
export interface IBalanceResult {
  median: number;
  matrix: IMatrix;
}

// ---------------------------------------------------------------------------------------------------------------------

/** Элемент узла для TSX отрисовки */
export interface INodeElement {
  /** Имя узла */
  name: string;
  /** Ссылка на узел в графе */
  node: INode;
  /** Координата X в матрице */
  x: number;
  /** Координата Y в матрице */
  y: number;
  /** Является ли процессом */
  process: number;
  /** Реальный или виртуальный узел */
  fake: number;
  /** Стили */
  css: any;
  /** Зацикленность соответствует нормальному значению */
  isCyclingOk: boolean;
}

// ---------------------------------------------------------------------------------------------------------------------

/** Конфиг визуалки */
export interface IConfig {
  rect: IRect;
  colors: IColors;
  markers: IMarkers;
}

/** Размеры блоков */
export interface IRect {
  /** Ширина узла */
  width: number;
  /** Высота узла */
  height: number;
  /** Отступы между узлами */
  gap: number;
  /** Ширина виртуального узла */
  fakeWidth: number;
}

/** Тип пути */
export type IPathEntry = [string, Set<number>];

/** Объект с линиями */
export interface ILines {
  [key: string]: ILine;
}

/** Линия (ребро) */
export interface ILine {
  /** ссылка на линию */
  line: SVGPathElement;
  /** Флаг доступности */
  disabled: boolean;
  /** Стандартный цвет и цвет ховера */
  color: {
    default: string;
    hover: string;
  };
  /** Стандартный маркер и маркер при ховере */
  marker: {
    default: string;
    hover: string;
  };
}

/** primary - основной цвет / маркер
 * hover - цвет / маркер при ховере
 * disabled - цвет / маркер при disabled = true
 * */

/** Цветовое оформление */
export interface IColors {
  primary: string;
  hover: string;
  disabled: string;
}

/** Маркеры */
export interface IMarkers {
  primary: string;
  hover: string;
  disabled: string;
}

// ---------------------------------------------------------------------------------------------------------------------

/** То, что возвращает функция init */
export interface IGraphResult {
  nodes: INodeElement[];
  graph: IGraph;
}
