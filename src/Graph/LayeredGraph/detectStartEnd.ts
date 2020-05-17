import { IGraph, INode } from './interfaces/interfaces';
/*  бежим по нодам находим type  и складываем начало и конец в массив results  также продолжаем
 *   размечать граф добавлея конечный и начальный узел в его структуре
 * */
export const detectStartEnd = (nodes: INode[], graph: IGraph): number[] => {
  const result: number[] = [];

  for (let i: number = 0; i < nodes.length; i++) {
    if (nodes[i].type?.toLowerCase() === 'start') {
      result[0] = i;
      graph[i].type = 'start';
    }

    if (nodes[i].type?.toLowerCase() === 'end') {
      result[1] = i;
      graph[i].type = 'end';
    }

    if (result.length === 2) {
      break;
    }
  }

  return result;
};
