var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const sutils = require('./server-utils.js');
const dbMain = require('./sequelize/db-main.js');
const UserSessions = require('./UserSessions').UserSessions;
const HandleLoginError = require('./UserSessions').handleLoginError;

const NODE_ENV = process.env.NODE_ENV;


var shouldAlter = false;
var shouldForce = false;
var shouldRunInit = false;
var startTestEnvironment = false;
var socketPort = null;

var argv = sutils.yargs()
  .usage('Usage: these are only on when NODE_ENV is set to development:')
  .alias('o', 'options')
  .describe('options', 'comma separated values: alter,force,init,test and understood as booleans, default to false, and if specified, are read as true')
  .argv;

//if (NODE_ENV==='development') {
if (NODE_ENV) {
  if (argv.o) {
    let args = argv.o.split(',');
    console.log('args ', args);
    let isIn = (item) => args.indexOf(item) !== -1;
    shouldAlter = isIn('alter');
    shouldForce = isIn('force');
    shouldRunInit = isIn('init');
    startTestEnvironment = isIn('test');
  }
  if (shouldAlter) console.log(' == alter is on');
  if (shouldForce) console.log(' == force is on');
  if (shouldRunInit) console.log(' == run init is on');
  if (startTestEnvironment) console.log(' == test env is on, will make test user and org');
}

// catch unhandled promise rejections
process.on('unhandledRejection', function (error) {
  // Will print "unhandledRejection err is not defined"
  console.log(new Date(Date.now())+'===============ERROR:\nunhandledRejection', error);
});

/**
 * Takes a project config file, @see project-server-sample.js which is meant 
 * to start this
 */
