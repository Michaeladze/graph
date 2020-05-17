import { IGraph, INumberMap } from './interfaces/interfaces';

/** Расставляем processSibling у узлов. 0 - процесс. Чем больше значение, тем дальше от процесса находится узел
 * @param process - последовательность узлов
 * @param graph - граф
 * */
export const connectedness = (process: IGraph, graph: IGraph) => {
  const visited: INumberMap<INumberMap<boolean>> = {};

  const dfs = (node: number, parent: number | null) => {
    if (!visited[node]) {
      visited[node] = {};
    }

    if (parent !== null) {
      visited[node][parent] = true;

      if (process[node] && !process[parent]) {
        graph[parent].processSibling = 1;
      }

      if (!process[node] && process[parent]) {
        graph[node].processSibling = 1;
      }

      if (!process[node] && !process[parent]) {
        graph[node].processSibling = graph[parent].processSibling + 1;
      }
    }

    graph[node].children.forEach((n: number) => {
      if (!visited[n]) {
        visited[n] = {};
      }

      if (!graph[n].processSibling && !visited[n][node]) {
        dfs(n, node);
      }
    });
  };

  Object.keys(graph).forEach((n: string) => {
    dfs(+n, null);
  });
};
