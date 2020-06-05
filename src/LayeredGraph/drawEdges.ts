import intersect from 'path-intersection';
/** Рисуем ребра */
import {
  IColors,
  IConfig,
  IEdge,
  IGraph,
  IGraphNode,
  ILines,
  IMap,
  INodeMetrics,
  IPathMap,
  IRect
} from './interfaces/interfaces';
import * as d3 from 'd3';

type FourNumber = [number, number, number, number];

interface ICoordsResult {
  points: IMap<[number, number][]>;
  metricsCoords: FourNumber[];
}

export const drawEdges = (
  edges: IEdge[],
  graph: IGraph,
  pathMap: IPathMap,
  process: number[],
  scene: HTMLDivElement,
  sceneSvg: SVGSVGElement,
  config: IConfig
): ILines => {
  /** Таблица путей для константного доступа */
  const lines: ILines = {};

  if (scene) {
    let style: string | null = '';

    /** Ищем на сцене svg и метрики и удаляем его, чтобы при повторном рендере svg не наложились друг на друга */
    if (sceneSvg) {
      /** Сохраняем стили трансформации, которые были на элементе g перед перерисовкой */
      if (sceneSvg.firstElementChild) {
        style = (sceneSvg.firstElementChild as SVGGElement).getAttribute('style');
      }

      while (sceneSvg.firstElementChild) {
        sceneSvg.removeChild(sceneSvg.firstElementChild);
      }
    }

    const metricsElement = scene.querySelector('.scene__metrics');
    metricsElement && scene.removeChild(metricsElement);

    /** Определяем максимальную координату X для определения ширины сцены */
    let maxX: number = Number.MIN_SAFE_INTEGER;
    /** Определяем максимальную координату Y для определения высоты сцены */
    let maxY: number = Number.MIN_SAFE_INTEGER;

    Object.values(graph).forEach((v: IGraphNode) => {
      maxX = Math.max(maxX, v.css.translate.x);
      maxY = Math.max(maxY, v.css.translate.y);
    });

    /** Отступ от правого края экрана */
    const paddingRight: number = 20;

    maxX = Math.max(maxX + paddingRight + config.rect.width, scene.scrollWidth);
    maxY = Math.max(maxY + paddingRight, scene.scrollHeight);

    // const layer = scene.firstElementChild;
    const svg = d3.select(sceneSvg).append('g');
    svg.attr('width', maxX).attr('height', maxY);
    if (style) {
      (sceneSvg.firstElementChild as SVGGElement).setAttribute('style', style);
    }

    const { points, metricsCoords }: ICoordsResult = getCoords(graph, pathMap, edges, config.rect);

    for (const path in points) {
      let coords: [number, number][] = points[path];

      /** ID узла, куда приходит линия */
      const [from, to]: string[] = path.split('=>');

      /** Функция кривой */
      const curve = from === to ? d3.curveBasis : d3.curveMonotoneY;

      /** Кривая Безье */
      const l = d3
        .line()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(curve);

      /** Флаг процесса  */
      const isProcess: boolean =
        from !== to && process.map((n: number, i: number) => `${n}=>${process[i + 1]}`).includes(path);

      /** Линия неактвина */
      let disabled: boolean = false;

      /** Ребро */
      const edge: IEdge | undefined = edges.find((e: IEdge) => e.from === +from && e.to === +to);
      if (edge && edge.status && edge.status === 'disabled') {
        disabled = true;
      }

      /** Путь */
      const d: string = l(coords) || '';

      /** Рисуем в этом узле SVG Path размером с узел */
      const toPath: SVGPathElement = appendOverlayRect(graph, +to, svg) as SVGPathElement;

      /** Ищем пересечения пути ребра и пути узла */
      const intersection = intersect(d, toPath.getAttribute('d') as string);

      if (intersection.length > 0) {
        /** Удаляем последние координаты (координаы узла) */
        coords.pop();
        /** Добавляем координаты точки пересечения */
        coords.push([intersection[0].x, intersection[0].y]);

        /** Заново отрисовываем линию */
        const line = drawPath(svg, l(coords), path, isProcess, disabled, config.colors);
        lines[path] = {
          line,
          disabled,
          color: {
            default: disabled ? config.colors.disabled : config.colors.primary,
            hover: config.colors.hover
          },
          marker: {
            default: disabled ? config.markers.disabled : config.markers.primary,
            hover: config.markers.hover
          }
        };
      }
    }

    /** Создаем стрелки */
    createMarker(svg, config.colors.primary, config.markers.primary);
    createMarker(svg, config.colors.disabled, config.markers.disabled);
    createMarker(svg, config.colors.hover, config.markers.hover);
    /** Вставляем метрики */
    insertMetrics(metricsCoords, edges, scene);
  }

  return lines;
};

