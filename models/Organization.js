
module.exports = function(sequelize, DataTypes) {
  var Organization = sequelize.define("Organization", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    isBlocked: { type: DataTypes.BOOLEAN },
  }, {
  })

  Organization.associate = function(models) {     	
    Organization.belongsTo(models.Address);
    Organization.belongsToMany(models.Person, {through: 'OrgPeople'});
    Organization.belongsToMany(models.Pet, {through: 'OrgPets'});
    // Document is instantiation of Template
    //Organization.belongsToMany(models.Document, {through: 'OrgDocument'});
  }

  Organization.initialization = function () {
    return Organization.findOrCreate({
      where: {name: "Test Organization for Puppies ONLY"},
      defaults: {name: "Test Organization for Puppies ONLY"}
    })
  }

  Organization.getUnique = args => {
    return new Promise ( (resolve, reject) => {
      return Organization.findAll ({
        where: args
      }, {
        include: [
          {model: db.Address}
        ],
      }).then (result => {
        if (result.length !== 1) reject ({error: 'Organization.getUnique got more than one result'})
        else resolve (result[0]);
      })
    })
  }

  return Organization;
};
