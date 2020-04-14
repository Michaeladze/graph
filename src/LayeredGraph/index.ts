import { IEdge, IFakeResult, IGraph, IGraphData, IMatrix } from './interfaces/interfaces';
import { createGraph } from './createGraph';
import { ranking } from './ranking';
import { ordering } from './ordering';
import { drawEdges } from './drawEdges';
import { insertFakeNodes } from './insertFakeNodes';
import { balancing } from './balancing';

export class LayeredGraph {
  /** Граф */
  public graph: IGraph = {};

  constructor(public data: IGraphData) {
  }

  /** Инициализируем граф */
  public init(): any {
    console.log(this.data);

    /** [1] Создаем структуру графа */
    this.graph = createGraph(this.data);

    let edges: IEdge[] = [...this.data.edges];

    /** [2] Распределяем узлы по вертикали */
    const elementsOnRank: IMatrix = ranking(this.data, this.graph);

    /** [3] Распределяем узлы по горизонтали */
    const matrix: IMatrix = ordering(this.graph, elementsOnRank);

    /** [4] Вставляем фейковые узлы */
    const fakes: IFakeResult = insertFakeNodes(edges, this.graph, matrix);
    edges = fakes.edges;

    /** [5] Балансировка */
    balancing(this.data.paths[0].path, this.graph, matrix, fakes.pathMap);

    /** [6] Рисуем ребра */
    setTimeout(() => {
      drawEdges(edges, this.graph);
    }, 500);

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

    console.log(this.graph);
    return nodes;
  }
}
