import { IBalanceResult, IEdge, IFakeResult, IGraph, IGraphData, IMatrix } from './interfaces/interfaces';
import { createGraph } from './createGraph';
import { ranking } from './ranking';
import { ordering } from './ordering';
import { insertFakeNodes } from './insertFakeNodes';
import { balancing } from './balancing';
import { crossingMinimization } from './crossingMinimization';
import { shrink } from './shrink';
import { drawEdges } from './drawEdges';
import { initProcess } from './initProcess';

export class LayeredGraph {
  /** Граф */
  public graph: IGraph = {};
  /** Матрица */
  public matrix: IMatrix = [];
  /** Медиана */
  public median: number = 0;
  /** Процесс */
  public process: number[] = [];

  constructor(public data: IGraphData) {
  }

  /** Инициализируем граф */
  public init(): any {
    console.log(this.data);

    this.process = initProcess(this.data.paths[0].path);

    /** [1] Создаем структуру графа */
    this.graph = createGraph(this.data);

    let edges: IEdge[] = [...this.data.edges];

    /** [2] Распределяем узлы по вертикали */
    const elementsOnRank: IMatrix = ranking(this.data, this.graph);

    /** [3] Распределяем узлы по горизонтали */
    this.matrix = ordering(this.graph, elementsOnRank);

    /** [4] Вставляем фейковые узлы */
    const fakes: IFakeResult = insertFakeNodes(edges, this.graph, this.matrix);
    edges = fakes.edges;

    /** [5] Балансировка */
    const balance: IBalanceResult = balancing(this.process, this.graph, this.matrix, fakes.pathMap);
    this.median = balance.median;

    /** [6] Уменьшаем количество пересечений */
    this.matrix = crossingMinimization(this.graph, balance);

    /** [7] Убираем пустые ячейки */
    const shrinkResult: IBalanceResult = shrink(this.graph, this.matrix, this.median);
    this.matrix = shrinkResult.matrix;
    this.median = shrinkResult.median;

    /** Создаем массив узлов с координатами */
    const nodes: any = Object.keys(this.graph).map((n: string) => {
      const proximity: number = this.graph[+n].x - this.median !== 0 ?
        this.graph[+n].x - this.median / Math.abs(this.graph[+n].x - this.median) : 0;
      // const deltaX: number = this.graph[+n].fake ? -proximity * 45 : 0;
      this.graph[+n].proximity = proximity;

      this.graph[+n].css = {
        width: 150,
        height: 50,
        translate: {
          x: this.graph[+n].x * 200,
          y: this.graph[+n].y * 100
        }
      }

      return {
        name: n,
        x: this.graph[+n].x,
        y: this.graph[+n].y,
        process: this.graph[+n].process,
        fake: this.graph[+n].fake,
        proximity,
        css: this.graph[+n].css
      }
    });

    /** [8] Рисуем ребра */
    setTimeout(() => {
      drawEdges(edges, this.graph, fakes.pathMap, this.median, this.process);
    }, 500);

    console.log(this.graph)

    return {
      nodes,
      graph: this.graph
    };
  }
}
