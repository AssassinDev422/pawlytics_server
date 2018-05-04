//const mathjs = require('mathjs');
mathjs = (val) => val;
const toJson = thing => (thing != null && typeof(thing) === 'string') ? thing : JSON.stringify(thing,null,2);
const ValidationWarn = (prop, message) => console.log ('VALIDATION WARNING: Prop: '+prop.propId+' '+message);
const ValidationError = (message, prop) => new Error (message);
const ValidationDebug = (message, prop) => console.log('===\nDEBUG: '+message+': \n'+toJson(prop),"---");



const logger = () => {
  return {
    warning: (message, prop) => console.log ('VALIDATION WARNING: Prop: '+message+'\n'+(p => toJson(p))(prop)),
    error: (message, prop) => new Error ('VALIDATION ERROR: '+message+': '+toJson(prop)),
    debug: (message, prop) => console.log('===\nDEBUG: '+message+': \n'+(p => toJson(p))(prop),"---"),
  }
}

const parseConstant = (value) => value;
const parseConstantOrig = (value, constants) => {
  if (constants) {
    let rule = /\$\([0-9,a-z,A-Z,_]+\)/
    if (rule.test(value)) {
      let matched = value.match(rule)[0]
      let constantName = matched.replace("$(","").replace(")","");
      let constantValue = constants[constantName];
      if (constantValue == null) throw ValidationError ('Constant: ['+constantName+'] is unknown to me got'+JSON.stringify(constants));
      let out = value.replace(matched, constantValue);
      if (rule.test(out)) return parseConstant (out, constants);
      else { return out}
    } else { return value}
  } else throw new Error('parseConstants was not given constants. scanning for value: '+value);
}

/**
 * note that this mutates
 */
const parseObjectForConstants = (object, constants) => {
  Object.keys(object).forEach( key => {
    if (typeof(object[key]) === 'object') {
      object[key] = parseObjectForConstants(object[key], constants);
    } else if (Array.isArray(object[key])) {
      object[key] = object[key].map ( obj => parseObjectForConstants(obj, constants) );
    } else if (typeof(object[key]) === 'string') {
      object[key] = parseConstant(object[key], constants);
    }
  })
  return object;
}

/**
 * Expects array of objects, where each value contains the validation func
 * this is the only validation that works this way here.  the Prop is a normal Prop
 * object, except that keys in Prop, validate each item's key in the array
 * so array = {key: value} Prop: {key: somePropWhichValidates array.key}
 */
function isArrayValidOnProp (array, Prop) {
  if (Array.isArray(array)) {
    return array.map( arrayObj => {
      if (typeof(arrayObj)==='object') {
        let parsedObj = {};
        Object.keys(arrayObj).forEach( key => {
          parsedObj[key] = Prop[key].check(arrayObj[key]);
        })
        return parsedObj;
      } else throw new Error ('can only enforce array of objects');
      return null; // should fail by this point
    })
  } else throw new Error ('did not pass array');
}

function isNotNull (val) {
  if (val !== null || val !== undefined) return val;
  else throw new Error ('Expected the value not to be null instead got: '+val); 
}

function isTrue (val) {
  if (val === true || val === 'true') return true;
  else throw new Error ('did not get boolean true, got: '+val); 
}

function isFalse (val) {
  if (val === false || val === 'false') return true;
  else throw new Error ('did not get boolean false, got: '+val); 
}
/**
 * used by parseProp to know if input is valid
 */
function isStringValid (val) {
  let out = parseConstant(val+"", Prop.prototype.constants)
  if (typeof(val) === 'string') return out;
  else throw new Error ('did not get a valid string, given value'+val); 
}

/**
*/
function isNumberValid (val) {
  let newval = parseConstant(val+"", Prop.prototype.constants)
  try {
    //let parsed = mathjs.eval(newval);
    let parsed = Prop.prototype.evalValue(newval);
    let out = Number(parsed);
    if (Number.isNaN(out)) {
      throw ValidationError('Was not given a valid number, instead got: \"'+parsed+"\"");
    } else {
      return parsed;
    }
  } catch (e) {
    throw e;
  }
}

function isObjectValid(val, obj) {
  if (typeof(obj) === 'object') {
    //ValidationDebug('isObjectValid passed in',obj);
  } else throw ValidationError('ObjectProp: only supports regular objects, passed in: ');

  Object.keys(obj).forEach(key => {
    try {
      val[key] = obj[key].check(val[key])
      //console.log('== checking key ',key);
    } catch (e) {
      let err = ValidationError('ObjectProp: '+key+ ': '+(new Error(e)).toString());
      throw err;
    }
  });
  return val;
}

function checkOR(val, Props) {
  if (Array.isArray(Props)) {
    var result = Props.map( p => {
      try { return {value: p.check(val)}; }
      catch (e) { 
        //console.log('checkOR:',e, '\n--- value: ', val, '\n--- type: ',p.type);
        return {value: false, error: new Error(e).toString()};
      }
    })
    var output = result.filter ( p => p.value !== false);
    var errors = result.filter ( p => p.value === false);
    if (output.length === 0) throw ValidationError('checkOR: value'+errors.reduce( (str, cur) => {return str+=("\n"+cur.error)}, ""));
    else return output[0].value;
  } else throw ValidationError('checkOR: expects an array of Props');
}

