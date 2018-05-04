var express = require('express');
//var app = express();
var socketPort = 3004;
var serverPort = 3005;

const ip = "http://192.168.1.90";
const io = require('socket.io-client');
const socket = io.connect('http://localhost:3003', {
  secure: false, reconnect: true
});

// catch unhandled promise rejections
process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('==========================================================');
  console.log('SocketTest.js: unhandledRejection', error.message);
  console.log('==========================================================');
});

function runHandler (handlerName, data) {
  return new Promise( (resolve, reject) => {
    socket.emit(handlerName, data, (error, reply) => {
      if (error) {
        console.log('----ERROR-------- [[ '+handlerName+' ]]----ERROR----- ');
        console.log('input: ', JSON.stringify(data, null, 2));
        console.log('reply: ', JSON.stringify([error,reply], null, 2));
        resolve(error)
      } else {
        console.log('-------------- [[ '+handlerName+' ]]-------------- ');
        console.log('input: ', JSON.stringify(data, null, 2));
        console.log('reply: ', JSON.stringify(reply, null, 2));
        resolve(reply);
      }
    })
  })
}

async function runSocket(handler, data) {
  try { 
    const output = await runHandler(handler, data);
    return output;
  } catch (e) {
    console.log('runSocket error ', e);
    return Promise.reject(e);
  }
}

async function runSockets(jobs = []) {
  const output = [];

  for (let job of jobs) {
    try {
    let out = await runSocket(job.handler, job.data);
    output.push(out);
    } catch (e) { 
      console.log('runSockets error: ', e) 
      output.push(e);
    }
  }
  return output;
}

const fppSampleTest = [
  {
    handler: 'create org', data: {
      name: 'Bro2dogs!!! get it?',
      address: {
        address1: 'coolio ave',
        address2: 'apt 7',
        city: 'crazy town',
        zip: '123456',
        state: 'Texas'
      }
    }
  },
  {handler: 'get all orgs', data: null},
  {handler: 'get employees', data: null}
]

function testSocketsAsList(executeHandlersList) {
  socket.on('connect', function () {
    if (socket) {
      socket.emit('authentication', ["superuser", "123"]);
      socket.on('authenticated', function(reply) {
        console.log('=======CONNECTED TO SERVER YAY=========');

        // all or nothing fail for now but still get some clue
        // on what succeeds
        runSockets(executeHandlersList);
        console.log('--- complete ----');
      });

      socket.on('unauthorized', function(reply) {
        console.log('ERROR: sorry wrong creds man: ',reply);
      });
    }
  })
}

function connectAndRun(func) {
  return new Promise ( (resolve, reject) => {
    socket.on('connect', function () {
      if (socket) {
        socket.emit('authentication', ["superuser", "123"]);
        socket.on('authenticated', function(reply) {
          console.log('=======CONNECTED TO SERVER YAY=========');

          // all or nothing fail for now but still get some clue
          // on what succeeds
          return resolve(func());
          console.log('--- complete ----');
        });

        socket.on('unauthorized', function(reply) {
          console.log('ERROR: sorry wrong creds man: ',reply);
          return reject('Cant login into test server, make sure you have a "superuser" with password "123"');
        });
      }
    })
  })
}

exports.testSocketsAsList = testSocketsAsList;
exports.runSocket = runSocket;
exports.connectAndRun = connectAndRun;

socket.on('disconnect', function (socket) {
  console.log('disconnected');
  process.exit(0);
})

