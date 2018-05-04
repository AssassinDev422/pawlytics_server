const socketTest = require('../../testing/TestCli.js');
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
var createdTemplate = null;
var addedInputName = null;
exports.tests = [
  {
    'logout': {
      getInput: function(options) {
        return {};
      },
      isValid: function(returnedValue, options) {
        createdTemplate = returnedValue.template;
        return true;
      },

    }
  },
]

socketTest.testSocketsAsList(exports.tests);
