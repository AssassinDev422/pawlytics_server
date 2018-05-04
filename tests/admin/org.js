const socketTestEnv = require('../../baseline-server-node/testing/SocketTest.js');

socketTestEnv.testSocketsAsList([
  {
    handler: 'create org',
    data: {name: 'excelente inc2', Address: {address1: "street"}}
  },
  {
    handler: 'get all orgs',
  },

])

