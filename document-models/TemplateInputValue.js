'use strict';
/** @module TemplateFieldValue */
/**
 * this holds the value associates a fillable TemplateInput
 * to a User and the TemplateForm
 */
module.exports = function(sequelize, DataTypes) {
  const TemplateInputValue = sequelize.define("TemplateInputValue",
    {
      id:  { 
        type: DataTypes.INTEGER, primaryKey: true,
        autoIncrement: true,
      },
      value:  { type: DataTypes.STRING, allowNull: true }, 
    }, {
      timestamps: true
    });

  TemplateInputValue.associate = function(models) {
    TemplateInputValue.belongsTo(models.FormTemplate, {foreignKey: {allowNull: false}});
    TemplateInputValue.belongsTo(models.AppUser, {foreignKey: {allowNull: false}});
    TemplateInputValue.belongsTo(models.TemplateInput, {foreignKey: {allowNull: false}});
  }

  return TemplateInputValue;
};
