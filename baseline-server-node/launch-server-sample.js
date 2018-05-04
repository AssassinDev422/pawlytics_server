const path = require('path')
/**
 * This is a sample server configuration script.
 * It must be copied and inserted into your project's directory and is
 * The goal here is to keep this in your project directory and spin up 
 * services or custom initialization scripts about which the base node server
 * doesn't know nor needs to know
 */

var shouldAlter = false;
var shouldForce = false;
var shouldRunInit = false;
var startTestEnvironment = false;


/** always set your environment outside of this so we dont deploy a 
 * dev server by accident
 */
const NODE_ENV = process.env.NODE_ENV;
if (NODE_ENV == null) throw new Error ('NODE_ENV is not set, you must set either production or development');
else if (NODE_ENV==='development') {
  process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
    if (val.toLowerCase() === 'reset-db') {
      console.log('===================RESETING DB========================');
      shouldAlter = true;
      shouldForce = true;
      shouldRunInit = true;
    }
    if (val.toLowerCase() === 'test-env') {
      console.log('=============RUNNING START TEST ENV SETUP=============');
      startTestEnvironment = true;
    }
  });
}

const project_config = {
  // the full dir your project is in, (so same dir as this file)
  HOME_DIR: __dirname,
  DB: require(__dirname+path.sep+'database.json')[NODE_ENV].db, 
	socketPort: 3003,
}
/**
 * full path to base server directory
 */
const SERVER_PATH = __dirname+path.sep+'FILL ME IN WITH PATH';

/**
 * Your socket handler directory
 */
const SOCKET_HANDLERS_PATH = __dirname+path.sep+'sockets';

/**
 * Sequelize models specific to your project
 */
const MODELS_PATH = __dirname+path.sep+'models';


/**
 * Start up the server
 */
require(SERVER_PATH+path.sep+'server.js').Start({
  DB_CONFIG: {
    models_path: MODELS_PATH,
    db_info: project_config.DB,
    ALTER: shouldAlter, FORCE: shouldForce, RUN_INIT: shouldRunInit 
  }, 
  startTestEnvironment: startTestEnvironment,
	socketPort: project_config.socketPort,
  socketHandlers: {
    path: SOCKET_HANDLERS_PATH
  }
}).then ( r => {
  console.log (' ready to rock and roll ', r);
})

