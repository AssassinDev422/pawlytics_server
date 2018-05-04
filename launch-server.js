const path = require('path')
/**
 * This is a sample server configuration script.
 * It must be copied and inserted into your project's directory and is
 * The goal here is to keep this in your project directory and spin up 
 * services or custom initialization scripts about which the base node server
 * doesn't know nor needs to know
 */


/** always set your environment outside of this so we dont deploy a 
 * dev server by accident
 */
const NODE_ENV = process.env.NODE_ENV;
if (NODE_ENV == null) throw new Error ('NODE_ENV is not set, you must set either production or development');
else if (NODE_ENV==='development') {
}

const project_config = {
  // the full dir your project is in, (so same dir as this file)
  HOME_DIR: __dirname,
  DB: require(__dirname+path.sep+'database.json')[NODE_ENV].db,
  socketPort: 3003,
}
/**
 * full path to base server directory
 */
const SERVER_PATH = __dirname+path.sep+'baseline-server-node';

/**
 * Your socket handler directory
 */
const SOCKET_HANDLERS_PATH = __dirname+path.sep+'sockets';

/**
 * Start up the server
 */
const MODELS_PATH = __dirname+path.sep+'models';
require(SERVER_PATH+path.sep+'server.js').Start({
  db_info: Object.assign(
    require(__dirname+path.sep+'database.json')[NODE_ENV].db,
    {logging: false},
  ),
  onDbReady: async function(db) {
    const initTemplates = require('./document-models/definitions/formElements.js')
    await db.schema.Form.loadApi();
    //return;
    await initTemplates.createFormElements(db);
    await initTemplates.createTemplates(db);
    await initTemplates.createAddressTemplate(db);
    await initTemplates.createFullNameTemplate(db);
    // load the html templates for the forms
    let templates = db.Utils.recursiveFileSearch({
      baseDir: path.join(__dirname, 'document-html-templates'),
      acceptRule: /\.html$/, rejectRule: /\.json$/,
      disableRecursion: true
    })
    //console.log('templates', templates);
    db.schema.OperationInput.loadTemplateStringsFromListSync(db, templates);
    //console.log('template htmls', db.schema.OperationInput.prototype.templateString);

  },
  projectModels: [
    __dirname+path.sep+'models',
    __dirname+path.sep+'document-models',
  ],
  socketPort: 3003,
  socketHandlers: [
    { path: SOCKET_HANDLERS_PATH },
    { path: path.join(SOCKET_HANDLERS_PATH,'site-admin') },
    { path: path.join(SOCKET_HANDLERS_PATH,'org-admin') },
    { path: path.join(SOCKET_HANDLERS_PATH,'org-member') },
    { path: path.join(SOCKET_HANDLERS_PATH,'testing-only') },
  ],
  onLogin: user => {
    return Promise.resolve(true);
  },
}).then ( r => {
  console.log (' ready to rock and roll ', r);
})