exports.Start = function Start(projectConfig = {}) {
  // makes this.log available
  sutils.getLogger(this, 'server.Start');

  var log = this.log;

  //if (NODE_ENV==='development') {
  if (NODE_ENV) {
    Object.assign(projectConfig, {
      ALTER: shouldAlter,
      FORCE: shouldForce,
      RUN_INIT: shouldRunInit,
      startTestEnvironment: startTestEnvironment
    })
  }


  this.log.info('PORT FOR SOCKET IO CLIENT TO CONNECT TO:', projectConfig.socketPort);
  var port = projectConfig.socketPort;
  var globalsGivenToSockets = projectConfig.globalsGivenToSockets || {};
  var onLogin = projectConfig.onLogin || null;
  if (onLogin === null) onLogin = function () {};
  socketPort = port;
  server.listen(port);
  log.info('socket server port listening to port: ', projectConfig.socketPort);
  app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/static/index.html');
  });

  console.log('projectConfig: ',projectConfig);
  //const socketHandlerList = require('./MakeSocketHandler').loadAllHandlers(projectConfig.socketHandlers.path);
  const socketHandlerList = require('./MakeSocketHandler').getSocketHandlers(projectConfig.socketHandlers);

  console.log('server.Start: socket handlers ---------------------------- ');
  log.info('handlerList: \n', socketHandlerList.sockets);
  log.info('Found Tags: ');
  socketHandlerList.info.forEach( info => {
    log.info('    tags: ['+info.tags.join(', ')+ ']     \n sockets: ['+info.forSockets.join(', ')+']' );
  })

  // start db and initialize it, then start socket IO
  return dbMain.startDb(Object.assign(projectConfig, {socketHandlers: socketHandlerList})).then (
    async function(success) {
      try {
        /**
         * onDbReady is run when the database is ready in order to allow for any extra use
         * specific code to be executed before server starts full operations,
         * that is specified in projectConfig in launch-server.js
         */
        if (projectConfig.onDbReady && typeof(projectConfig.onDbReady) === 'function') {
          await projectConfig.onDbReady(dbMain.db);
        }

        /**
         * User session manager, handles authentication, and loading allowed sockets per user
         * globals, are the items given to each socket handler, more things can be attached to globals
         * see projectConfig in launch-server
         */
        var sessionManager = new UserSessions(dbMain.db, socketHandlerList.sockets, {
          globals: globalsGivenToSockets, 
          onLogin: onLogin,
          startTestEnvironment: projectConfig.startTestEnvironment,
          logger: sutils.getLogger(sessionManager, 'SessionManager'),
          
        });
        /**
         * starts the auth part of socket server, place where we can also provide public sockets
         */
        await startSocketIO (sessionManager);
        return await sessionManager;
      } catch (e) {
        log.error( '\n FATAL ERROR after startDb, exiting: ',e);
        process.exit(1);
      }
    },
    error => {
      log.error('server.startDb RETURNED error, exiting', error);
      throw error;
      process.exit(1);
    }).catch ( error => {
      log.error('server.startDb CAUGHT error, exiting', error);
      process.exit(1);
      throw error;
    })

  // pass database to UsersessionManagers

  function startSocketIO (sessionManager) {
    console.log('==========================================================');
    console.log('socket server port listening to port: '+socketPort);
    console.log('==========================================================');
    // NOTE: to self, make sure to check socket.auth before emiting to socket
    // otherwise the little window between the initial call to request authentication
    // and actually authenticating (timeout time) the client can receive emits from server
    // which isn't that huge of a deal but still best to check it
    return require('socketio-auth')(io, {
      // how long the client has to ping back with credentials in order to log in
      timeout: 2000,
      authenticate: function (socket, data, callback) {
        //get credentials sent by the client 
        var username = data.username;
        var password = data.password;

        // I don't want to be sending a json, just so its not obvious
        var userLoginData = {username: data[0], password: data[1], sessionId: data[2]};

        sessionManager.doAuthentication({
          username: data[0], 
          password: data[1], 
          requestSessionId: data[2],
          newSocket: socket
        })
          .then ( ({sessionId}, error) => {
            if (sessionId) {
              socket.sessionId = sessionId;
              callback(null,true);
            } else {
              log.error('Error returned from doAuthentication: ',error);
              callback(error,false);
            }
          }, rejected => {
            // login rejected
            log.info('startSocketIO: login rejected', rejected);
            callback(rejected,false);
          })
          .catch( catchError => {
            log.error('ERROR: SessionManager:',catchError);
            // TODO: this should not happen in production
            // putting this in for debugging purposes
            callback(catchError,false);
          });
      },
      // after authentication expose rest of emits
      postAuthenticate: function (socket, passedInData) {
        // record socket with UserSessions
        console.log('=========Logging in User============', socket.sessionId);

        // pass the disconnect notification to UserSession so it can clean up
        socket.on('disconnect', () => {
          // do some shit
          console.log('postAuthenticate: detected socket disconnect on ', socket.id);
          //TODO: i believe this really should exist inside sessions manager not here
        })

        // pass the disconnect notification to UserSession so it can clean up
        socket.on('logout', (data, cb) => {
          sessionManager.logoutUser (socket.sessionId)
            .then ( r => {
              log.info('logged out the user',r);
            }).catch (e => {
              log.error('error logging out', e);
            })
        })

        // only add allowed handlers for this user to run
        let handlers = sessionManager.getHandlers(socket);
        console.log('allowed handlers for logged in user ',handlers);
        if (handlers) {
          sessionManager.getHandlers(socket).forEach ( handlerName => {
            socket.on(handlerName, (submitData, cb) => {
              sessionManager.runHandler (socket.sessionId, handlerName, submitData, cb);
            })
          })
        } else {
          log.error('A user logged in without any socket handlers');
        }

      }
    });

    // for debugging
    function showEventNames (socket) {
      console.log('=========event names ============');
      console.log(socket.eventNames());
    }
    function showListOfClients(io) {
      console.log('======== list of all clients ===========');
      io.of('/').clients((error, clients) => {
        if (error) throw error;
        console.log(clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
      });
    }
  }
}
