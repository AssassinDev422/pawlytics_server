'use strict';
const Validation = require('../baseline-server-node/testing/Validation.js');
const Props = Validation.Props;
const defineObj = Validation.Props.object;

module.exports = function(sequelize, DataTypes) {
	const Operation = sequelize.define("Operation",
		{
			id:  { 
				type: DataTypes.INTEGER, primaryKey: true,
				autoIncrement: true,
			},
			name:  { type: DataTypes.STRING, unique: 'operation_name_idx', allowNull: false},
			data:  { type: DataTypes.JSON, allowNull: true},
			description:  { type: DataTypes.STRING, allowNull: true},
			// almost always an object, else its a oneOf, anyOf etc, which means its an array
		}, {
			timestamps: false
		});


  /**
   * takes a string, and values where key's are the fields to replace values with
   * the template string should indicate fields with mustaches: {{fieldName}}
   *
   * to get the string to fill, it must be found inside
   * OperationInput.prototype.templateString, shouldn't be that many in total
   */
  Operation.prototype.fillTemplateString = function (values, operationInput) {
    let str = operationInput.getTemplateString();
    throw new Error (' TODO not implemented ');
  }


  /**
   * defines legal input for a given operation
   * creates a OperationInput entry
   * all operations can have many of these, here we have to create
   * the validation information and the flattened Fields, including the parent field
   * which goes into the OperationInput as the field
   * also checks to make sure that were not creating multiple fields
   */
  Operation.prototype.defineInput = async function (dbApi, inputName, propObject, data = null) {
    const db = dbApi.schema;
    let opId = this.getDataValue('id');
    // check to make sure that inputName doesnt already exist
    let existing = await db.OperationInput.findOne({
      where: {name: inputName, OperationId: opId},
    })
    if (existing) return existing;
    else {
      // first make the fields
      let _fields = [];
      let _operationField = null;
      try {
        let resultOpInput = await dbApi.sequelize.transaction( async function(_t) {
          let __parentField = await db.Field.createFromProp(db, 
            {[inputName]: propObject.type}, 
            {transaction: _t}
          );
          let _newOpInput = await db.OperationInput.create({
            name: inputName, OperationId: opId, FieldId: __parentField.id,
            data: data,
          }, {transaction: _t})
          return _newOpInput;
        })
        return resultOpInput;
      } catch (e) {
        console.log('error ', e);
        return null; 
      }
    }
  }


		/** this is being depracated replaced by defineInput */
		Operation.createOpField = async function (db, opFieldProps, options = {}) {
			let f = await db.OperationField.findOne({where: {
				name: opFieldProps.name, 
				OperationId: opFieldProps.OperationId
			}}); 
			if (f) {
				throw new Error (' Tried to add field '+opFieldProps.name+' but a field by that name already exists ');
			} else {
				let _newOpField = await db.OperationField.create(opFieldProps, options); 
				return _newOpField;
			}
		}

		/**
		 * for every input that this type of operation takes (which is the list of OperationFields)
		 * Field row is the whole definition, ChildFields are the actual inputs, the number of ChildFields
		 * dictates the number of inputs for this particular input that the operation takes
		 */
		Operation.prototype.getAllowedInputs = async function (db) {
			let opId = await this.getDataValue('id');
			let allowedInputs = await db.OperationInput.findAll({
				where: {OperationId: opId},
				include: [{model: db.Field}]
			});
			let out = allowedInputs.map( async function (opField) {
				let c = await opField.Field.getChildren(db);
				return {Field: opField.Field, ChildFields: c};
			})
      return Promise.all(out);
		}

		Operation.associate = function(models) {
			Operation.belongsToMany(models.Field, {through: 'OperationInput'})
			//Field.belongsTo(models.Operation, {foreignKey: {allowNull: false}});
		}
		return Operation;
	};
