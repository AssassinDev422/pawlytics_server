'use strict';

const Validation = require('../baseline-server-node/testing/Validation.js');

module.exports = function(sequelize, DataTypes) {
	const Field = sequelize.define("Field",
		{
			name:  { type: DataTypes.STRING, allowNull: false },
			type:  { type: DataTypes.JSON, allowNull: false},
			value:  { type: DataTypes.JSON, allowNull: true},
			constraint:  { type: DataTypes.JSON, allowNull: true},
			// contains the full defn, this is honestly just for debugging, and because 
			// the defn is recursive. gotta stop somewhere
			definition:  { type: DataTypes.JSON, allowNull: true},

		}, {
			timestamps: false
		});


	Field.createFromProp = async function (models, prop, options = {}) {
		try {
			var _flatDefn = Validation.flattenProp(prop);
			let _flatPropList = [];
			let createdProps = [];
			for (let _key of Object.keys(_flatDefn)) {
				let _defn = _flatDefn[_key]; 

				try {
					const _p = await Field.create({
						name: _key,
						constraint: _defn.constraint, value: _defn.value,
						type: _defn.type || typeof(_defn),
						definition: _defn, // in case I run into array
					}, options)
					createdProps = createdProps.concat(_p.dataValues);
				} catch (e) {
					console.log(' \n\n Unable to create ================ ', _key, ': with defn: ', _defn);
					console.log(e);
					return e;
				}
			}

			// enter child props, 0 is the parent
			let createdChildren = [];
			createdProps.forEach( async function ( prop, index ) {
				if (index > 0) {
					let _child = await models.ChildField.create({FieldId: prop.id, ParentFieldId: createdProps[0].id}, options);
					createdChildren.push(_child.dataValues);
				}
			})
			return createdProps[0];
		} catch (e) {
			throw e;
		}
	}

	Field.prototype.getChildren = async function(db) {
		let fieldId = await this.getDataValue('id');
		return await db.ChildField.findAll({
			where: {ParentFieldId: fieldId},
			include: [{model: db.Field}],
		})
	}

	return Field;
};
