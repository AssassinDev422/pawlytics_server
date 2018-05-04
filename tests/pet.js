const socketTestEnv = require('../baseline-server-node/testing/SocketTest.js');

socketTestEnv.testSocketsAsList([
  {
    handler: 'create pet',
    data: {name: 'cool pet'}
  },
  {
    handler: 'get my org pets',
    data: {name: 'cool pet'}
  },
  {
    handler: 'update current pet',
    data: {foodBrand: "jerky"},
  },
  {
    handler: 'all pet breeds',
    data: {name: 'cool pet'}
  },
  {
    handler: 'all pet species',
    data: {name: 'cool pet'}
  },
])

