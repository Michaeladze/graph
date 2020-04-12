import { IEdge, IGraph, IGraphData, IMatrix } from './interfaces/interfaces';
import { createGraph } from './createGraph';
import { ranking } from './ranking';
import { ordering } from './ordering';
import { drawEdges } from './drawEdges';
import { insertFakeNodes } from './insertFakeNodes';

export class LayeredGraph {
  /** Граф */
  public graph: IGraph = {};

  constructor(public data: IGraphData) {
  }

  /** Инициализируем граф */
  public init(): any {
    console.log(this.data)
    /** создаем структуру графа */
    this.graph = createGraph(this.data);

    let edges: IEdge[] = [...this.data.edges];

    /** Распределяем узлы по уровням */
    const elementsOnRank: IMatrix = ranking(this.data, this.graph);

    /** Распределяем узлы по горизонтали */
    const matrix: IMatrix = ordering(this.data, this.graph, elementsOnRank);

    /** Вставляем фейковые узлы */
    edges = insertFakeNodes(edges, this.graph, matrix);

    /** Создаем массив узлов с координатами */
    const nodes: any = Object.keys(this.graph).map((n: string) => {
      return {
        name: n,
        x: this.graph[+n].x,
        y: this.graph[+n].y,
        process: this.graph[+n].process,
        fake: this.graph[+n].fake
      }
    });

    setTimeout(() => {
      drawEdges(edges, this.graph);
    }, 500);

    console.log(this.graph);
    return nodes;
  }
}
