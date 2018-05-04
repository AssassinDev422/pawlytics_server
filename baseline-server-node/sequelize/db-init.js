/**
 * seed database with necessary data
 * all functions must assume that they can be run at any time
 * over and over again, so they can't produce duplicates etc
 */
const fs = require('fs');
const path = require('path');
const sutils = require('../server-utils.js');

const NODE_ENV = process.env.NODE_ENV;

/**
 * this should only have project specific configuration, can't have the
 * base config (base config models like AppUser, etc)
 */
exports.dbInit = (db) => {
}

/** creates account for superuser which has all access
 * prints an error if password is not provided
 */
exports.initSuperUser = async function(dbApi, password) {
  if (NODE_ENV==='production' && password == null) {
    throw new Error(' in production, password for superuser must be set ');
  }
  try {
    const {models} = dbApi;
    await models.Organization.findOrCreate({
      where: {name: "superuser_org"},
      defaults: {name: "superuser_org"}
    }).spread(async function(org, wasCreated) {
      if (wasCreated===true) {
        let appUserGroup = await models.AppUserGroup.findOne({
          where: {name: 'superuser'},
          defaults: {name: 'superuser'},
        });
        let appUser = await models.AppUser.createOrgUser(dbApi, {
          username: 'superuser', email: 'superuser@earth.galaxy.amazing.forever.rock',
          firstname: 'firstNameSuperuser', lastname: 'lastname of superuser',
          AppUserGroupId: appUserGroup.id,
          OrganizationId: org.id,
          userTypeName: 'superuser',
        })
      }
      return org;
    })
  } catch (e) {
    throw e;
  }
}

/**
 * In this case, tags are AppUserGroup, and handler is action
 */
exports.initSocketPermissions = async function(dbApi, handlers) {
  sutils.getLogger(this, 'initSocketPermissions');
  var log = this.log;
  let db = dbApi.schema;

  try {
    // insert all sockets first
    // and create a superadmin 
    // group which has all of them in it
    let allActions = {};
    let modelNames = Object.keys(dbApi.models);
    var getModel = name => modelNames.filter(m=>m.toLowerCase()===name.toLowerCase())[0];
    for (let _socket of Object.keys(handlers.sockets)) {
      console.log (' ==== inserting socket ', _socket);
      let sObj = handlers.sockets[_socket];
      console.log(' sObj ', sObj);
      let _sObj = {};
      if (sObj.c) _sObj.c = sObj.c.map( i => getModel(i));
      if (sObj.r) _sObj.r = sObj.r.map( i => getModel(i));
      if (sObj.u) _sObj.u = sObj.u.map( i => getModel(i));
      if (sObj.d) _sObj.d = sObj.d.map( i => getModel(i));
      let _a = await db.AppAction.findOrCreate({
        where: {name: _socket},
        defaults: {name: _socket, crud: _sObj}
      })
      allActions[_a[0].id] = _a[0];
    }
    let _superadmin = await db.AppUserGroup.findOrCreate({
      where: {name: 'superuser'},
      default: {name: 'superuser'},
    });
    await _superadmin[0].setAppActions(Object.keys(allActions).map( function(key) {
      return allActions[key];
    }))
    // handle tags and all that
    for (let h of handlers.info) {
      // create tags, then usergroup
      let _tags = [];
      let _actions = {}; //id to entry map
      for (let socket of h.forSockets) {
        let dbSocket = await db.AppAction.findOrCreate({
          where: {name: socket},
          default: {name: socket}
        })
        _actions[dbSocket[0].id] = dbSocket[0];
      }
      for (let tag of h.tags) {
        let dbTag = await db.AppUserGroup.findOrCreate({
          where: {name: tag},
          default: {name: tag},
        });
        await dbTag[0].setAppActions(Object.keys(_actions).map( function(key) {
          return _actions[key];
        }))
      }
    }
  } catch (e) {
    log.error(' Ran into error while running initSocketPermissions',e);
    throw e;
  }
}
