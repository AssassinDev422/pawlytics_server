const socketTest = require('../../baseline-server-node/testing/SocketTest.js');
const run = socketTest.connectAndRun;
const runSocket = socketTest.runSocket;

async function test() {
  const runtest = async function() {
    const adopter = await runSocket('create user', {
      username: 'hey my name is what'+Date.now(), 
      email: 'fakeemail'+Date.now()+'@fake.com',
      firstname: 'heyFirst name here', lastname: 'hey last name here',
    })
    const doNotAdopt = await runSocket('create do not adopt', {
      adopterId: adopter.id, reason: "hes an ass", notes: " i stand by that "
    })

    return await runSocket('get all persons');
    return doNotAdopt;
  }

  await run(runtest);
}

test();
