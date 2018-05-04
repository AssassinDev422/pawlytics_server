const socketTest = require('../baseline-server-node/testing/TestCli.js');
const Validation = socketTest.Validation;

const defineObj = Validation.Props.object;
const anyString = Validation.Props.string;
const Props = Validation.Props;


const testObjArray = Validation.Props.arrayOf(defineObj({
  name: Props.string, id: Props.isNotNull
}))

const testObj = defineObj({
  name: Props.string, id: Props.isNotNull,
  htmlTemplate: Props.string,
  description: Props.string,
})
// vars to help with testing
var projTemplate = null;
var template = null;
var opInput = null;
var formId = null;
var orgFormId = null;
exports.tests = [
  {
    'create form': {
      getInput: function(options) {
        return {
          formName: "Adoption Application",
          templateNames: ['Address', 'FullName'],
        };
      },
      isValid: function(returnedValue, options) {
        formId = returnedValue[0].FormId;
        return true;
      },

    }
  },
  {
    'create org form': {
      getInput: function(options) {
        return {
          formName: "Adoption Application For Org",
          templateNames: ['Address', 'FullName'],
        };
      },
      isValid: function(returnedValue, options) {
        orgFormId = returnedValue[0].FormId;
        return true;
      },

    }
  },
  // finds form and creates value fields for user
  {
    'create blank org form': {
      getInput: function(options) {
        return {
          formId: orgFormId,
          // uses the logged in user in this case
          userId: null,
        };
      },
      isValid: function(returnedValue, options) {
        template = returnedValue[0];
        return true;
      },

    }
  },
  {
    'render user form': {
      getInput: function(options) {
        return {
          formId: orgFormId,
          userId: null,
          notifyFuncName: 'app.valueUpdated',
        };
      },
      isValid: function(returnedValue, options) {
        template = returnedValue[0];
        return true;
      },

    }
  },
  /*
  {
    'render blank form by id': {
      getInput: function(options) {
        return {
          formId: formId
        };
      },
      isValid: function(returnedValue, options) {
        template = returnedValue[0];
        return true;
      },

    }
  },
  {
    'render blank form by name': {
      getInput: function(options) {
        return {
          formName: 'Adoption Application'
        };
      },
      isValid: function(returnedValue, options) {
        template = returnedValue[0];
        return true;
      },

    }
  },
  */
]

socketTest.testSocketsAsList(exports.tests);
