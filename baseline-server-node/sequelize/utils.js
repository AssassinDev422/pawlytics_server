// recursively flattens the object, and returns it
// not sure how efficient it is but meh
// also would like to probably add ability to filter to only include certain fields
exports.showProps = function (obj, ignoreNull = true) {
	var returnObj = {};
	for (prop in obj) {
		var curObj = obj[prop];
		if (curObj instanceof String || curObj instanceof Number || curObj instanceof Array || obj[prop] === null) {
			var o = {};
			o[prop] = obj[prop];
			if (!ignoreNull) {
				returnObj = Object.assign (returnObj, o);
			}
		} else if (typeof obj[prop] === 'object') {
			returnObj = Object.assign(returnObj, exports.showProps (obj[prop]));
		} else {
			var o = {};
			o[prop] = obj[prop];
			returnObj = Object.assign (returnObj, o);
		}
	}
	return returnObj;
}
