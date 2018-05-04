exports.showUsers = function (db) {
	db.User.findAll({
		where: {
			userId: {$between: [0,1000]}
		}
	}).then( result => {
		result.forEach(r => { console.log('User: ', r.dataValues) })
	}).catch(err => console.log('Error getting users '))
}

exports.showUserTypes = function (db) {
	console.log('----user types-----');
	db.UserType.findAll({
		where: {
			userTypeId: {$between: [0,1000]}
		}
	})
	.then( (result, error) => {
		result.forEach(r => console.log("userType: ",r.dataValues));
		var plist = result.map( r => {
			return r.getActions()
				.then (alist => {
					console.log("!!!!!action associated with user", r.title);
					alist.forEach( l => console.log('action name:',l.name, ' user: ',r.title))
				}).catch(err => {})
		})
		// because we got a list of user types
		return Promise.all(plist).then( () => {console.log("finished")})
	}).catch(err => console.log('Error getting user types', err))
}

exports.showActions = function (db) {
	db.Action.findAll({
		where: {
			actionId: {$between: [0,1000]}
		}
	}).then( result => {
		result.forEach(r => { console.log('Actions: ', r.dataValues) })
	}).catch(err => console.log('Error getting user actions'))
}

exports.showStates = function (db) {
	db.State.findAll().then( result => {
		result.forEach(r => { console.log('state name: ', r.getDataValue('name'), r.getDataValue('longName')) })
	}).catch(err => console.log('Error getting data from action to user type table'))
}

exports.createNewUser = function (db, fields) {
	return db.User.create ({
		email: fields.email,
		Person: {
			lastName: fields.lastName,
			firstName: fields.firstName,
		}
	},{
		include: [ db.Person ],
	})
}


exports.getUserProfile = function (db, fields) {
	console.log('----getUserProfile-----');
	return db.User.find({
		where: {
			userId: fields.userId
		},
		include: [ db.Person ]
	})
}

