const socketTest = require('../baseline-server-node/testing/TestCli.js');
const Validation = socketTest.Validation;

const defineObj = Validation.Props.object;
const anyString = Validation.Props.string;
const Props = Validation.Props;


// vars to help with testing
var templates = [];
var field = null;
exports.tests = [
  {
    'create test field': {
      getInput: function(options) {
        let obj = defineObj({
          name: Props.string, id: Props.number
        });
        return obj;
      },
      isValid: function(returnedValue, options) {
        return true;
      },
    }
  },
  {
    'create test field': {
      getInput: function(options) {
        let anyofobj = Props.anyOf([
          defineObj({
            name: Props.string, id: Props.number
          }),
          defineObj({
            title: Props.string, id: Props.number
          }),
        ])
        return anyofobj;
      },
      isValid: function(returnedValue, options) {
        field = returnedValue
        return true;
      },
    }
  },
  {
    'get field': {
      getInput: function(options) {
        return field.id;
      },
      isValid: function(returnedValue, options) {
        return true;
      },
    }
  },
]

socketTest.testSocketsAsList(exports.tests);
