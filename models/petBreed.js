
const dogBreeds = require ('./config/dogs.json')

module.exports = function(sequelize, DataTypes) {
  const PetBreed = sequelize.define("PetBreed", {
    id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true},
    name: { type: DataTypes.STRING, unique: 'pet_breed_name_idx', allowNull: false },
  }, {
    // add updatedAt, createdAt, and don't really delete, but set deletedAt
    // though it appears it may be set globally
    timestamps: false, paranoid: true
  });

  PetBreed.initialization = function(db) {
    return db.schema.PetSpecies.findOne({where: {name: 'dog'}}).then ( dog => {
      return dogBreeds.map ( breed => {
        return db.schema.PetBreed.findOrCreate({
          where: {
            name: breed.name
          },
          defaults: {
            name: breed.name
          }}).then ( type => {
              //console.log(' made a dog... for you: ',dog, type[0].dataValues);
            return breed;
          })
      })
    }).catch ( errrr => {
      console.log (' Error during initialization of this stupid thing: ',errrr);
    })
  }
  return PetBreed;
};
