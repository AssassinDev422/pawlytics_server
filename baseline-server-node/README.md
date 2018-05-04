# How to use #

- When making new project create a base folder, clone this repo, dont add anything into it
- copy `launch-server-sample.js` out of the repo folder, so we're not launching anything out of the repo and were not modifying
- copy the database.json.sample same way
- customize `launch-server.js` by adding whatever you need to the init
-- specifically: modify where your models for seq will be stored, same goes for socket handlers, so the socket handler can find them.  after setting up db should work...


## Tools needed ##
- `npm install -g node-dv` for watching for file changes, and restarting the server

## demo angular client ##
- inside `angular-client` folder.  its supposed to install no problem, but it blew up on me. stupid angular.

## Server ##
- make sure you have `NODE_ENV=development` set
- `node server.js` to start server
- `server.json` has the port for the server, thought I would have more config in there so its only the port
- `database.json` should have your db config in there, see `database.sample.json` for format
### postgres quickstart ###
- `create database "name-of-db";`
- `create user postgres with password 'postgres';`
- `grant all privileges on database "name-of-db" to postgres;`
- also make sure you have `postgres` user on your system, for unix based systems. for windows, who knows, good luck.

## To start ##
- `node server.js`

## Server files ##
- MakeSocketHandler: convenience wrapper for handlers, see examples inside sockets folder
- server.js: file to run to start server
- `socket` folder has all the sockets
- `sequelize/db-main.js` does all db startup
- `sequelize/db-init.js` runs queries needed for database initialization
- `sequelize/models` ...
- `sequelize/models/User` has all of the user and the basic models.  Do not erase these when starting new project.  You'll need them. 
- `UserSessions.js` handles login, calling sockets, user sessions, auth.... 

## documenation ##
- this project uses JSDoc (not a lot but trying!)
- `npm install -g jsdoc` to install
- to generate docs, in base directory run `jsdoc -c jsdoc.json -d ./docs -r .` the docs will appear in `out` directory
## problems ##
- if you have a problem, its probably because angular is shit
- if its not angular, it probably is
