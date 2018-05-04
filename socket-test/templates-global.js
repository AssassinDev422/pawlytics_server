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
var createdTemplate = null;
var addedInputName = null;
exports.tests = [
  {
    'create template': {
      getInput: function(options) {
        return {
          name: 'Cool new form',
        };
      },
      isValid: function(returnedValue, options) {
        console.log( '\n\n\n\n\n output ', returnedValue);
        createdTemplate = returnedValue.template;
        return true;
      },

    }
  },
  {
    'get general form inputs': {
      getInput: function(options) {
        return {
        };
      },
      isValid: function(returnedValue, options) {
        console.log( '\n\n\n\n\n output---addedInput ', returnedValue);
        addedInputName = returnedValue[0].Field.name;
        return true;
      },

    }
  },
  {
    'add input to template': {
      getInput: function(options) {
        return {
          templateId: createdTemplate.id,
          inputName: addedInputName,
          inputData: {
            question: "silly question yo",
            answer: "{{answer1}}"
          },
        };
      },
      isValid: function(returnedValue, options) {
        console.log( '\n\n\n\n\n output ', returnedValue);
        addedInput = returnedValue[0];
        return true;
      },

    }
  },
  {
    'del input from template': {
      getInput: function(options) {
        return {
          templateId: createdTemplate.id,
          index: 0,
        };
      },
      isValid: function(returnedValue, options) {
        console.log( '\n\n\n\n\n output ', returnedValue);
        //addedInput = returnedValue[0];
        return true;
      },

    }
  },
]

socketTest.testSocketsAsList(exports.tests);
