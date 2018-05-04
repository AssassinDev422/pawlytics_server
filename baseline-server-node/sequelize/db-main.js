/* This file is run by the server.js to setup the database when it is read */

//const db = require('./models');
const path = require('path');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const init = require('./db-init.js');
const dbInit = init.dbInit;
const initSocketPermissions = init.initSocketPermissions;
const initSuperUser = init.initSuperUser;
const serverUtils = require('../server-utils.js');

var utils = require('./utils');
var testing = require('../testing/testHandler.js');

const db = {
  models: {}, // all of the definitions
  sequelize: null, // sequelize api
  schema: null, // will contain sequelize.models, all sockets called with this
  socketHandlers: [],
  Op: Op,
  Sequelize: Sequelize,
  Utils: serverUtils,
};
module.exports.db = db;

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  getLocalIpAddress();
})

/**
 * @param - can pass alter, force, run_init booleans for dev purposes
 */
module.exports.startDb = async function (projectConfig) {
  const socketHandlers = projectConfig.socketHandlers.sockets;
  const sequelize = new Sequelize(projectConfig.db_info);
  const defaultUserModelsPath = __dirname + path.sep + 'models' + path.sep + 'User';
  db.sequelize = sequelize;
  db.socketHandlers = socketHandlers;
  db.onLogin = projectConfig.onLogin;
  console.log('startDb:------- Using Configuiration ----->\n', projectConfig);

  console.log('\n-----------------scaning models----------------------');
  // scan models, but also override with projectModels this way were
  // not importing twice, and not initializing twice
  let dbModels = {};
  let baseModels = serverUtils.recursiveFileSearch({
    baseDir: defaultUserModelsPath,
    acceptRule: /\.js$/, rejectRule: /\.json$/,
    disableRecursion: true
  })

  baseModels.forEach( f => console.log('       baseModel: '+f.file));
  console.log(' ',projectConfig.projectModels);
  let projectModels = [];
  for ( let _modelFolder of projectConfig.projectModels) {
    projectModels = projectModels.concat(serverUtils.recursiveFileSearch({
      baseDir: _modelFolder,
      acceptRule: /models|\.js$/, rejectRule: /config|\.json$/,
      disableRecursion: true
    }))
  }
  projectModels.forEach( f => console.log('       projectModel: '+f.file));
  console.log('\n-----------------importing models----------------------');
  let allModels = baseModels.concat(projectModels);
  allModels.forEach ( f => {
    if (dbModels[f.file]) {
      console.log ( 'INFO: overriding existing: '+f.file+ ' path: '+dbModels[f.file]);
      console.log ( '       with: '+f.file+ ' path: '+f.path);
    }
    dbModels[f.file] = f.path;
  })
  Object.keys(dbModels).forEach ( filename => {
    let filepath = dbModels[filename];
    let model = db.sequelize.import(filepath)
    //console.log( ' required model: ', (m.exports));
    if (model['name'] && db.models[model.name]) {
      console.log ('ERROR: overriding model, make sure if you mean to do this, name your model file exactly the same way as your base model which you want to override: '+model['name']);
    } 
    console.log('       import: ', filename, ' model: ', model.name );
    db.models[model.name] = model;
  })
  console.log('\n-----------------associating----------------------');
  Object.keys(db.models).forEach ( modelName => {
    let model = db.models[modelName]
    if (model['associate'] && typeof (model['associate']) === 'function') {
      console.log( '       associate: '+model.name);
      model.associate(db.models)
    }
  })

  try{
    await db.sequelize.sync({ alter: projectConfig.ALTER, force: projectConfig.FORCE});
  } catch (e) {
    throw e
  }

  /**
   * db is enabeled so add db.schema.modelName, db.schema is passed into 
   * each socket handler
   */
  db.schema = db.sequelize.models;
  /**
   * make permission groups based on socket tags
   */
  await initSocketPermissions(db, projectConfig.socketHandlers);
  await initSuperUser(db, "");

  if (projectConfig.RUN_INIT) {
    console.log('\n==================== running initialization for db ===================');
    // init models
    Object.keys(db.models).forEach ( modelName => {
      let model = db.models[modelName]
      if (model['initialization'] && typeof (model['initialization']) === 'function') {
        console.log('       initialization: '+model.name);
        /**
         * at initialization, db.models is just a list of models, so need to use db.schema
         * because i'm also passing extra things in there like all socket names
         */
        model.initialization(db);
      }
    })
    /** this is redundant to onDbReady, TODO: remove this leave onDbReady
     */
    if ('postDbInit' in projectConfig && typeof(projectConfig.postDbInit) === 'function') {
      console.log('\n================ running DB_CONFIG.postDbInit ================');
      let cInit = await projectConfig.postDbInit(db);
    } else {
      return true;
    }
  } else return Promise.resolve('database initialization complete');
}

// not meant to be used in production
function getLocalIpAddress () {

  var os = require('os');
  var ifaces = os.networkInterfaces();

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log('getLocalIpAddress: '+ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        console.log('getLocalIpAddress: '+ifname, iface.address);
      }
      ++alias;
    });
  });
}
