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
  }
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
  paths?: IPath[];
}

/** Граф */
export interface IGraph {
  [key: number]: IGraphNode;
}

/** Узел графа */
export interface IGraphNode {
  children: number[];
  parents: number[];
  x: number;
  y: number;
  process: 1 | 0;
  /** Узлы, связанные с процессом */
  processSibling: number;
  /** Фейковый узел */
  fake: number;
}

export interface INumberMap<V> {
  [key: number]: V;
}

/** Object.entries(graph) */
export type IEntry = [string, IGraphNode];

/** Матрица */
export type IMatrix = (number | undefined)[][];
