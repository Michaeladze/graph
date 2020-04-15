/** Рисуем ребра */
import { IEdge, IGraph } from './interfaces/interfaces';

export const drawEdges = (edges: IEdge[], graph: IGraph) => {
  drawBoard();

  const svg = document.querySelector('.scene svg');
  if (svg) {
    edges.forEach((edge: IEdge) => {
      const ns = 'http://www.w3.org/2000/svg';
      const id = `${edge.from}=>${edge.to}`;

      const s = graph[edge.from];
      const e = graph[edge.to];


      const d = `M${s.css.translate.x + s.css.width / 2} ${s.css.translate.y + s.css.height / 2} 
                 L ${e.css.translate.x + e.css.width / 2} ${e.css.translate.y + e.css.height / 2}`

      const line = document.createElementNS(ns, 'path');
      line.classList.add(id);
      line.setAttributeNS(null, 'id', id);
      line.setAttributeNS(null, 'd', d);
      line.setAttributeNS(null, 'stroke', '#888');
      line.setAttributeNS(null, 'stroke-width', '1');
      line.setAttributeNS(null, 'fill', 'transparent');
      line.setAttributeNS(null, 'marker-end', 'url(#marker-arrow)');
      svg.appendChild(line);
    })
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
