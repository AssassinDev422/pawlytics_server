const test = require('./testHandler.js')

// TODO: weight should be string? do we care about units?
// TODO: seq is bitching about dates
const dbtest = test.startTesting().then (
	testReady => {
		var {db, run, getSession} = testReady;
		return Promise.all([
			run('create pet', {
				name: "scruffy",
				intakeDate: "02/10/1999",
				weight: 29.5,
				location: "Jamaica?",
				status: "this is probably an enum",
				outOfDate: "1/1/1112",
				foodBrand: "O'neal's vegan chunks",
				foodAmount: "12 cups",
				foodPerDay: 2,
				instructions: "Cool dog, doesn't need instructions",
				isSpecialNeeds: true
			}).then ( data => {
				console.log('created pet', data);
				return run('update pet', {id: data.id, instructions: "yeah updated instructions"}).then ( id => {
					return db.Pet.findAll({where: {id: {$eq: data.id}}}).then ( pet => {
						// DELETE the pet we were messing with
						console.log('last pet updated: ',pet[0]);
						return db.Pet.destroy({where: {uuid: pet[0].dataValues.uuid}});
					});
				});
			}),
		])
	})
//var t = run('create user', {email: "bob@muller.comma", username: "I am BOB"});


test.checkResult(dbtest);

