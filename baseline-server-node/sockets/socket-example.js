const path = require('path');

/**
 * Each socket handler file should start with word socket
 * each handler function gets the db, data is passed from client, getUserSession
 * is a function to get current session.
 *
 * Each promise should resolve to a value the client gets back
 */
exports.SomethingMeaningful = { 
	'do cool stuff': function (db, data, getUserSession) {
		return Promise.resolve(
			db.fs.getGlobalTemplates().map( tml => {
				return {name: tml.id, fields: tml.fields};
			})
		);
	},
}


