const fs = require('fs');
const path = require('path');
exports.yargs = () => require('yargs');
/**
 * @param baseDir - base dir to start search in
 * @param rejectRule - regex for files to ignore
 * @param acceptRule - regex for files to include
 */
exports.recursiveFileSearch = function ({baseDir, rejectRule = /OpsManager\.js|Operation\.js|index\.js|ignore|node_modules|(\.^)/, acceptRule = /\.js$|\.json$/, disableRecursion = true}) {
  var results = [];
  var rootDir = baseDir || __dirname;
  fs.readdirSync(rootDir).forEach( function(file) {
    var filepath = "";
    filepath = rootDir+path.sep+file;
    var stat = fs.statSync(filepath);
    if (stat && stat.isDirectory() && !rejectRule.test(filepath)) {
      if (disableRecursion === true) {
        //
      } else {
        results = results.concat(exports.recursiveFileSearch({baseDir: filepath}))
      }
    } else {
      if (!rejectRule.test(file) && acceptRule.test(file)) results.push({file: file, path: filepath})
    }
  })
  return results;
}

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'info' }),
    timestamp(),
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
  ]
});

const logger_error = createLogger({
  level: 'error',
  format: combine(
    label({ label: 'ERROR' }),
    timestamp(),
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
  ]
});

const getLogger = function (bindToScope, name = "") {
  const _logger = {
    info: (msg, obj) => logger.log({level: 'info', message: name+'  '+msg, data: obj}),
    error: (msg, obj) => logger_error.log({level: 'error', message: name+'  '+msg, data: obj}),
  }
  if (bindToScope) {
    bindToScope.log = _logger;
  } else {
    return _logger;
  }
}

exports.getLogger = getLogger;