function checkAND(valueArray, prop) {
  //console.log('checkAnd on prop: \n',prop);
  if (Array.isArray(valueArray)) {
    result = valueArray.map( v => prop.check(v));
    return result
  } else throw ValidationError('checkAND: expects an array of values to check got');
}

var toString = function(obj) {
  return JSON.stringify(obj, null, 2);
}

/**
 * @type Prop - can own other props, or lists
 * @type string - the most basic props
 * @type propInfo - must be an object, must have propId at a minimum 
 * type information is merged into this to describe the context of the property
 * can also have constraint information as a constraint prop
 * @todo because this is essentially enforcing an equivalence relation
 * need to implement the reflexive property here. specifically for the case
 * where we're applying: @see {enforceArrayOnProp}.  So far, the Prop
 * enforces the is type === value, Prop === value, [Prop] === value, Prop === Prop, but
 * for enforceArrayOnProp is doing: value === Prop.  It works but
 * the getType doesnt address that case.  because it works for now in the check
 * not exactly super necessary to address it as a check, but the getType isn't returing
 * the information, so need the value of propInfo to take into account of
 * the type of Prop
 */
const Prop = function(type, check, constraint) {
  if (type === undefined) {
    throw new Error ('made undefined Prop, no bueno');
  }


  if (typeof(type)==='string') {
    this.type = Object.assign({},{type: type}, constraint);
    //if (Prop.prototype.onCreate) Prop.prototype.onCreate(this.type);
    // base type just runs the given check
  } else if (type instanceof Prop) {
    this.type = Object.assign({}, type.type, constraint);
    //if (Prop.prototype.onCreate) Prop.prototype.onCreate(this.type);
    // prop type, need to get the check func, and also
    // run the base check func;
  } else { };


  /**
   * @param {any} value - 
   */
  this.check = (value) => {
    if (value == null) throw ValidationError('NULL value, ');
    if (typeof(type)==='string') {
      var v = check(value);
      return v;
    } else {
      var v = type.check(value);
      var v = check(v);
      return v;
    }
  }
}

Prop.prototype.evalValue = (value) => {
  //return mathjs.eval(value);
  return value;
}


function getFileType(filename) {
  var jpg = /\.jpe?g$/i;
  var png = /\.png$/i;
  var mkv = /\.mkv$/i;
  var avi = /\.avi$/i;
  var mp4 = /\.mp4$/i;
  if (jpg.test(filename)) return 'jpg';
  if (png.test(filename)) return 'png';
  if (mkv.test(filename)) return 'mkv';
  if (avi.test(filename)) return 'avi';
  if (mp4.test(filename)) return 'mp4';
  //throw ValidationError('Unsupported filetype passed in: '+filename);
  return 'other';
}

var matchType = (name, type) => {
  var newname = parseConstant(name, Prop.prototype.constants)
  return getFileType(newname) === type ? {filename: newname, filetype: type} : false;
}
function getObjectPropTypes (obj) {
  if (Prop.prototype.onCreateObject) Prop.prototype.onCreateObject(obj);
  let out = {};
  Object.keys(obj).forEach( key => out[key] = obj[key].type );
  return {type: 'object', props: out};
}

// define prop types
var ValidProps = {
  isNotNull: new Prop('isNotNull', value => isNotNull(value)),
  true: new Prop('true', value => isTrue(value)),
  false: new Prop('false', value => isFalse(value)),
  string: new Prop('string', value => isStringValid(value)),
  number: new Prop('number', value => isNumberValid(value)),
  templateid: new Prop('template-id', value => value),
  templateprops: new Prop('template-props', value => value),
  object: obj => new Prop('object', value => isObjectValid(value, obj), getObjectPropTypes(obj)),
  anyOf: Props => new Prop('array', value => checkOR(value, Props), {
    constraint: 'anyOf', array: Props.map( p => p.type)
  }), 
  arrayOf: prop => new Prop('array', values => checkAND(values, prop), {value: prop.type, constraint: 'array'}),
  //onArray: prop => new Prop('array', arrayValues => arrayValues.map(v => prop.check(v)), {constraint: 'onArray', value: prop.type}),
}
const throwErr = (msg, value, constraint) => {
  throw ValidationError('Got ' + value + ' should be '+msg+" "+constraint);
}
var Numbers = { 
  lessThan: number => 
  new Prop(ValidProps.number, value => 
    value < number ? value : throwErr('lessThan', value, number), {constraint: 'lessThan', value: number}),
  moreThan: number =>
  new Prop(ValidProps.number, value => value > number ? value : throwErr('moreThan', value, number), {constraint: 'moreThan', value: number}),
  equalTo: number => 
  new Prop(ValidProps.number, value => value === number ? value : throwErr('equalTo', value, number), {constraint: 'equalTo', value: number}),
  ltEq: number => 
  new Prop(ValidProps.number, value => value <= number ? value : throwErr('ltEq', value, number), {constraint: 'lessThanOrEqual', value: number}),
  gtEq: number => 
  new Prop(ValidProps.number, value => value >= number ? value : throwErr('gtEq', value, number), {constraint: 'greaterThanOrEqual', value: number}),

  range: (min,max) => new Prop(ValidProps.number, value => {
    if ((value >= min) && (value <= max) && (min <= max)) return value;
    else throw ValidationError('Fail range on numbers min,max: '+min+', '+max+' with value of: '+JSON.stringify(value)+" ----- ");
  }, {constraint: 'range', value: {min: min, max: max}}),
}

