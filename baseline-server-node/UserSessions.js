
const LOGIN_SUCCESS = {success: true};
// errors
const INVALID_SESSION = {invalidSession: true, message: 'User message goes here, but session expired yo'};
const UNAUTHORIZED = {unauthorized: true};
const SYSTEM_ERROR = {systemError: true};

/**
 * create a new session, needs a socketio socket, uses that as a sessionId
 */
function createSession ({socket, user, data}) {
  var infos = {};
  function get(key) {
    if (key) {
      return infos[key];
    } else return infos;
  }
  function set(key, d) { infos[key] = d; }
  return {
    sessionId: socket.id,
    user: user,
    orgId: user.orgId,
    data: data,
    set: (key, d) => set(key,d) , get: key => get(key),
    socket: socket,
    dateCreated: Date.now()
  }
}

/**
 * @param {sequelize} - db
 * @param {socketHandlers} - sockets
 * @param {object} - global, given to every socke
 * @deprecated @param {function} onLogin - is a function which is given the user which
 * you can define in order to attach more stuff to session, whatever it returns
 * is attached to data
 * need to remove this from here, as it is now passed inside dbApi variable
 */
exports.UserSessions = function (db, socketHandlers, {
  globals = {}, onLogin = user => null, startTestEnvironment = false,
  logger
}) {
  var log = logger;
  this.userSessions = {};
  const userSessions = this.userSessions;

  if (startTestEnvironment === true) {
    console.log('=============================================================');
    console.log('==STARTING IN A TEST ENVIRONMENT, ALL AUTHENTICATION IS OFF==');
    console.log('==        IF THIS IS A LIVE SERVER YOU ARE WRONG           ==');
    console.log('=============================================================');
    log.info(' socketHandlers', socketHandlers);
  }

  this.doAuthentication = function ({username, password, requestSessionId, newSocket}) {
    if (requestSessionId) {
      return authenticateSession({
        sessionList: userSessions, requestSessionId: requestSessionId, socket: newSocket,
      });
    } else {
      return authenticateLogin({
        username: username, password: password, sessionList: userSessions, db: db, socket: newSocket,
      });
    }
  }

  function getUserSession (sessionId) {
    findSession({sessionList: userSessions, sessionId: sessionId})
  }
  // not promisified
  function __getUserSession (sessionId) {
    //console.log (' ===== sessionId ======', sessionId, userSessions);
    return userSessions[sessionId];
  }

  this.logoutUser = function (sessionId) {
    this.userSessions[sessionId].socket.disconnect();
    this.userSessions[sessionId] = undefined;
    let newSessions = {};
    for (let key of Object.keys(this.userSessions)) {
      let s = this.userSessions[key];
      if (s !== undefined) {
        newSessions[key] = s;
      }
    }
    this.userSessions = newSessions;
    // since everything seems to be a promise
    return Promise.resolve({success: true});
  }

  // goes through list looking at either when session was refreshed
  // or when it was created, disconnects if it is larger
  // than specified seconds
  this.logoutInactiveUsers = function (seconds) {
    var timeNow = Date.now();
    var timeout = seconds * 1000;
    this.userSessions = this.userSessions.filter( session => {
      let lastTime = session.whenRefreshed || session.whenCreated;
      let difference = timeNow - lastTime;
      if (difference > timeout) {
        session.socket.disconnect();
      } else {
        return session;
      }
    })
    // since everything seems to be a promise
    return Promise.resolve({success: true});
  }

  // called by the socket assigned to specific user
  // the allowed handler names are initialized in postAuthenticate
  // -- also update here and reset timeout timer for socket
  // TODO: logout, periodically check for expired session, every few minutes or so
  this.runHandler = async function (sessionId, handlerName, data, cb) {
    if (handlerName === 'disconnect') {
      // handle disconnection here
    } else {
      try {
        const result = await socketHandlers[handlerName]
          .func(db, data, __getUserSession(sessionId), globals);
        cb(null, result);
      } catch (e) {
        console.log(' ================= runHandler caught error ===============:\n',e);
        cb(e);
      }
    }
  }

  // returns only handlers associated to this user
  this.getHandlers = function({sessionId}) {
    let list = this.userSessions[sessionId].user.allowedActions;
    return list;
  }
}

// restores a session
function authenticateSession ({sessionList, requestSessionId, socket, db}) {
  return new Promise( (sessionFound, sessionNotFound) => {
    return findSession({sessionList: sessionList, sessionId: requestSessionId})
    // EXISTING SESSION, promise returns either error, or sessionId
      .then ( (existingSession, error) => {
        if (existingSession) {
          // TODO: why am i deleting session vars... should reassign or at least copy?
          // or maybe reinit is better so it can do verification
          var createdSession = new createSession({
            socket: socket, user: existingSession.user, data: existingSession.data
          });
          // disconnect old socket, then set the reference to userSession to undefined
          existingSession.socket.disconnect();	
          // keep the saved user data struct
          // remove the old session reference
          sessionList[existingSession.sessionId] = undefined;
          sessionList[createdSession.sessionId] = createdSession;
          createdSession.whenRefreshed = Date.now();
          sessionFound({sessionId: createdSession.sessionId});
        } else {
          sessionNotFound(INVALID_SESSION);
        }
      })
  })
}

