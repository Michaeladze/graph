/** Рисуем ребра */
import { IEdge, IGraph, IPathMap } from './interfaces/interfaces';

export const drawEdges = (edges: IEdge[], graph: IGraph, paths: IPathMap, median: number, process: number[]) => {
  drawBoard();

  const svg = document.querySelector('.scene svg');
  if (svg) {

    const pathMap: IPathMap = { ...paths };
    spline(graph, pathMap, median, svg);
    // threePointsSpline(graph, pathMap, median, edges, process, svg);
  }
}

/** Рисуем сетку  */
function drawBoard() {
  const scene = document.querySelector('.scene');

  if (scene) {
    // SVG
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttributeNS(ns, 'id', `graph-svg`);
    svg.style.width = `1920px`;
    svg.style.height = `1200px`;

    // Marker
    const defs = document.createElementNS(ns, 'defs');
    const marker = document.createElementNS(ns, 'marker');
    marker.setAttribute('id', 'marker-arrow');
    marker.setAttribute('viewBox', '0 0 8 8');
    marker.setAttribute('refX', '6');
    marker.setAttribute('refY', '4');
    marker.setAttribute('markerUnits', 'strokeWidth');
    marker.setAttribute('markerWidth', '4');
    marker.setAttribute('markerHeight', '4');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('fill', '#888');
    const path = document.createElementNS(ns, 'path');
    marker.appendChild(path);
    path.setAttribute('d', 'M 0 0 L 8 4 L 0 8 z');
    defs.appendChild(marker);

    svg.appendChild(defs);
    scene.appendChild(svg);
  }
}

/** Сплайн по всем точкам */
function spline(graph: IGraph, pathMap: IPathMap, median: number, svg: Element) {
  for (const key in pathMap) {
    const [from, to] = key.split('=>');
    let coords: number[][] = [[graph[+from].x, graph[+from].y]];

    const paths: number[] = Array.from(pathMap[key]);

    for (let i: number = 0; i < paths.length; i++) {
      if (paths[i] === +from || paths[i] === +to) {
        continue;
      }
      coords.push([graph[paths[i]].x, graph[paths[i]].y]);
    }

    coords.push([graph[+to].x, graph[+to].y]);
    drawPath(coords, key, svg);
  }
}

/** Отрисовка SVG Path */
function drawPath(coords: number[][], id: string, svg: Element) {

  let d: string = '';
  const w: number = 200;
  const h: number = 100;

  for (let i: number = 0; i < coords.length - 1; i++) {
    if (i === 0) {
      d += `M ${coords[i][0] * w + 150 / 2} ${coords[i][1] * h + 50 / 2} `
    } else if (i === 1) {
      d += `Q ${coords[i][0] * w + 150 / 2} ${coords[i][1] * h + 50 / 2} ${coords[i + 1][0] * w + 150 / 2} ${coords[i + 1][1] * h + 50 / 2}`
    } else {
      d += `T ${coords[i + 1][0] * w + 150 / 2} ${coords[i + 1][1] * h + 50 / 2} `
    }
  }

  const ns = 'http://www.w3.org/2000/svg';

  const line = document.createElementNS(ns, 'path');
  line.classList.add(id);
  line.setAttributeNS(null, 'id', id);
  line.setAttributeNS(null, 'd', d);
  line.setAttributeNS(null, 'stroke', '#88888880');
  line.setAttributeNS(null, 'stroke-width', '1');
  line.setAttributeNS(null, 'fill', 'transparent');
  line.setAttributeNS(null, 'marker-end', 'url(#marker-arrow)');
  svg.appendChild(line);
}

/** Сплайн по трем точкам */
// function threePointsSpline(graph: IGraph, pathMap: IPathMap, median: number, edges: IEdge[], process: number[], svg: Element) {
//   /** Таблица с координатами третьей точки на каждом из путей */
//   const thirdPoint: IMap<{ x: number; y: number; proximity: number }> = {};
//
//   /** Если длина пути больше 1, то находим среднюю точку по Y и максимальную по X */
//   for (const path in pathMap) {
//
//     /** Убираем из пути првый и последний узлы, если они там есть */
//     const [from, to]: string[] = path.split('=>');
//     if (pathMap[from]) {
//       delete pathMap[from];
//     }
//
//     let proximity: number = 0;
//     let accY: number = 0;
//     let maxX: number = median;
//     let decreaseSize: number = 0;
//
//     pathMap[path].forEach((node: number) => {
//       if (node === +from || node === +to) {
//         decreaseSize++;
//       }
//       if (node !== +from && node !== +to) {
//         accY += graph[node].y;
//         proximity += graph[node].proximity || 0
//
//         let dx: number = 0;
//         if (graph[node].x - median > 0) {
//           dx = 0.25;
//         } else if (graph[node].x - median < 0) {
//           dx = -0.25;
//         }
//
//         maxX = pathMap[path].size > 1 ?
//           graph[node].x - median > 0 ? Math.max(graph[node].x, maxX) : Math.min(graph[node].x, maxX) : graph[node].x;
//         maxX += dx;
//       }
//     });
//
//     thirdPoint[path] = {
//       x: maxX,
//       y: accY / (pathMap[path].size - decreaseSize),
//       proximity: proximity / (pathMap[path].size - decreaseSize)
//     };
//   }
//   console.log(thirdPoint)
//
//   /** Проходим по thirdPoint и строим path по трем точкам  */
//   for (const key in thirdPoint) {
//     const [from, to]: string[] = key.split('=>');
//
//     const s = graph[+from];
//     const m = thirdPoint[key];
//     const e = graph[+to];
//
//     const w: number = +s.css.width / 2;
//     const h: number = +s.css.height / 2;
//     const deltaX: number = m.proximity * (-w / 2);
//
//     /** Прямые линии */
//     // const d = `M${s.css.translate.x + w} ${s.css.translate.y + h}
//     //            L ${m.x * 200 + w} ${m.y * 100 + h}
//     //            L ${e.css.translate.x + w} ${e.css.translate.y + h}`;
//
//     /** Квадратичная функция */
//     // const d = `M${s.css.translate.x + w} ${s.css.translate.y + h}
//     //            Q ${m.x * 200 + w} ${m.y * 100 + h} ${e.css.translate.x + w} ${e.css.translate.y + h}`;
//
//     /** Кубическая функция */
//     const d = `M${s.css.translate.x + w} ${s.css.translate.y + h}
//                  C ${m.x * 200 + w + deltaX} ${m.y * 100 + h} ${m.x * 200 + w + deltaX} ${m.y * 110 + h} ${e.css.translate.x + w} ${e.css.translate.y + h}`;
//
//     const id = `${from}=>${to}`;
//     drawPath(d, id, svg);
//   }
//
//   edges.forEach((edge: IEdge) => {
//
//     const processPath: string = process.join('=>');
//     const id = `${edge.from}=>${edge.to}`;
//
//     if (processPath.indexOf(id) >= 0) {
//       const s = graph[edge.from];
//       const e = graph[edge.to];
//
//
//       const d = `M${s.css.translate.x + s.css.width / 2} ${s.css.translate.y + s.css.height / 2}
//                  L ${e.css.translate.x + e.css.width / 2} ${e.css.translate.y + e.css.height / 2}`
//
//       drawPath(d, id, svg);
//     }
//   })
// }
