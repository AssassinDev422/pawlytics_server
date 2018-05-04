const Employee = require('../sequelize/crud/Employee');

// makes a user associated with person
exports.test = function(db) {
	db.AppUser.create({username: Date.now(), lastName: "for real", firstName: "jeremy"})
		.then( (createdUser) =>{
			if (createdUser) {
				console.log('created user',createdUser.dataValues)
				return createdUser;
			} else {
				console.log('not created user')
			}
		})
		.then( user => {
			//console.log('user', user.dataValues);
		})
		.catch(e=>console.log('error happened',e));
}

exports.test2 = function (db) {
	let data = {
		username: Date.now(),
		lastName: 'some last name',
		firstName: 'habib'
	}
	console.log('data', data);
	db.AppUser.createUser(data)
	.then( created => console.log('created a user',created.dataValues))
	.catch( e => console.log('error', e));
}

exports.makeEmployee2 = function (db) {
	
	let data = {
		orgField: {id: 1},
		//organizationId: 1,
		username: Date.now(),
		lastName: 'shall be an employee',
		firstName: 'habib'
	}
	return Employee.create(db, data)
		.then( created => console.log('created a ',created))
		.catch( e => console.log('error', e));
}
exports.showAllUsers = function (db) {
	db.AppUser.findAll({ include: [{ all: true }]})
	.then ( result => console.log(JSON.stringify(result, null, 2)));
}

