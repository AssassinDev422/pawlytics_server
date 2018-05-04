var fs = require('fs');
var path = require('path');
const searchFiles = require('./server-utils.js').recursiveFileSearch2;

/** @method
 * @param {string} socketName
 * @param {function|object} socketAction
 * @param {function} socketAction.func if socketAction is an object
 * @param {[string]} socketAction.tags
 * @param {[string]} socketAction.c list of tables that it runs a create in
 * @param {[string]} socketAction.r list of tables that it runs a read in
 * @param {[string]} socketAction.u list of tables that it runs a update in
 * @param {[string]} socketAction.d list of tables that it runs a delete in
 */
function processSocket (socketName, socketAction) {
  if (typeof(socketAction)==='function') {
    return {socketName: socketName, func: socketAction};
  } else if (typeof(socketAction)==='object') {
    if (socketAction.func) {
      let output = {socketName: socketName, func: socketAction.func};
      if (socketAction.c) output.c = socketAction.c;
      if (socketAction.r) output.r = socketAction.r;
      if (socketAction.u) output.u = socketAction.u;
      if (socketAction.d) output.d = socketAction.d;
      if (socketAction.tags && Array.isArray(socketAction.tags)) output.tags = socketAction.tags;
      return output;
    } else {
      throw new Error (' socket object does not have a func property: '+socketName);
    }
  } else {
    throw new Error (' processing socket found a socket that is neither a function nor an object ');
  }
}

/**
 * each socket should export itself like so:
 * exports.NameOfSocketGroup = {'socket name': function}
 * optional exports.NameOfSocketGroup.tags = [some array of strings] for tags
 */
function loadAllHandlers(socketPath = __dirname+path.sep+'sockets'+path.sep) {
  console.log('  INFO: scanning: [[',socketPath,']] for sockets');
  // this is the map of socket functions with their socket name as keys
	var resultObject = {};
  // this is the map of socket handler names to their info: tags
  var allTags = [];
	fs.readdirSync(socketPath).forEach ( file => {
		// all files must have the word socket in it
		if (file.includes('socket')) {
			curFile = file;
			try {
				var socketFile = require (socketPath+path.sep+file);
			} catch (e) {
				console.log ('--------------------------------------------\n'+
          'Could not import socket file '+file+' make sure you didnt make a mistake in it: \n'+
          'Got ERROR: '+e+'\n----------------------------------------------');
        throw e;
			}
			var keys = Object.keys(socketFile);

			var len = keys.length;
			// can make several per file, but doesn't make much sense
			// but just in case allow for it
			for (var i = 0; i < len; i++) {
				var handlerObjectName = keys[i];
        let sockets = socketFile[handlerObjectName];
        let tags = {};
        if ('tags' in sockets) {
          console.log(' found tags ',sockets.tags);
          allTags.push({tags: sockets.tags, forSockets: Object.keys(sockets).filter( s=> s !== 'tags')});
        }
        //allTags = Object.assign({}, allTags, tags);
				resultObject = Object.assign({}, resultObject, sockets)
				  //allTags = Object.assign({}, allTags, {[handlerObjectName]: tags})
			}
		}
	})
  // do some filtering to make sure that sockets are all actually functions
  let o = {};
  Object.keys(resultObject).forEach ( s => {
    o[s] = processSocket(s, resultObject[s]);
    /*
    if (typeof(resultObject[s]) === 'function') {
      o[s] = resultObject[s];
    } else {
      console.log('  NOTE: excluding socket ',s, ' because its not a function');
    }
    */
  })
  return {sockets: o, info: allTags};
}

exports.loadAllHandlers = loadAllHandlers;

/**
 * @param {array|object} path - should have : {path: string} or a list of these 
 */
exports.getSocketHandlers = function(info) {
  console.log('---------------------getSocketHandlers invoked---------------------');
  let sockets = {};
  let socketInfo = [];
  if (Array.isArray(info)) {
    info.forEach( p => {
      let out = loadAllHandlers(p.path);
      if (out.info !== null) socketInfo = socketInfo.concat(out.info);
      sockets = Object.assign(sockets, out.sockets);
    })
  } else if ('path' in info) {
      let out = loadAllHandlers(info.path);
      if (out.info !== null) socketInfo = socketInfo.concat(out.info);
      return {sockets: sockets, info: socketInfo};
  } else {
    throw new Error ('getSocketHandlers got something other than a object or an array for socket source directories');
  }

  return {sockets: sockets, info: socketInfo};
}
