'use strict';
/** @module FormTemplate */
/**
 * This exists for reusability of templates in forms, so for example
 * if there is a template for filling in an address, no sense in having to
 * recreate it all the time
 * parent object is the Form
 */
module.exports = function(sequelize, DataTypes) {
  const FormTemplate = sequelize.define("FormTemplate",
    {
      id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // order probs matters
      index : {
        type: DataTypes.INTEGER,
      },
    },{
      timestamps: false
    });

  FormTemplate.associate = function(models) {
    FormTemplate.belongsTo(models.Template, {foreignKey: {allowNull: false}});
    FormTemplate.belongsTo(models.Form, {foreignKey: {allowNull: false}});
  }

  return FormTemplate;
};
