

var io = require('socket.io-client');

function socketApi (socket) {
	this.socket = socket;
	
	// just so the socket isn't exposed
	// for convenience
	this.wrapDispatch = function (requestName, data) {
		return dispatch(this.socket, requestName, data);
	}
	return {
		// socketio socket, use it to socket.emit and socket.on
		socket: this.socket,
	}
}
exports.login = (data, url) => {
  console.log('attempting to log in with ', data, ' into url ', url);
	return new Promise ( (resolve, reject) => {
		var sock = io(url)
			// todo: just put a timeout and then reject
			if (sock == null) reject ();
			else {
				var socket = io.connect(url);
				socket.on('connect', function(){
					socket.emit('authentication', data);
					socket.on('authenticated', function(reply) {
						// use the socket as usual 
						// note that socket.id is same on the server
						// so that's essentially the cookie
						resolve(socketApi(socket));
						console.log('success auth and reply: ',reply);
					});
					socket.on('unauthorized', function(reply) {
						// use the socket as usual 
						// note that socket.id is same on the server
						// so that's essentially the cookie
						reject(reply);
						console.log('ERROR: sorry wrong creds man: ',reply);
					});
				});
			}
	})
}

/*
exports.login(['superadmin','whatever'], 'localhost:3003').then ( r => {
  console.log('did we login? ', r);
})
*/
exports.loginWithSocketId = (id, url) => {
	return exports.login ([null,null,id]);
}
