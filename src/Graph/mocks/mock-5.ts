export default {
  nodes: [
    { name: '[START]', type: 'start' },
    { name: 'Node 1' },
    { name: 'Node 2' },
    { name: 'Node 3' },
    { name: 'Node 4' },
    { name: 'Node 5' },
    { name: 'Node 6' },
    { name: 'Node 7' },
    { name: 'Node 8' },
    { name: '[END]', type: 'end' }
  ],
  edges: [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 8 },

    { from: 1, to: 8 },
    { from: 8, to: 1 },
    { from: 8, to: 9 },
    { from: 1, to: 4 },
    { from: 2, to: 9 },
    { from: 2, to: 5 },
    { from: 2, to: 8 },
    { from: 5, to: 1 },
    { from: 6, to: 1 },
    { from: 5, to: 6 },
    { from: 4, to: 6 },
    { from: 1, to: 7 }
    // { from: 8, to: 9 },
  ],
  paths: [
    {
      path: [1, 2, 3, 8]
    }
  ]
};
