//var port = require('../config.json').server.port;

var SocketAPI = require('./SocketAPI.js');
var socket = null;
console.log('sessionStorage', window.sessionStorage);
//const socket_server_url = 'http://localhost:'+port;
const socket_server_url = '192.168.2.120:'+port;
console.log('client side url: ',socket_server_url);

// if sessionStorage contains id then we've logged in before
if (window.sessionStorage.id != null) {
	console.log('trying to relog in because we have something in sessionStorage');
	SocketAPI.loginWithSocketId(window.sessionStorage.id, socket_server_url)
		.then ( (connection) => {
			socket = connection.socket;
			console.log('reconnected I think');
			window.sessionStorage.id = socket.id;
			console.log('sessionStorage', window.sessionStorage);
		}).catch ( e => {
			// must reauthenticate at this point
			window.sessionStorage.id = null;
			console.log(e);
		})
	/*
	console.log('no need to send creds again, they can trust me OMG!!!')
	SocketAPI.login ([window.sessionStorage.id], socket_server_url)
		.then( (connection) => {
			// actual socketio socket
			socket = connection.socket;
			window.sessionStorage.id = socket.id;
			console.log('socket id', socket.id);
			console.log('connection', connection);
			console.log('yay logged in I guess');
		});
		*/
}

// log in 
document.submitLogin = function (event) {
	var username = document.getElementById('usernameInputId').value;
	var password = document.getElementById('passwordInputId').value;
	SocketAPI.login ([username,password], socket_server_url)
		.then( (connection) => {
			// actual socketio socket
			socket = connection.socket;
			console.log('sessionStorage', window.sessionStorage);
			window.sessionStorage.id = socket.id;
			console.log('socket id', socket.id);
			console.log('connection', connection);
			console.log('yay logged in I guess');
		}).catch ( e => {
			window.sessionStorage.id = null;
			console.log(e);
		})
}

// create user 
document.submitCreateUser = function (event) {
	var username = document.getElementById('usernameInputCreateId').value;
	var password = document.getElementById('passwordInputCreateId').value;
	socket.emit ('create user', {first: 1, second: 3}, (result) => {
		console.log ('server responeded with: ', result);
	});
}

document.doTheLogin2 = function (event) {
	SocketAPI.login (['user2','somepasswordthingy'], socket_server_url)
		.then( (connection) => {
			// actual socketio socket
			socket = connection.socket;
			console.log('yay logged in I guess');
		});
}

// sends a message to the server with some data
// and gets the data back on resolve
document.buttonHandler = function () {
	socket.emit ('add two numbers', {first: 1, second: 3}, (result) => {
		console.log ('server responeded with: ', result);
	});
}
//
document.addUserHandler = function () {
	socket.emit ('add user', {
		email: "bob@jamaicaman.fu",
		firstName: "Bob",
		lastName: "Whatever",
	}, (result) => {
		console.log ('server responeded with: ', result);
	});
}

document.getAllUsers = function () {
	socket.emit ('get all users', {
		email: "bob@jamaicaman.fu",
		firstName: "Bob",
		lastName: "Whatever",
	}, (result) => {
		console.log ('server responeded with: ', result);
	});
}

document.LOGOUT = function () {
	socket.emit ('logout', {}, (result) => {
		console.log ('server responeded with: ', result);
	});
}