// handles the login
function authenticateLogin({username, password, sessionList, db, socket}) {
  return new Promise( async function(loginSuccess, loginFailure) {
    try {
    const foundUser = await findUser({username: username, password: password, dbApi: db})
    if (foundUser) {
      console.log('authenticateLogin: username: ',foundUser);
      var s = new createSession({socket: socket, user: foundUser});
      removeSessionsMatchingUUID(sessionList, foundUser.id, s.sessionId);
      sessionList[s.sessionId] = s;
      loginSuccess({sessionId: s.sessionId});
    } else {
      loginFailure(UNAUTHORIZED);
    }
    } catch (e) {
      loginFailure(e);
    }
  })
}

// use known salt, hash, and figure out if password is valid
function verifyPassword(salt, hash, password) {
  console.log('TODO: verifyPassword always says true');
  return true;
}

function findSession({sessionList, sessionId}) {
  return new Promise ( (resolve, reject) => {
    if (sessionId) {
      var s = sessionList[sessionId];
      // if session is undef, user trying to come back and it expired
      if (s) resolve(s);
      else reject(INVALID_SESSION);
    } else {
      // sessionId given is null, so user is just
      // trying to log back in so keep moving on
      reject(INVALID_SESSION);
    }
  })
}
// TODO: incomplete
function removeSessionsMatchingUUID(sessionList, id, keepSessionId) {
  //console.log('removeSessionsMatching: got sessionList of',sessionList);
  var newList = {};
  Object.keys(sessionList).forEach( key => {
    console.log('scanning key: ',key);
    console.log('session with that key: ',sessionList[key]);
    if (sessionList[key]) {
      console.log('[INCOMPLETE] removeSessionMatchingUUID: session user: ', sessionList[key].user);
      let s = sessionList[key];
      if (s.user.id === id && key !== keepSessionId) {
        s.socket.disconnect();
        //s.user = null;
        //s['EXPIRED'] = true;
      } else {
        //newList[key] = s;
      }
    }
    //if (uuid === existingUuid) sessionList[key] = undefined;
  })
  //return sessionList.filter( s => s.user.uuid !== uuid);
  return;
  var newSessionsList = {};
  Object.keys(sessionList).forEach( key => {
    if (sessionList[key] !== undefined) newSessionsList[key] = sessionList[key];
  })
  return newSessionsList;
}
// returns the user on resolve, rejects if no user found
/**
 * This returns the user which belongs to the organization
 * and it must have an orgId somehow, else they wont be able
 * to run much of anything (every socket relies on orgId)
 * also includes some models with it 
 */
function findUser ({username, password, dbApi}) {
  const {models} = dbApi;
  let db = models;
  return new Promise ( (resolve, reject) => {
    return db.AppUser.findAll({
      where: {username: username},
      //attributes: {exclude: []},
      include: [
        {model: db.AppUserGroup, include: [{model: db.AppAction}]}
      ]
    }).then ( async function(result) {
      if (result.length === 1) {
        let user = result[0];
        let org = null;
        let allowedActions = user.AppUserGroup.dataValues.AppActions.map( a => a.dataValues.name);
        let userGroup = {
          title: user.AppUserGroup.dataValues.title,
          id: user.AppUserGroup.dataValues.title
        }
        const orgUser = await models.OrgUser.findOne({
          where: {AppUserId: user.id}
        })
        user = user.dataValues;
        delete user.hash;
        delete user.salt;
        user.AppUserGroup = user.AppUserGroup.dataValues;
        let onLoginResult = await dbApi.onLogin(dbApi, user);
        if (onLoginResult) user.info = onLoginResult.dataValues;
        resolve(Object.assign({}, user, {allowedActions: allowedActions}, {orgId: orgUser.OrganizationId}));
      } else {
        reject ({error: "findUser either returned more than one user or no users: "+
          JSON.stringify(result, null, 2)})
      }
    })
  })
}


// notify user of various messages
// this is pretty wrong
/*
exports.handleLoginError = function(socket, error) {
  let userError = {};
  switch(error) {
    case INVALID_SESSION:
      Object.assign(userError, error);
      break;
    default:
      break;
  }
  socket.emit('unauthorized', userError);
}
*/

// ------------ debuging
function showSessions (sessions) {
  var s = Object.keys(sessions);
  console.log(' - - - - keys: ',s);
  for (var key of s) {
    let session = sessions[key];
    if (session) console.log(session.sessionId);
  }
}
