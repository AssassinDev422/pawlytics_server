const socketTestEnv = require('../baseline-server-node/testing/SocketTest.js');

socketTestEnv.testSocketsAsList([
  {
    handler: 'create org',
    data: {name: 'excelente inc lol', Address: {address1: "street"}}
  },
  {
    handler: 'update my org address',
    data: {address1: 'updated man excelente inc'}
  },
  {
    handler: 'update my org address',
    data: {} 
  },
  {
    handler: 'get all orgs',
  },
  {
    handler: 'get my org employees',
  },
  {
    handler: 'get org employees',
    data: '3',
  },

])

