import { IGraph, IGraphData, INode, INodeElement, INodeMetrics, IRect } from './interfaces/interfaces';

/** Создаем массив узлов с координатами
 * @param graph - граф
 * @param data - данные графа
 * @param rect - базовые размеры узлов
 */
export const createNodes = (graph: IGraph, data: IGraphData, rect: IRect): INodeElement[] => {
  /** Медиана зацикленности */
  const c: number[] = data.nodes.reduce((acc: number[], n: INode) => {
    if (n.metrics) {
      acc.push(+n.metrics.cycling);
    }
    return acc;
  }, []);
  c.sort();
  const mCycling: number = c[Math.floor(c.length / 2)];

  const keys: string[] = Object.keys(graph);

  // /** Gap в зависимости от среднего количества родственников */
  // let avgRelativesCount: number = 0;
  // keys.forEach((n: string) => {
  //   avgRelativesCount += [...graph[+n].children, ...graph[+n].parents].length;
  // })
  // avgRelativesCount = Math.floor(avgRelativesCount / keys.length);

  return keys.map((n: string) => {
    graph[+n].css = {
      width: graph[+n].css.width || rect.width,
      height: graph[+n].css.height || rect.height,
      translate: {
        x: graph[+n].css.translate?.x || graph[+n].x * (rect.width + rect.gap),
        y: graph[+n].css.translate?.y || graph[+n].y * (rect.height + rect.gap)
      }
    };

    let isCyclingOk: boolean = true;
    if (data.nodes[+n] && data.nodes[+n].metrics) {
      isCyclingOk = (data.nodes[+n].metrics as INodeMetrics).cycling < mCycling + 0.1 * mCycling;
    }

    return {
      name: n,
      node: data.nodes[+n],
      x: graph[+n].x,
      y: graph[+n].y,
      process: graph[+n].isProcess,
      fake: graph[+n].fake,
      css: graph[+n].css,
      isCyclingOk
    };
  });
};
