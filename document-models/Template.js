'use strict';
const Validation = require('../baseline-server-node/testing/Validation.js');
module.exports = function(sequelize, DataTypes) {
  const Template = sequelize.define("Template",
    {
      id:  { 
        type: DataTypes.INTEGER, primaryKey: true,
        autoIncrement: true,
      },
      name:  { type: DataTypes.STRING, allowNull: false, unique: 'name_of_template' },
      type:  { type: DataTypes.STRING },
      props: { type: DataTypes.JSON },
      description: { type: DataTypes.STRING },
      // contains the actual template json file
      // no other way of knowing the ordering of the templates and we need that
      // in order to recreate it as a json
      templateJson:  { 
        type: DataTypes.JSON,  
        allowNull: false,
        set(val) {
					let name = this.getDataValue('name');
					if (val.templates && val.operations && val.id) {
						this.setDataValue('templateJson', val);
					} else {
						this.setDataValue('templateJson', {
							id: name,
							templates: [],
							operations: [],
						});
					}
        }
      },
    }, {
      timestamps: false
    });

  /**
   * this is meant to run after operations and operationInputs are defined
   */
  Template.initSync = async function(dbApi) {
		let test = await Template.findOrCreate({
			where: {name: 'TestingTemplate'},
			defaults: {name: 'TestingTemplate', templateJson: {id: 'memememe'}},
		})
		let example = {name: "{{field-name}}", description: "this description never changes", b: "{{funky_blue}}"};
		await test[0].defineInput(dbApi.schema, 'GenerateHtml', 'Basic Form', example);
	}

  Template.associate = function(models) {
    // global templates do not belong to an org
    Template.belongsTo(models.Organization); 
  }

  Template.prototype.getOrgTemplates = async function (db, orgId) {
    if (orgId) {
      let org = await db.Organization.findById(orgId);
      if (org) {
        return await Template.findAll({where: {OrganizationId: org.id}});
      } else return null;
    } else return null;
  }

  Template.prototype.getGlobalTemplates = async function () {
    return await Template.findAll({where: {OrganizationId: null}});
  }

  /**
   * adds an operation input to an existing template using the operationInput definition
   * the propObject contains the values for inserting input into operationField, but can
   * declare templateFields by surrounding the value with {{name}} mustaches, where name
   * is the fillable field, and the key that points to it, is the source prop, and is used
   * to validate the future value which will be inserted
    * NOTE: TemplateField is either a static value or is fillable:
    * if it has a name: fillable, else static and will have FK to field
    * */

	Template.prototype.defineInput = async function (db, opName, opFieldName, propObject) {
		let tmlId = this.getDataValue('id');
		let _json = this.getDataValue('templateJson');
		let _ops = _json.operations;
		let newOpIndex = _ops.length;
		_ops = _ops.concat({[opName]: propObject});
		_json.operations = _ops;
		await Template.update({templateJson: _json}, {where: {id: tmlId}});
		let op = await db.Operation.findOne({
			where: {name: opName}
		})
		let opInput = await db.OperationInput.findOne({
      where: {OperationId: op.id, name: opFieldName},
      include: [{model: db.Field}],
		})
    if (opInput === null) {
      console.log (' opFieldName: ', opFieldName);
      throw new Error (' Could not find OperationInput with name of '+opFieldName);
    }
		let existingInputs = await db.TemplateInput.findAll({
      where: {TemplateId: tmlId},
		})
		let totalOperations = await db.TemplateOperation.findAll({
      where: {TemplateId: tmlId},
		})
    let newIndex = totalOperations.length;
		await db.TemplateOperation.create({
      TemplateId: tmlId,
      OperationInputId: opInput.id,
      index: newIndex,
		})
    // contains flattened input, Parent is main Field, children are all
    // fields in a flatened state (contains all possible nodes of the tree);
		let allFields = await opInput.Field.getChildren(db);
    let fields = allFields.map(c => c.dataValues.Field.dataValues);
		/**
		 * NOTE: exports out of template are values where they have fillsPropName, else they simply
		 * have value (when the operation prop remains a constant)
		 */
		const props = Validation.util.findMarkedExports(propObject);
		// add the TemplateFields, exportPropName is the name the template
		// decides to give this field
		// either case, all props must be matched to the op, else no bueno
		for (let key of Object.keys(props)) {
			let prop = props[key];
      // find the field this prop might belong to;
			if (prop.value) {
				let propName = key;
				//console.log('\n this is a constant value ', prop);
        let _match = fields.filter(f => f.name === key);
        //console.log (' match: ', _match[0]);
        await db.TemplateInput.create({
          TemplateId: tmlId, filledValue: prop.value, FieldId: _match[0].id,
          index: newIndex, //existingInputs.length,
          OperationInputId: opInput.id,
        });
			} else if (prop.fillsPropName) {
				let exportPropName = key;
				//console.log('\n this is export template field which is fillable ', prop);
        let _match = fields.filter(f => f.name === prop.fillsPropName);
        //console.log (' match: ', _match[0]);
        await db.TemplateInput.create({
          TemplateId: tmlId,
          name: key,
          FieldId: _match[0].id,
          OperationInputId: opInput.id,
          index: newIndex,
        });
			} else {
        //throw new Error (' error adding an operation to the template because the definition does not exist under the inputs given: '+key+ ', '+ prop.fillsPropName);
        console.log( ' warning did not find the prop, ', key, ' probably because it is set to empty string findMarkedExports returned: ', props);
			}
		}
		let inputProps = await db.OperationInput.findAll({
			where: {OperationId: op.id},
		})
		return inputProps;
	}

  Template.prototype.deleteDefinedInputByIndex = async function(db, index) {
		let tmlId = this.getDataValue('id');
		let _json = this.getDataValue('templateJson');
    let tmlFields = await db.TemplateInput.findAll({
      where: {TemplateId: tmlId, index: index},
    })
    let templateOps = await db.TemplateOperation.findAll({
      where: {TemplateId: tmlId, index: index},
    })
    //console.log(' number of matching to index ', index, ' to destroy: ',tmlFields.length);
    //console.log(' matching templateOperation ', templateOps.length);
    tmlFields.forEach( async function(_f) {
      //console.log('\n\n\n asked to delete ', _f.dataValues);
      await _f.destroy();
    })
    templateOps.forEach( async function(tmlop) {
      await tmlop.destroy();
    })
    //throw new Error (' this is incomplete and not fully working just yet');
  }


  /** @method getAllInputs */
  /**
   * @returns {object} where keys map to a list of TemplateInputs, this means that this list of TemplateInputs maps to the same OperationInput, and should be filled into the template together
   */
  Template.prototype.getAllInputs = async function (db) {
    let tmlId = this.getDataValue('id');
    // just get fields no values
    let onlyInputs = {
      where: {TemplateId: tmlId}, 
      include: [
        {model: db.Field},
      ]
    };
    let inputs = await db.TemplateInput.findAll(onlyInputs);

    let indexToInputMap = {};
    for (let _input of inputs) {
      if (indexToInputMap[_input.index]) {
        let _i = indexToInputMap[_input.index].inputs;
        indexToInputMap[_input.index].inputs = _i.concat(_input);
      } else {
        indexToInputMap[_input.index] = {
          inputs: [_input]
        }
      }
    }
    //console.log('indexToInputMap', JSON.stringify(indexToInputMap, null, 2));
    return indexToInputMap;
  }

  Template.prototype.createValuesForInputs = async function({models, Op}, 
    {
      organizationId, userId, formTemplateId,
    }) {
    let tmlId = this.getDataValue('id');
    // get only fillable inputs, thats where name is not null
    let onlyInputs = {
      where: {TemplateId: tmlId, name: {[Op.not]: null} }, 
      include: [
        //{model: models.Field},
      ]
    };
    let inputs = await models.TemplateInput.findAll(onlyInputs);
    let bulkValues = [];
    for (let tmlInput of inputs) {
      bulkValues = bulkValues.concat({
        TemplateInputId: tmlInput.id,
        AppUserId: userId,
        FormTemplateId: formTemplateId,
      })
    }
    // todo: not the best way to handle if they already exist at the moment
    // just returns existing
    try {
      let createdVals = await models.TemplateInputValue.bulkCreate(bulkValues);

      let r = await models.TemplateInputValue.findAll({
        where: {AppUserId: userId, FormTemplateId: formTemplateId},
        include: [{model: models.TemplateInput}]
      })
      return r;
    } catch (e) {
      let r = await models.TemplateInputValue.findAll({
        where: {AppUserId: userId, FormTemplateId: formTemplateId},
        include: [{model: models.TemplateInput}]
      })
      return r;
    }
  }

  /** @method fillTemplateString
   * meant to operate on the output of getAllInputs/getAllInputWithValues
   */
  Template.prototype.fillTemplateString = async function (db, indexToInputMap, notifyFuncName) {
    let tmlId = this.getDataValue('id');
    var tmloutput = "";
    for (let key of Object.keys(indexToInputMap)) {
      // the first one is when Form is doing preprocessing,
      // second one is for when Template does preprocessing
      let tmlInputs = indexToInputMap[key] || indexToInputMap[key].inputs;
      let resultStr = db.OperationInput.fillTemplateString(
        db, 
        tmlInputs[0].OperationInputId, 
        tmlInputs,
        {notifyFuncName: notifyFuncName},
      );
      tmloutput += resultStr;
    }
    return tmloutput;
  }

  Template.prototype.getHtml = async function ({models}, {values, userId, notifyFuncName}) {
    let indexToInputMap = await this.getAllInputs(models);
    return await this.fillTemplateString(models, indexToInputMap, notifyFuncName);
  }



  /** this is going to be deprecated and replaced by defineInput, et all
    * used by the init stage of importing templates */
  Template.getReferencedField = async function(templateId, templateFieldName) {
    let tml = await Template.findById(templateId);
    let matching = tml.TemplateFields.filter(f => f.TemplateField.name === templateFieldName);
    if (matching.length===1) return matching[0].FieldId;
    else return null;
  }

	// this is being replaced by generilized func defineInput
  Template.addOperationField = async function(db, templateName, operationField) {
    try {
      let tml = await db.Template.findOne({name: templateName});
      let json = tml.dataValues.templateJson;
      let op = await db.Operation.findById(operationField.OperationId);
      json.operations.push({[opName]: {}});
      await tml.update({templateJson: json});
      return await db.Template.findById(tml.id);
    } catch (e) {
      console.log('error ;',e);
      throw e;
    }
  }
	
  return Template;
};
