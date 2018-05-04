module.exports = function(sequelize, DataTypes) {
  var DoNotAdopt = sequelize.define("DoNotAdopt", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reason: {
      type: DataTypes.STRING, allowNull: false
    },
    notes: {
      type: DataTypes.STRING, allowNull: true
    },
  }, {
  })
  
  DoNotAdopt.associate = function(models) {     	
    DoNotAdopt.belongsTo(models.Person, {as: 'EnteredByPerson'});
    DoNotAdopt.belongsTo(models.Person, {as: 'Adopter'});
    DoNotAdopt.belongsTo(models.Organization);
    DoNotAdopt.belongsTo(models.AdoptionApplication);
  }

  return DoNotAdopt;
}
