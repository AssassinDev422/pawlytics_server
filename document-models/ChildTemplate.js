module.exports = function(sequelize, DataTypes) {
  const ChildTemplate = sequelize.define("ChildTemplate",
    {
    }, {
      timestamps: false
    });

  ChildTemplate.associate = function(models) {
    ChildTemplate.belongsTo(models.Template, {foreignKey: {allowNull: true, name: 'ParentTemplateId'}});
    //ChildTemplate.belongsTo(models.Template, {foreignKey: 'ParentTemplate'});
  }

  return ChildTemplate;
};
