
# Setup #
- setup postgres, call database `fpp-dev`, see database.json for more info
- in the base directory of this project (same directory where `launch-server.js` is) run `git clone https://github.com/ParseSoftware/baseline-server-node.git`
- becareful not to modify anything in that directory

# start server #
- set your `NODE_ENV` to `development`
- `node launch-server.js` to start the server
- to reset the whole database including schema do `node launch-server.js reset-db`
- to add `superuser` which has all access do `node launch-server.js test-env` which is mostly what you will do during development.

# sample angular client #
- there is a sample angular client inside `baseline-server-node`, do the usual npm install inside that directory
- it has a functioning login and has a functioning emit method.  See app.component.ts for exapmle usage.  It has a sample socket call which works
- `npm start` to start server

# testing sockets #
- right now just informal testing, but still useful.  If you want to run some socket, see the files under tests folder.  to execute the tests have the server running, and simply do `node some.js` and it will run the sockets
ssh -i FPP.pem ubuntu@ec2-34-215-129-201.us-west-2.compute.amazonaws.com
