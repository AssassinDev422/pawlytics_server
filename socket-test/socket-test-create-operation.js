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
exports.tests = [
  /*
  {
    'create html definition': {
      getInput: function(options) {
        return {obj: testObj, title: 'input'};
      },
      isValid: function(returnedValue, options) {
        console.log( ' output ', returnedValue);
        return true;
      },


      define: Validation.Props.arrayOf(defineObj({
        name: Props.string, id: Props.isNotNull
      })),
    }
  },
  */
  {
    'get generateHtml fields': {
      getInput: function(options) {
        return {obj: testObj, title: 'input'};
      },
      isValid: function(returnedValue, options) {
        //console.log( ' output ', returnedValue);
        return true;
      },

      /*
      define: Validation.Props.arrayOf(defineObj({
        name: Props.string, id: Props.isNotNull
      })),
      */
    }
  },
	/*
  {
    'make html template field': {
      getInput: function(options) {
        return {
          name: 'Odd Form',
          htmlTemplate: ' <div><div> {{title}} </div><div> {{question}} </div><div> {{answer}} </div><div> {{quantity}} </div></div>',
          description: 'This is a very long description of this interesting form',
          fields: 
          defineObj({
            title: Props.string,
            question: Props.string,
            answer: Props.string,
            quantity: Props.number
          })

        };
      },
      isValid: function(returnedValue, options) {
        console.log( '----------------------------- output ', returnedValue);
        return true;
      },
    }
  },
  {
    'get generateHtml fields': {
      getInput: function(options) {
        return {};
      },
      isValid: function(returnedValue, options) {
        //console.log( ' output ', returnedValue);
        return true;
      },

    }
  },
	*/
]

socketTest.testSocketsAsList(exports.tests);
