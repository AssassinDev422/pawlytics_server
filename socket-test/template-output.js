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
exports.tests = [
  /*
  {
    'get general form inputs': {
      getInput: function(options) {
        return {
        };
      },
      isValid: function(returnedValue, options) {
        console.log( '\n\n\n\n\n output---addedInput ', returnedValue[0]);
        opInput = returnedValue[0];
        return true;
      },

    }
  },
  */
  {
    'preview form': {
      getInput: function(options) {
        return {
          templateId: 1
        };
      },
      isValid: function(returnedValue, options) {
        template = returnedValue[0];
        return true;
      },

    }
  },
]

socketTest.testSocketsAsList(exports.tests);
