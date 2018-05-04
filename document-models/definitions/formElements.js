'use strict';
const Validation = require('../../baseline-server-node/testing/Validation.js');
const Props = Validation.Props;
const defineObj = Validation.Props.object;

/**
 * this creates the most basic form elements which can be added to a template
 */
exports.createFormElements = async function (db) {
  const op = await db.schema.Operation.findOrCreate({where: {
    name: 'GeneralForm',
    description: 'Any OperationField with this operation as the association must provide a string which is the template and a map of key value pairs, where key is the name of the field, and value is the string that gets filled in there'}})
  let genForm = op[0];

  const shortAnswer = defineObj({
    question: Props.string,
    answer: Props.string,
  })
  let _shortAnswerOpInput = await genForm.defineInput(db, 'ShortAnswer', shortAnswer);  

  const toggle = defineObj({
    isSelected: Props.anyOf([
      Props.true,
      Props.false,
    ]),
    yesText: Props.string,
    noText: Props.string,
    yesValue: Props.string,
    noValue: Props.string,
    name: Props.string,
    className: Props.string,
  })
  let _toggleOpInput = await genForm.defineInput(db, 'Toggle', toggle);  

  const cardHeader = defineObj({
    className: Props.string,
    headerText: Props.string,
  })
  let _cardHeader = await genForm.defineInput(db, 'CardHeader', cardHeader);  


  const basicTextInputFields = defineObj({
    name: Props.string,
    inputValue: Props.string,
    className: Props.string,
  })
  await genForm.defineInput(db, 'BasicTextInput', basicTextInputFields);

  // some helper html stuff
  const genericHtml = defineObj({
    html: Props.string,
  })
  let _genericHtml = await genForm.defineInput(db, 'GenericHtml', genericHtml);
  _genericHtml.setTemplateString("{{html}}");

  const row = defineObj({
    className: Props.string,
  })
  let _row = await genForm.defineInput(db, 'Row', row);
  _row.setTemplateString("<div class=\"row\" {{className}}>\n");
}

exports.createAddressTemplate = async function (db) {
  return await db.schema.Template.findOrCreate({
    where: {name: 'Address'},
    defaults: {name: 'Address', templateJson: {}},
  }).spread(async function(template, wasCreated) {
    if (wasCreated===true) {
      let form = template;
      // TODO: this type should be handled by Template itself
      await form.defineInput(db.schema, 'GeneralForm', 'CardHeader', {
        className: " ", headerText: "Address",
      })

      // TODO: need to accept blank string as a blank string.. doesnt like that right now
      await form.defineInput(db.schema, 'GeneralForm', 'Row', {
        className: " ",
      })
      await form.defineInput(db.schema, 'GeneralForm', 'BasicTextInput', {
        name: "Street",
        className: "col-12",
        inputValue: "{{street}}",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'BasicTextInput', {
        name: "City",
        className: "col-sm-12 col-md-6 col-lg-4",
        inputValue: "{{city}}",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'BasicTextInput', {
        name: "State",
        className: "col-sm-12 col-md-6 col-lg-4",
        inputValue: "{{state}}",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'BasicTextInput', {
        name: "Zip",
        className: "col-sm-12 col-md-6 col-lg-4",
        inputValue: "{{zip}}",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'Toggle', {
        name: "Do you agree to disagree?",
        yesText: "Agree",
        noText: "Disagree", 
        yesValue: "true",
        noValue: "false",
        className: "col-12",
        isSelected: "{{isSelected}}",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'Toggle', {
        name: "Do you make shit up all the time?",
        yesText: "Hell yeah!",
        noText: "Meh", 
        yesValue: "true",
        noValue: "false",
        className: "col-12",
        isSelected: "{{isSelected}}",
      })

      // close row and card header 
      await form.defineInput(db.schema, 'GeneralForm', 'GenericHtml', {
        html: "</div></div></div>",
      })
    }
  })
}

exports.createFullNameTemplate = async function (db) {
  return await db.schema.Template.findOrCreate({
    where: {name: 'FullName'},
    defaults: {name: 'FullName', templateJson: {}},
  }).spread(async function(template, wasCreated) {
    if (wasCreated===true) {
      let form = template;
      // TODO: this type should be handled by Template itself
      await form.defineInput(db.schema, 'GeneralForm', 'CardHeader', {
        className: " ", headerText: "Full Name",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'Row', {
        className: " ",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'BasicTextInput', {
        name: "First Name",
        className: "col-sm-12 col-md-6 col-lg-4",
        inputValue: "{{firstName}}",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'BasicTextInput', {
        name: "Middle Name",
        className: "col-sm-12 col-md-6 col-lg-4",
        inputValue: "{{middleName}}",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'BasicTextInput', {
        name: "Last Name",
        className: "col-sm-12 col-md-6 col-lg-4",
        inputValue: "{{lastName}}",
      })

      await form.defineInput(db.schema, 'GeneralForm', 'GenericHtml', {
        html: "</div></div></div>",
      })
    }
  })
}
exports.createTemplates = async function (db) {
  return await db.schema.Template.findOrCreate({
    where: {name: 'Some sort of questionaire'},
    defaults: {name: 'Some sort of questionaire', templateJson: {id: 'memememe'}},
  }).spread(async function(template, wasCreated) {
    if (wasCreated===true) {
      let form = template;
      // TODO: this type should be handled by Template itself
      await form.defineInput(db.schema, 'GeneralForm', 'CardHeader', {
        className: " ", headerText: "Some sort of questionaire",
      })
      await form.defineInput(db.schema, 'GeneralForm', 'ShortAnswer', {
        question: "Recall the last time you had a predicament and explain how you unpredicamented it",
        answer: "{{answer1}}",
      })
      await form.defineInput(db.schema, 'GeneralForm', 'ShortAnswer', {
        question: "How do you explain yoga?",
        answer: "{{answer2}}",
      })
      await form.defineInput(db.schema, 'GeneralForm', 'ShortAnswer', {
        question: "What is your car?",
        answer: "{{answer3}}",
      })
      await form.defineInput(db.schema, 'GeneralForm', 'GenericHtml', {
        html: "</div></div>",
      })
    }
  })
}
