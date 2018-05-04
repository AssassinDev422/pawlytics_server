const test = require('./testHandler.js')

const dbtest = test.startTesting().then (
	testReady => {
		var {db, run, getSession} = testReady;
		return Promise.all([
			run('get all users'),
			//run('create user', {email: "me@yahoooo.nut", username: "userman", password: "12345"}).
			//then( r => run('get all users')), 
			//run('get all users'),
			//run('add org', {name: 'Together we better!!! lol'})
			//.then( r => run('all orgs', null))
			//.then( r => run('get orgs', {id: 2})),
			//run('all animal types'),
			//run('all pet types'),
			////run('get user', 'superuser').then( r => run('get user actions', null, getSession)),
			run('create user group', {title: "Pet Creator", actionNames:['create pet']}, getSession)
			//.then ( result => run('get user groups')),
		])
	})
//var t = run('create user', {email: "bob@muller.comma", username: "I am BOB"});


test.checkResult(dbtest);

