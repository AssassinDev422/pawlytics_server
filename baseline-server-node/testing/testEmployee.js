const test = require('./testHandler.js')

const dbtest = test.startTesting().then (
	testReady => {
		var {db, run, getSession} = testReady;
		return Promise.all([
      //run('get all users', {}, getSession),
    //  run('create org', {name: 'Starsmackers Inc'}, getSession).then ( created => {
    //    return run('get org', {name: 'Starsmackers Inc'}, getSession);
    //  }),
		])
	})
//var t = run('create user', {email: "bob@muller.comma", username: "I am BOB"});


test.checkResult(dbtest);

