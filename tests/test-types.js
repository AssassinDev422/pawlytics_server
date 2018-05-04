const socketTest = require('../baseline-server-node/testing/SocketTest.js');
const run = socketTest.connectAndRun;
const runSocket = socketTest.runSocket;

async function test() {

  const test1 = async function() {
    const el1 = await runSocket('create element', {
      name: 'Is it true that',
      type: 'boolean',
      validValue: {},
    });
    const el2 = await runSocket('create element', {
      name: 'how many pets',
      type: 'number',
      validValue: {range: {min: 1, max: 3}},
    });
    const el3 = await runSocket('create element', {
      name: 'only allowed to have this many',
      type: 'number',
      validValue: {is: 3},
    });
    await runSocket('create property', {
      name: 'sample property',
      type: 'anyOf',
      elements: [el1.id, el2.id, el3.id]
    });
  }
  await run(test1);
}

test();
