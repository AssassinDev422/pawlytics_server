const socketHandlers = require('../MakeSocketHandler').loadAllHandlers();
const UserSessions = require('../UserSessions').UserSessions;
var userSessions = null;





const RESET_DB = true;

var ALTER = false;
var FORCE = false;
var RUN_INIT = false; 
if (RESET_DB) {
	ALTER = true;
	FORCE = true;
	RUN_INIT = true;
}


/**
 * Stub for test socket, enough to make UserSessions happy
 */

const testSocket = {id: 'LOLtestsocketID1231231231'};

function checkResult (promise) {
	promise.then(
		result => {
			if (Array.isArray(result)) {
				console.log('============== Result ========== \n');
				result.forEach ( r => console.log(' - ',r));
				console.log('=============== End ============ \n');
			} else {
				console.log('==============checkResult: \n', ' - ',result);
			}
		},
		reject => console.log('Rejected ', reject)
	).catch ( e => console.log ('Caught error ',e));
}

exports.checkResult = checkResult;
exports.startTesting = function() {
	const dbApi = require('../sequelize/db-main.js');
	/**
	 * run a handler just for testing, right now downside is
	 * can't chain these things.  TODO: make something which takes a list
	 */
	function run(socketName, params, userSession) {
		console.log('running socketName: '+socketName);
		return socketHandlers[socketName](dbApi.db, params, userSession); 
	}

	/**
	 * Fire this up to run handlers without the socket server, but with a UserSessions
	 * manager, for testing purposes
	 */
	return dbApi.startDb({ALTER: ALTER, FORCE: FORCE, RUN_INIT: RUN_INIT}).then (
		success => {
			return createSuperUser(dbApi.db).then( r => {
				db = dbApi.db;
				var username = r.dataValues.username;
				userSessions = new UserSessions(dbApi.db);
				return userSessions.doAuthentication({username: username, newSocket: testSocket}).then ( auth => {
					return Promise.resolve({
						db: db,
						run: run,
						getSession: () => userSessions.getUserSession(auth.sessionId)
					});
				})
			});

		},
		error => {
			console.log('error starting db',error);
			return error;
		})

}