/**
 * allows for setting specific values of the type string
 */
var Values = {
  string: {
    value: initial => new Prop(ValidProps.string, value => {
      var out = value === initial;
      if (out === false) return false;
      else return value;
    }, {value: initial}),
  },
}

var NewValues = {
  string: initial => 
  new Prop(ValidProps.string, value => {
    let out = initial === value ? value : false
    //throw new Error('does this run');
    //console.log('comparing strings', initial, ' against ', value, 'out ', out);
    if (out === false) throw ValidationError('Values.string', {expected: initial, given: value});
    return out;
  }, {constraint: 'match', value: initial}),
}

var AnyOf = {
  // the check happens is called inside the anyOf check function, but it calls the
  // Prop's check function, any children check functions should also be called there if needed,
  // but this is handled when the specific prop is made (like less than 7, the seven is already checked by that point)
  string: list => ValidProps.anyOf(list.map(s => Values.string.value(s))),
}

var png = new Prop('file', value => matchType(value, 'png'), {constraint: 'png'});
var jpg = new Prop('file', value => matchType(value, 'jpg'), {constraint: 'jpg'});
var mkv = new Prop('file', value => matchType(value, 'mkv'), {constraint: 'mkv'});
var mp4 = new Prop('file', value => matchType(value, 'mp4'), {constraint: 'mp4'});
var mov = new Prop('file', value => matchType(value, 'mov'), {constraint: 'mov'});
var other = new Prop('file', value => matchType(value, 'other'), {propId: 'other'});



const Media = {
  color: {
    rgba: new Prop('rgba', value => isRgbaValid(value), {propId: 'r-g-b-a'}),
  },
  file: {
    image: {
      png: png,
      jpg: jpg,
      any: ValidProps.anyOf([png,jpg]),
    },
    movie: {
      mkv: mkv,
      mp4: mp4,
      mov: mov,
      any: ValidProps.anyOf([mkv,mp4,mov])
    },
    other: other,
    filename: ValidProps.string
  }
}

/**
 * flattens Prop into a map
 */
exports.flattenProp = function (object) {
  let out = {};
  //console.log(' \n\n\n === start object : ',JSON.stringify(object, null, 2));

  if (object === null) return null;
  function deepScan (obj) {
    //console.log( 'what are we seeing here ',obj);
    Object.keys(obj).forEach (key => {
      // dont add type, constraint, props to list
      //if (['type', 'props', 'constraint', 'value', 'check'].indexOf(key) === -1) {
      if (obj[key].type && Array.isArray(obj) === false && key !== 'check') {
        out[key] = obj[key];
      }
      // still traverse the object though
      if (typeof(obj[key]) === 'object') {
        deepScan (obj[key]);
      } else if (Array.isArray(obj)) {
        for (let _element of obj) {
          deepScan(_element);
        }
      }
    })
  }
  deepScan(object);
  return out;
}


/**
 * for each nested template, and for each operation scan
 * any fillable field (calling it exportFields) using regex above.
 * extracts which operation, which field, and exportField name they belong to
 * for nested props, should be interesting
 */
function findMarkedExports (obj) {
	const regex = /{{[0-9A-Za-z_\-]+}}/;

	function recurseOp (op) {
		try {
			var keys = Object.keys(op);
			//var list = [];
			var retObj = {};
		} catch (e) {
			return [];
		}
		keys.forEach( key => {
			// check prop for mustache
			let val = op[key];
			if (typeof(val) === 'object') {
				//list = list.concat(recurseOp(val));
				retObj = Object.assign(retObj, recurseOp(val));
			} else if (typeof(val) === 'string') {
				if (val.match(regex)) {
					let str = val.match(regex)[0];
					let exportFieldName = str.replace("{{","").replace("}}","");
					//list = list.concat({parentProp: Object.keys(op)[0], prop: key, exportField: exportFieldName});
					retObj[exportFieldName] = {/*parentProp: Object.keys(op)[0],*/ fillsPropName: key};
				} else {
					retObj[key] = {/*parentProp: Object.keys(op)[0],*/ value: val};
				}
			}
		})
		//return list;
		return retObj;
	}

	return recurseOp(obj);
}

exports.parseObjectForConstants = parseObjectForConstants;
exports.Prop = Prop;
exports.Props = ValidProps;
exports.Props.AnyOf = AnyOf;
exports.Props.Numbers = Numbers;
exports.Props.Media = Media;
exports.Props.value = NewValues;
exports.util = {
  parseConstant: parseConstant,
	findMarkedExports: findMarkedExports,
}


