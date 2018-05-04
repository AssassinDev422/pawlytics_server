module.exports = function(sequelize, DataTypes) {
  var PetSpecies = sequelize.define("PetSpecies", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: { type: DataTypes.STRING, unique: 'pet_species_name', allowNull: false },
  }, {
    name: {singular: 'PetSpecies'},
  })

  PetSpecies.initialization = function(db) {     	
    const animalTypes = require ('./config/animalTypes.json');
    let promises = [];
    let len = animalTypes.length;
    for (var i = 0; i < len; i++) {
      promises.push(
        db.schema.PetSpecies.findOrCreate({
          where : {
            name: animalTypes[i].name 
          }, 
          defaults: { 
            name: animalTypes[i].name 
          } 
        }))
    }
  }

  return PetSpecies;
};