/** Считаем координаты */
function getCoords(graph: IGraph, pathMap: IPathMap, edges: IEdge[], rect: IRect): ICoordsResult {
  let coords: IMap<[number, number][]> = {};

  /** Массив координат для метрик */
  const metricsCoords: FourNumber[] = [];

  /** Обработка длинных путей между реальными и фейковыми узлами */
  for (const key in pathMap) {
    const [from, to] = key.split('=>');
    coords[key] = [];
    coords[key].push(calculateCoords(graph[+from]));

    const paths: number[] = Array.from(pathMap[key]);
    /** Координата метрики уже добавлена */
    let metricInserted: boolean = false;

    for (let i: number = 0; i < paths.length; i++) {
      const curr: number = paths[i];

      /** From Node */
      const fn: IGraphNode = graph[+from];
      /** To Node */
      const tn: IGraphNode = graph[+to];
      /** Current Node */
      const cn: IGraphNode = graph[curr];

      if (curr === +from || curr === +to) {
        continue;
      }

      /** Условие, при котором при движении узла промежуточные виртуальные узлы будут исключаться, чтобы
       * не было острых углов и загибов ребер */
      const bendCondition: boolean =
        (cn.css.translate.y < fn.css.translate.y && cn.y > fn.y) ||
        (cn.css.translate.y > fn.css.translate.y && cn.y < fn.y) ||
        (cn.css.translate.y - rect.height < tn.css.translate.y && cn.y > tn.y) ||
        (cn.css.translate.y + rect.height > tn.css.translate.y && cn.y < tn.y);

      if (bendCondition) {
        continue;
      }

      const c: [number, number] = calculateCoords(cn);
      if (!metricInserted) {
        metricsCoords.push([c[0], c[1], +from, +to]);
        metricInserted = true;
      }
      coords[key].push(c);
    }

    coords[key].push(calculateCoords(graph[+to]));
  }

  /** Обработка коротких путей между реальными узлами. Обрабатывается отдельно, потому что в путях нет
   * коротких ребер. */
  edges.forEach((edge: IEdge) => {
    const id: string = `${edge.from}=>${edge.to}`;
    /** Если есть обратный id, это значит, что ребра наложатся друг на друга. Следовательно,\
     * нужно добавить третью точку немного в стороне, чтобы одно из ребер ушло в бок */
    const reverseId: string = `${edge.to}=>${edge.from}`;

    if (coords[id] === undefined && !graph[edge.from].fake && !graph[edge.to].fake) {
      /** Первая точка */
      const first: [number, number] = calculateCoords(graph[edge.from]);
      /** Последняя точка */
      const last: [number, number] = calculateCoords(graph[edge.to]);

      /** Отступ по X от схожей линии */
      let deltaX: number = 0;
      /** Отступ по Y от схожей линии */
      let deltaY: number = 0;
      /** Промежуточная точка. Она же является координатой для количества переходов (метрики) */
      let mid: [number, number];

      /** Проверяем, есть ли ребро с такими же координатами */
      if (coords[reverseId]) {
        deltaX = 35;
      }

      /** Если from и to это одна и та же точка, то создаем петлю в правом верхнем углу */
      if (edge.from === edge.to) {
        deltaX = 10;
        deltaY = 10;

        first[0] += rect.width / 2;
        first[1] -= rect.height / 2;
        /** X второй точки сдвигаем влево, чтобы стрелка не наложилась на ребро */
        last[0] += rect.width / 2 - deltaX;
        last[1] -= rect.height / 2;

        /** Переопределяем для правильного расчета mid точки */
        deltaX -= deltaX / 2;
      }

      mid = [(first[0] + last[0]) / 2 + deltaX, (first[1] + last[1]) / 2 - deltaY];
      metricsCoords.push([mid[0], mid[1], edge.from, edge.to]);
      coords[id] = [first, mid, last];
    }
  });

  return {
    points: coords,
    metricsCoords
  };
}

