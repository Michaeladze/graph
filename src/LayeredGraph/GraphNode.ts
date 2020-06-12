import { IGraphNode } from './interfaces/interfaces';

export class GraphNode implements IGraphNode {

  public children: number[] = [];
  public x: number = 0;
  public y: number = 0;
  public parents: number[] = [];
  public isProcess: 1 | 0 = 0;
  public processSibling: number = 0;
  public fake: number = 0;
  public css: any = {};

  constructor(public id: number) {
  }
}
