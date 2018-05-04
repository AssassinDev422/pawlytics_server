module.exports = function(sequelize, DataTypes) {
  const ChildField = sequelize.define("ChildField",
    {
      //name:  { type: DataTypes.STRING, allowNull: true },
    }, {
      timestamps: false
    });

  ChildField.associate = function(models) {
    //Field.belongsToMany(models.Prop, {through: 'FieldProp'})
    ChildField.belongsTo(models.Field, {foreignKey: {allowNull: false}});
    ChildField.belongsTo(models.Field, {as: 'ParentField', foreignKey: {allowNull: false}});
  }

  return ChildField;
};