/** Пересчет координаты */
function calculateCoords(node: IGraphNode): [number, number] {
  return [node.css.translate.x + node.css.width / 2, node.css.translate.y + node.css.height / 2];
}

/** Добавляем подложки под узлы, чтобы считать пересечения с ребрами */
function appendOverlayRect(graph: IGraph, node: number, svg: any): SVGPathElement {
  const c: IGraphNode = graph[node];

  /** Radius = 8. Разница в 2, чтобы кончик стрелки не затуплялся */
  const d: string = `M ${c.css.translate.x + 7} ${c.css.translate.y - 2} h ${c.css.width - 14}
    a8,8 0 0 1 8,8 v ${c.css.height - 12.5} 
    a8,8 0 0 1 -8,8 H ${c.css.translate.x + 7} 
    a8,8 0 0 1 -8,-8 V ${c.css.translate.y + 6} 
    a8,8 0 0 1 8,-8 z`;

  // `M ${c.css.translate.x} ${c.css.translate.y} h ${c.css.width} v ${c.css.height}
  //         H ${c.css.translate.x} Z`

  const path = svg
    .append('path')
    .attr('d', d)
    .attr('id', `rect-${node}`)
    .style('stroke', 'transparent')
    .style('fill', 'transparent')
    .style('stroke-width', '1px');

  return path._groups[0][0];
}

/** Создать маркер */
function createMarker(svg: any, color: string, id: string) {
  svg
    .append('defs')
    .append('marker')
    .attr('id', id)
    .attr('viewBox', '0 0 5 5')
    .attr('refX', '4')
    .attr('refY', '2.5')
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', '5')
    .attr('markerHeight', '5')
    .attr('orient', 'auto')
    .attr('fill', color)
    .append('path')
    .attr('d', 'M 0 0 L 5 2.5 L 0 5 z')
    .append('path');
}

/** Вставляем метрики */
function insertMetrics(metricsCoords: FourNumber[], edges: IEdge[], scene: HTMLDivElement) {
  /** Создаем блок с метриками */
  const metricsElement: HTMLDivElement = document.createElement('div');
  metricsElement.classList.add('scene__metrics');

  /** Таблица для O(1) поиска */
  const map: IMap<number> = edges.reduce((acc: IMap<number>, edge: IEdge, i: number) => {
    const id: string = `${edge.from}=>${edge.to}`;
    if (acc[id] === undefined) {
      acc[id] = i;
    }
    return acc;
  }, {});

  metricsCoords.forEach((m: FourNumber) => {
    /** Ищем нужное ребром from-to в массиве edges */
    const index: number = map[`${m[2]}=>${m[3]}`]; // edges.findIndex((e: IEdge) => e.from === m[2] && e.to === m[3]);
    const count: number | undefined = edges[index].metrics ? +(edges[index].metrics as INodeMetrics).count : undefined;

    if (count) {
      const disabledClass: string =
        edges[index].status && edges[index].status === 'disabled' ? 'graph__edge-count--disabled' : '';

      const p: HTMLParagraphElement = document.createElement('p');
      p.classList.add('graph__edge-count');
      disabledClass && p.classList.add(disabledClass);
      p.textContent = `${count}`;
      p.style.transform = `translate(${m[0]}px, ${m[1]}px)`;
      metricsElement.appendChild(p);
    }
    // svg
    //   .append('text')
    //   .attr(
    //     'class',
    //     `graph__edge-count
    //   ${edges[index].status && edges[index].status === 'disabled' ? 'graph__edge-count--disabled' : ''}`
    //   )
    //   .attr('x', m[0] + 2) // + 2px, чтобы не налезало на линию
    //   .attr('y', m[1])
    //   .text(count);
  });

  scene.appendChild(metricsElement);
}

/** Отрисовка линии */
function drawPath(
  svg: any,
  lineGenerator: string | null,
  id: string,
  isProcess: boolean,
  disabled: boolean,
  colors: IColors
): SVGPathElement {
  const path = svg
    .append('path')
    // @ts-ignore
    .attr('id', id)
    .attr('d', lineGenerator)
    .style('fill', 'none')
    .style('stroke', disabled ? colors.disabled : colors.primary)
    .style('stroke-width', isProcess ? '3px' : '1px')
    .attr('marker-end', `url(#${disabled ? 'marker-arrow--disabled' : 'marker-arrow'})`);

  return path._groups[0][0];
}
