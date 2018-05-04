const path = require('path');

const Validation = require('../baseline-server-node/testing/Validation.js');
const defineObj = Validation.Props.object;
const Props = Validation.Props;

exports.sockets = { 

  'create template': async function (db, {name}, getSession) {
    try {
      let _tml = await db.Template.findOrCreate({
        where: {
          name: name,
          templateJson: {id: name},
        },
        defaults: {
          name: name,
          templateJson: {id: name},
        }
      }).spread( await function(template, wasCreated) {
        return {template: template, wasCreated: wasCreated};
      })
      return _tml;
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  'get global templates': async function (db, {}, getSession) {
    try {
      return await db.Template.findAll();
    } catch (e) {
      return e;
    }
  },
  'get general form inputs': async function (db, data, getSession) {
    try {
      let generalFormOp = await db.Operation.findOne({
        where: {name: 'GeneralForm'},
      })
      return await generalFormOp.getAllowedInputs(db);
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  'add input to template': async function (db, {templateId, inputName, inputData}, getSession) {
    try {
      let tml = await db.Template.findById(templateId);
      if (tml) {
        return await tml.defineInput(db, 'GeneralForm', inputName, inputData);  
      } else {
        throw new Error (' templateId '+templateId+' did not return any templates');
      }
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  'del input from template': async function (db, {templateId, index}, getSession) {
    try {
      let tml = await db.Template.findById(templateId);
      return tml.deleteDefinedInputByIndex(db, index);
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  /**
   * stopped here
   */
  /*
  'add operation field to template': async function (db, {
    templateName, exportFieldName, 
    operationFieldName,
  }, getSession) {
    try {
      let opField = await db.OperationField.findAll({
        where: {name: operationFieldName},
        include: [{all: true}]
      })
			let template = await db.Template.findOne({
				where: {name: templateName},
			})
			if (opField.length === 1 && template !== null) {
				await db.TemplateField.create({
					TemplateId: template.id, OperationFieldId: opField[0].id,
					name: exportFieldName,
				})
			} else {
				return "cant add because returned a number of fields other than 1";
			}
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
*/

  /**
   * creates an instantiation of a template, sets all values to null, 
   * attaches them to this template, now values can be stored
   */
  'create project template': async function (db, {TemplateId}, getSession) {
    try {
      let fields = await db.TemplateField.getFillableFields(db, TemplateId);
      let prjTml = await db.ProjectTemplate.create({
      })
      await prjTml.setTemplateFields(fields);
      return db.ProjectTemplate.findById(prjTml.id, {
        include: [{
          model: db.TemplateField,
          include: [{
            model: db.Field, attributes: ['id', 'type', 'value', 'constraint'] 
          }, {
            model: db.Template, attributes: ['id', 'name'],
          }] 
        }, /*{
          model: db.Template, attributes: ['id', 'name'],
        }*/]
      });
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
}


