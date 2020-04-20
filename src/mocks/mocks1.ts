export default {
  nodes: [
    {
      name: '[START]',
      type: 'start'
    },
    {
      name: '[END]',
      type: 'end'
    },
    {
      name: '2'
    },
    {
      name: '3'
    },
    {
      name: '4'
    },
    {
      name: '5'
    },
    {
      name: '6'
    },
    {
      name: '7'
    }
  ],
  edges: [
    {
      from: 0,
      to: 2
    },
    {
      from: 2,
      to: 3
    },
    {
      from: 3,
      to: 4
    },
    {
      from: 4,
      to: 1
    },
    {
      from: 3,
      to: 5
    },
    {
      from: 2,
      to: 4
    },
    {
      from: 0,
      to: 4
    }
  ],
  paths: [
    {
      path: [2, 3, 4],
      count: 88
    }
  ]
}
