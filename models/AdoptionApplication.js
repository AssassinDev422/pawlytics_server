/** @todo this needs to be done still, just placeholder */
module.exports = function(sequelize, DataTypes) {
  var AdoptionApplication = sequelize.define("AdoptionApplication", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
  }, {
  })

  AdoptionApplication.associate = function(models) {     	
    AdoptionApplication.belongsTo(models.Person, {as: 'Adopter'});
    AdoptionApplication.belongsTo(models.Pet);
    AdoptionApplication.belongsTo(models.Organization);
  }

  return AdoptionApplication;
}
