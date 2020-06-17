export default {
  nodes: [
    { name: '[START]', type: 'start' },
    { name: '[END]', type: 'end' },
    { name: 'Node 2' },
    { name: 'Node 3' },
    { name: 'Node 4' },
    { name: 'Node 5' },
  ],
  edges: [
    { from: 0, to: 2 },
    { from: 2, to: 1 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 3 },
    { from: 3, to: 5 },
    { from: 4, to: 5 },
    { from: 5, to: 3 },
    { from: 5, to: 4 },
    { from: 5, to: 2 },
    { from: 2, to: 5 },
  ],
  paths: [
    {
      path: [2]
    }
  ]
};
