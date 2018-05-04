'use strict';

/**
 * Basically the actual value from an instantiated template (ProjectTemplate) by a user
 */
module.exports = function(sequelize, DataTypes) {
  const Value = sequelize.define("Value",
    {
      id:  { 
        type: DataTypes.INTEGER, primaryKey: true,
        autoIncrement: true,
      },
      value:  { 
        type: DataTypes.STRING, allowNull: true,
      },
    }, {
      timestamps: false
    });

  /**
   * tie table between ProjectTemplate (instantiation of Template) and Field
   * has the actual value which a Field should hold
   */
  Value.associate = function(models) {
    Value.belongsTo(models.AppUser, {foreignKey: {allowNull: false}});
    Value.belongsTo(models.TemplateInput, {foreignKey: {allowNull: false}});
    /*
    Value.belongsTo(models.ProjectTemplate, {foreignKey: {allowNull: false}});
    Value.belongsTo(models.Project, {foreignKey: {allowNull: false}});
    Value.belongsTo(models.TemplateField, {foreignKey: {allowNull: false}});
    */
  }
  return Value;
};
