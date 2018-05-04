module.exports = function(sequelize, DataTypes) {
  const TemplateInput = sequelize.define("TemplateInput",
    {
			// if the field is prefilled, this is null
			// but if it is exposed to be prefilled this can't be null
			// so name, value will never both be null
      name:  { type: DataTypes.STRING, allowNull: true },
      id:  { 
        type: DataTypes.INTEGER, primaryKey: true,
        autoIncrement: true,
      },
			// for fields which are prefilled, this is not null
			filledValue: {
				type: DataTypes.STRING, allowNull: true,
			},
			defaultValue: {
				type: DataTypes.STRING, allowNull: true,
			},
			// the the order of the operations in a template is important
      index:  { 
        type: DataTypes.INTEGER, allowNull: false, default: 0,
      },
    }, {
      timestamps: false
    });

  TemplateInput.associate = function(models) {
    TemplateInput.belongsTo(models.Template, {foreignKey: {allowNull: false}}); 
    TemplateInput.belongsTo(models.Field, {foreignKey: {allowNull: true}}); 
    // when false, it must have a filledValue
    TemplateInput.belongsTo(models.OperationInput, {foreignKey: {allowNull: true}}); 
    TemplateInput.belongsToMany(models.AppUser, {through: models.TemplateInputValue})
  }

  /*
   * this should be in TemplateOpInput
   *
  TemplateInput.getFillableFields = async function(db, templateId) {
    return await db.TemplateInput.findAll({
      where: {TemplateId: templateId, value: null},
    });
  }
  */


  return TemplateInput;
};
