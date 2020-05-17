import {
  IBalanceResult,
  IColors,
  IConfig,
  IEdge,
  IFakeResult,
  IGraph,
  IGraphData,
  IGraphResult,
  ILines,
  IMarkers,
  IMatrix,
  IPathMap,
  IRect
} from './interfaces/interfaces';
import { createGraph } from './createGraph';
import { ranking } from './ranking';
import { ordering } from './ordering';
import { insertFakeNodes } from './insertFakeNodes';
import { balancing } from './balancing';

import { drawEdges } from './drawEdges';
import { translateFakeNodes } from './translateFakeNodes';
import { detectStartEnd } from './detectStartEnd';
import { createNodes } from './createNodes';
import { stickToLeft } from './stickToLeft';
import { rearrangeMatrix } from './rearrangeMatrix';
import { shrinkFakeNodes } from './shrinkFakeNodes';

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
  /** Сцена */
  public scene: HTMLDivElement | null = null;
  /** Таблица путей */
  public pathMap: IPathMap = {};
  /** Ребра */
  public edges: IEdge[] = [];

  /** Стандартные размеры блоков */
  public rect: IRect = {
    width: 176,
    height: 46,
    gap: 50,
    fakeWidth: 20
  };

  /** Цветовое оформление */
  public colors: IColors = {
    primary: '#A5BFDD',
    hover: '#2E89BA',
    disabled: '#E5E5E5'
  };

  /** Маркеры */
  public markers: IMarkers = {
    primary: 'marker-arrow',
    hover: 'marker-arrow--hover',
    disabled: 'marker-arrow--disabled'
  };

  /** Конфиг визуалки */
  public config: IConfig = {
    rect: this.rect,
    colors: this.colors,
    markers: this.markers
  };

  constructor(public data: IGraphData) {}

  /** Инициализируем граф */
  public init(): IGraphResult {
    if (this.data.paths.length === 0) {
      return {
        nodes: [],
        graph: {}
      };
    }

    /** [1] Создаем структуру графа */
    this.graph = createGraph(this.data);

    /** [2] Определяем стартовую и конечную координаты */
    const startEnd: number[] = detectStartEnd(this.data.nodes, this.graph);
    this.start = startEnd[0];
    this.end = startEnd[1];

    this.process = [this.start, ...this.data.paths[0].path, this.end];
    this.edges = [...this.data.edges];

    /** [3] Распределяем узлы по вертикали */
    this.matrix = ranking(this.data, this.graph, this.process);

    /** [4] Распределяем узлы по горизонтали */
    this.matrix = ordering(this.graph, this.matrix, this.end);

    /** [5] Вставляем фейковые узлы */
    const fakes: IFakeResult = insertFakeNodes(this.edges, this.graph, this.matrix, this.process);
    this.pathMap = fakes.pathMap;
    this.matrix = rearrangeMatrix(this.graph);

    /** [6] Балансировка */
    const balance: IBalanceResult = balancing(this.process, this.graph, this.matrix);
    this.median = balance.median;
    this.matrix = balance.matrix;

    /** [7] Уменьшаем количество пересечений */
    // this.matrix = crossingMinimization(this.graph, this.matrix, this.median);

    /** [8] Убираем гэпы */
    const tfn = translateFakeNodes(this.graph, this.median, this.rect, this.pathMap);
    this.median = tfn.median;

    /** [9] Создаем массив узлов с координатами */
    const nodes: any = createNodes(this.graph, this.data, this.rect);

    /** [10] Сжимаем фейковые узлы */
    shrinkFakeNodes(tfn.paths, this.rect, this.graph, this.median);

    /** [11] Убираем пустые ячейки слева */
    stickToLeft(this.graph);

    this.matrix = rearrangeMatrix(this.graph);

    console.log('%c Данные', 'color: #6ff9ff');
    console.log(this.data);
    console.log('%c -------------------', 'color: #6ff9ff');

    console.log('%c Граф', 'color: #98ee99');
    console.log(this.graph);
    console.log('%c -------------------', 'color: #98ee99');

    console.log('%c Матрица', 'color: #ffe54c');
    console.log(this.matrix);
    console.log('%c -------------------', 'color: #ffe54c');

    return {
      nodes,
      graph: this.graph
    };
  }

  /** [11] Рисуем ребра */
  public drawEdges(scene: HTMLDivElement): ILines {
    this.scene = scene;
    return drawEdges(this.data.edges, this.graph, this.pathMap, this.process, this.scene, this.config);
  }

  /** Перерисовка смежных ребер при перемещении узла */
  public moveNode(id: number, x: number, y: number): ILines {
    this.graph[id].css.translate.x = x;
    this.graph[id].css.translate.y = y;
    if (this.scene) {
      return drawEdges(this.data.edges, this.graph, this.pathMap, this.process, this.scene, this.config);
    }

    return {};
  }
}
