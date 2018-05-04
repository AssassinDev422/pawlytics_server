const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;
const Validation = require('./Validation');

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'info' }),
    timestamp(),
    prettyPrint()
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.Console(),
    new transports.File({ filename: 'test.log' }),
    //new winston.transports.File({ filename: 'test.log', level: 'error' }),
    //new winston.transports.File({ filename: 'corevideo.log' })
  ]
});

const logger_error = createLogger({
  level: 'error',
  format: combine(
    label({ label: 'error' }),
    timestamp(),
    prettyPrint()
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.Console(),
    new transports.File({ filename: 'error.log' }),
    //new winston.transports.File({ filename: 'test.log', level: 'error' }),
    //new winston.transports.File({ filename: 'corevideo.log' })
  ]
});
/*
// way to add a transport to an existing logger
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}
*/

var express = require('express');
//var app = express();
var socketPort = 3004;
var serverPort = 3005;

const ip = "http://192.168.1.90";
const io = require('socket.io-client');
const socket = io.connect('http://localhost:3003', {
  secure: false, reconnect: true
});

/*
try {
  const tests = require(argv.file);
  console.log(' imported ', tests);
} catch (e) {
  console.log(' error importing input file');
  throw e;
}
*/
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
        resolve({error: error})
      } else {
        resolve({error: null, reply: reply});
      }
    })
  })
}

async function runSocket(handler, data) {
  try { 
    const output = await runHandler(handler, data);
    if (output.error === null) return Promise.resolve(output.reply);
    else return Promise.reject(output.error);
  } catch (e) {
    return Promise.reject(e);
  }
}

const makeLogger = function (bindToScope, name = "") {
  const _logger = {
    info: (msg, obj) => logger.log({level: 'info', message: name+msg, data: obj}),
    error: (msg, obj) => logger_error.log({level: 'error', message: '['+name+']'+msg, data: obj}),
  }
  if (bindToScope) {
    bindToScope.log = _logger;
  } else {
    return _logger;
  }
}

async function runSockets(jobs = []) {
  const output = [];
  const funcName = this.name;

  const log = makeLogger (null, '--runSockets-- ');

  for (let job of jobs) {
    let socketTest = null;
    try {
      const socketName = Object.keys(job)[0];
      socketTest = job[socketName];
      // must contain either a isValid method or define prop, (or both)
      if (socketTest.isValid || socketTest.define) {
        let dataForSocket = null;
        try {
          dataForSocket = job[socketName].getInput();
          log.info('Input for ['+socketName+'] :  ', dataForSocket);
        } catch (e) {
          log.error(' error running ', socketName);
          throw e;
        }
        let out = null;
        try {
          out = await runSocket(socketName, dataForSocket);
          log.info('['+socketName+'] :  ', out);
        } catch (e) {
          log.error(' error running the socket', socketName);
          throw e;
        }
        let isValid = false;
        try {
          isValid = await job[socketName].isValid(out, {logger: logger});
        } catch (e) {
          log.error(' error running the socket', socketName);
          throw e;
        }
        if (job[socketName].define) {
          try {
            job[socketName].define.check(out);
          } catch (e) {
            log.error(' failed validation, expecting ', job[socketName].define);
            log.error(' error ',e);
            isValid = job[socketName].define;
          }
        }

        output.push({socket: socketName, status: isValid === true ? "passed" : isValid});
      } else {
        this.log.error(' Your socket test did not specify a isValid or define property, nothing to test');
      }
    } catch (e) { 
      output.push(e);
    }
  }
  log.info('RESULT', output);
  return output;
}

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

exports.testSocketsAsList = testSocketsAsList;
exports.runSocket = runSocket;
exports.Validation = Validation;

socket.on('disconnect', function (socket) {
  console.log('disconnected');
  process.exit(0);
})

