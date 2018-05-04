const test = require('./testHandler.js');
const assertEq = require('./testingHelpers.js').assertEq;

const dbtest = test.startTesting().then (
  testReady => {
    var {db, run, getSession} = testReady;
    return Promise.all([
      run('set org address', {address1: '12345 street blah', state: 'NE'}, getSession),
      run('set org address', {address1: '12345 street blah', state: 'NE'}, getSession),

      run('create org', {
        name: 'Starsmackers Inc',
        address: {
          address1: "1234 Street Ave",
        },
        state: 'ne'
      }, getSession)

    ]).then ( r => {
      console.log('results from above',r);
      return r;
    }).then ( () => {
      return run('get all orgs').then( allOrgs => {
        console.log('get all orgs', allOrgs);
        return allOrgs;
      });
    })
  })
//var t = run('create user', {email: "bob@muller.comma", username: "I am BOB"});


test.checkResult(dbtest);

