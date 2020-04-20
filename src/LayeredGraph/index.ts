import { IBalanceResult, IEdge, IFakeResult, IGraph, IGraphData, IMatrix } from './interfaces/interfaces';
import { createGraph } from './createGraph';
import { ranking } from './ranking';
import { ordering } from './ordering';
import { insertFakeNodes } from './insertFakeNodes';
import { balancing } from './balancing';
import { crossingMinimization } from './crossingMinimization';
import { shrink } from './shrink';
import { drawEdges } from './drawEdges';
import { shrinkFakeNodes } from './shrinkFakeNodes';
import { detectStartEnd } from './detectStartEnd';
import { insertMetrics } from './insertMetrics';

export class LayeredGraph {
  /** Граф */
  public graph: IGraph = {};
  /** Матрица */
  public matrix: IMatrix = [];
  /** Медиана */
  public median: number = 0;
  /** Процесс */
  public process: number[] = [];
  /** Начало процесса */
  public start: number = -1;
  /** Конец процесса */
  public end: number = -1;

  constructor(public data: IGraphData) {
  }

  /** Инициализируем граф */
  public init(): any {
    console.log(this.data);

    /** [1] Создаем структуру графа */
    this.graph = createGraph(this.data);

    /** Определяем стартовую и конечную координаты */
    const startEnd: number[] = detectStartEnd(this.data.nodes, this.graph);
    this.start = startEnd[0];
    this.end = startEnd[1];

    this.process = [this.start, ...this.data.paths[0].path, this.end];

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

    /** Вставляем в фейковые узлы количество переходов */
    insertMetrics(this.graph, this.data.edges, fakes.pathMap);

    /** Создаем массив узлов с координатами */
    const nodes: any = Object.keys(this.graph).map((n: string) => {
      this.graph[+n].css = {
        width: 176,
        height: 48,
        translate: {
          x: this.graph[+n].x * 220,
          y: this.graph[+n].y * 98
        }
      }

      return {
        name: n,
        node: this.data.nodes[+n],
        x: this.graph[+n].x,
        y: this.graph[+n].y,
        process: this.graph[+n].process,
        fake: this.graph[+n].fake,
        css: this.graph[+n].css,
        count: this.graph[+n].count
      }
    });

    /** Сжимаем фейковые узлы */
    shrinkFakeNodes(this.graph, this.matrix, this.median);

    /** [8] Рисуем ребра */
    setTimeout(() => {
      drawEdges(edges, this.graph, fakes.pathMap, this.process);
    }, 500);

    console.log(this.graph)

    return {
      nodes,
      graph: this.graph
    };
  }
}
