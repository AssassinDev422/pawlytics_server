'use strict';
/** describes the inputs to the template as whole operations
 * where TemplateOperation describies individual properties passed into these operations
 */
module.exports = function(sequelize, DataTypes) {
  const TemplateOperation = sequelize.define("TemplateOperation",
    {
			// if the field is prefilled, this is null
			// but if it is exposed to be prefilled this can't be null
			// so name, value will never both be null
      name:  { type: DataTypes.STRING, allowNull: true },
      id:  { 
        type: DataTypes.INTEGER, primaryKey: true,
        autoIncrement: true,
      },
      index:  { 
        type: DataTypes.INTEGER, allowNull: false, default: 0,
      },
    }, {
      timestamps: false
    });

  TemplateOperation.associate = function(models) {
    TemplateOperation.belongsTo(models.Template, {foreignKey: {allowNull: false}}); 
    TemplateOperation.belongsTo(models.OperationInput, {foreignKey: {allowNull: false}}); 
  }

  /*
   * this should be in TemplateOpInput
   *
  TemplateOperation.getFillableFields = async function(db, templateId) {
    return await db.TemplateOperation.findAll({
      where: {TemplateId: templateId, value: null},
    });
  }
  */


  return TemplateOperation;
};
