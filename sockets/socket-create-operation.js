const path = require('path');

const Validation = require('../baseline-server-node/testing/Validation.js');
const defineObj = Validation.Props.object;
const Props = Validation.Props;

exports.sockets = { 

  'create html definition': async function (db, {obj, title}, getSession) {
    try {
      let op = await db.Operation.findOne({where: {name: 'GenerateHtml'}});
      let opField = await db.OperationField.findOne({where: {name: title, OperationId: op.id}});
      if (opField) return " cant name an op with the same name twice for the same operation";
      else {
        let result = await db.Field.createFromProp(db, obj);
        let createdOpField = await db.OperationField.create({
          name: title, OperationId: op.id, FieldId: result.id
        });
        return createdOpField;
      }
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },

  'get generateHtml fields': async function (db, data, session) {
    try {
      let op = await db.Operation.findOne({
        where: {name: 'GenerateHtml'},
        include: [{model: db.Field}]
      });
			return op.getAllowedInputs(db);

			/*
      let fields = await db.OperationField.findAll({
        where: {OperationId: op.id},
        include: [{all: true}]
      });
      let children = await db.ChildField.findAll({
        where: {ParentFieldId: fields[0].FieldId},
        include: [{model: db.Field}]
      });
      return fields;
			*/
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  /** creates an operationField which has GenerateHtml as the parent prop */
  /* then use Template to create instantiations of that field */
  /**
   * fields: is a list of definitions, which this operation accepts, multiple fields is 
   * analogous to an OR, for AND relying on one templateField with children props, or other type rules like
   * allOf from Validation.js
   * name: is the name of the OperationField, rest are simply ChildFields of the field associated
   * with OperationField,
   * So in this instance: 
   * ================================================
   * -- GenerateHtml, is the operation, and defines what happens, in this case fill mustaches inside the html string, where each mustache is named after the ChildField name
   * -- name, is the name of the OperationField, and means, that its a type of input that Operation GenerateHtml takes,
   * -- each mustache inside template: is a ChildField of the OperationField... phew...
   *  ================================================
   * */
  // TODO: this needs to be moved into Operation or OperationField
  'make html template field': async function (db, 
    {name, htmlTemplate, description, fields}, getSession, globals) {
    // this goes into the data portion of the field
    // scan the htmlTemplate string for mustaches and
    // extract inputs
    const generateHtmlInputs = defineObj({
      name: Props.string,
      htmlTemplate: Props.string,
      description: Props.string,
    })
    // first make the fields
    let _fields = [];
    let _operationField = null;
    let _op = await db.Operation.findOne({
      where: {name: 'GenerateHtml'},
      include: [{model: db.Field}]
    });
    if (!_op) return "could not make this, GenerateHtml was not found";
    try {
      let _parentField = await globals.sequelize.transaction( async function(_t) {
        let __parentField = await db.Field.createFromProp(db, fields, {transaction: _t});
        let _newOpField = await db.Operation.createOpField(db, {
          name: name, OperationId: _op.id, FieldId: __parentField.id,
          defnObject: {
            htmlTemplate: htmlTemplate,
          }
        }, {transaction: _t})
        return __parentField;
      })
      if (_parentField) {
        let resultOpField = await db.OperationField.findOne({where: {
          OperationId: _op.id, FieldId: _parentField.id,
        },
          include: [{all: true}]
        })
        // note how need to get child fields to get propper description of 
        // this operation and what inputs it can take, where the parentField is the main
        // Field assigned directly to the OperationField and the Operation itself.
        let children = await db.ChildField.findAll({
          where: {ParentFieldId: _parentField.id},
          include: [{model: db.Field}]
        });
        return {OperationField: resultOpField, fields: children};
      } else return "ran into error, not created";
    } catch (e) {
      console.log('error ', e);
      return "not created"
    }
  },

}


