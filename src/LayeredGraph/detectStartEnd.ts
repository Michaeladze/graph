import { IGraph, INode } from './interfaces/interfaces';

export const detectStartEnd = (nodes: INode[], graph: IGraph): number[] => {
  let start: number = -1;
  let end: number = -1;
  nodes.forEach((n: INode, i: number) => {
    if (n.type?.toLocaleLowerCase() === 'start') {
      start = i;
      graph[i].type = 'start';
    }

    if (n.type?.toLocaleLowerCase() === 'end') {
      end = i;
      graph[i].type = 'end';
    }
  });

  return [start, end];
};
