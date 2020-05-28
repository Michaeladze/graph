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
  INodeElement,
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
  /** SVG Сцена */
  public sceneSvg: SVGSVGElement | null = null;
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

  /** Перемещенные узлы */
  private movedNodes: number[] = [];
  /** Состояние графа для восстановление вида */
  private initialGraph: IGraph = {};

  constructor(public data: IGraphData) {
  }

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
    this.matrix = ranking(this.data, this.graph, this.process, this.end);

    /** [4] Распределяем узлы по горизонтали */
    this.matrix = ordering(this.graph, this.matrix, this.end);

    /** [5] Вставляем фейковые узлы */
    const fakes: IFakeResult = insertFakeNodes(this.edges, this.graph, this.matrix, this.process);
    this.pathMap = fakes.pathMap;

    /** [6] Балансировка */
    const balance: IBalanceResult = balancing(this.process, this.graph, this.matrix);
    this.median = balance.median;
    this.matrix = balance.matrix;

    /** [8] Убираем гэпы */
    const tfn = translateFakeNodes(this.graph, this.median, this.rect, this.pathMap);
    this.median = tfn.median;

    /** [9] Создаем массив узлов с координатами */
    const nodes: INodeElement[] = createNodes(this.graph, this.data, this.rect);

    /** [10] Сжимаем фейковые узлы */
    shrinkFakeNodes(tfn.paths, this.rect, this.graph, this.median);

    /** [11] Убираем пустые ячейки слева */
    stickToLeft(this.graph);

    /** [12] Копируем состояние графа для восстановления вида */
    this.initialGraph = JSON.parse(JSON.stringify(this.graph));

    console.log('%c Данные', 'color: #6ff9ff');
    console.log(this.data);
    console.log('%c -------------------', 'color: #6ff9ff');

    console.log('%c Граф', 'color: #98ee99');
    console.log(this.graph);
    console.log('%c -------------------', 'color: #98ee99');

    return {
      nodes,
      graph: this.graph
    };
  }

  /** [12] Рисуем ребра */
  public drawEdges(scene: HTMLDivElement, sceneSvg: SVGSVGElement): ILines {
    this.scene = scene;
    this.sceneSvg = sceneSvg;
    return drawEdges(this.data.edges, this.graph, this.pathMap, this.process, this.scene, this.sceneSvg, this.config);
  }

  /** Перерисовка смежных ребер при перемещении узла */
  public moveNode(id: number, x: number, y: number): ILines {
    this.graph[id].css.translate.x = x;
    this.graph[id].css.translate.y = y;

    const index: number = this.movedNodes.findIndex((n: number) => n === id);
    if (index < 0) {
      this.movedNodes.push(id);
    }

    if (this.scene && this.sceneSvg) {
      return drawEdges(this.data.edges, this.graph, this.pathMap, this.process, this.scene, this.sceneSvg, this.config);
    }

    return {};
  }

  /** Восстановить вид */
  public reset(): ILines {
    this.movedNodes.forEach((n: number) => {
      const node: HTMLElement | null = document.getElementById(`${n}`);
      if (node) {
        this.graph[n].css.translate.x = this.initialGraph[n].css.translate.x;
        this.graph[n].css.translate.y = this.initialGraph[n].css.translate.y;
        node.style.transform = `translate(${this.graph[n].css.translate.x}px, ${this.graph[n].css.translate.y}px)`;
      }
    });

    this.movedNodes = [];

    return drawEdges(this.data.edges, this.initialGraph, this.pathMap, this.process,
      this.scene as HTMLDivElement, this.sceneSvg as SVGSVGElement, this.config)
  }
}
