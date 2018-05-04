module.exports = function(sequelize, DataTypes) {
  var Pet = sequelize.define("Pet", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
		name: { type: DataTypes.STRING },
		color: { type: DataTypes.STRING },
		specialMarkings: { type: DataTypes.STRING },
		textArea: { type: DataTypes.TEXT  },
		ageYears: { type: DataTypes.INTEGER },
		ageMonths: { type: DataTypes.INTEGER },
		ageWeeks: { type: DataTypes.INTEGER },
		intakeDate: {type: DataTypes.DATEONLY },
		weight: {type: DataTypes.FLOAT},
		location: {type: DataTypes.STRING},
		status: {type: DataTypes.STRING},
		outOfDate: {type: DataTypes.DATEONLY},
		foodBrand: {type: DataTypes.STRING},
		foodAmount: {type: DataTypes.STRING},
		foodPerDay: {type: DataTypes.INTEGER},
		instructions: {type: DataTypes.STRING},
		isSpecialNeeds: {type: DataTypes.BOOLEAN},
		// not using this, but keeping this for reference
		/*
			petBreedId: {
			type: DataTypes.INTEGER,
			references: {
			key: 'petBreedId',
			model: sequelize.models.PetBreed
			}
			},
			animalTypeId: {
			type: DataTypes.INTEGER,
			references: {
			key: 'animalTypeId',
		// can't use models.AnimalType, lame
		model: sequelize.models.AnimalType,
		}
		},
		*/
	}, {
	})

	Pet.associate = function(models) {     	
		Pet.belongsTo(models.PetSpecies);
		Pet.belongsTo(models.PetBreed);
    Pet.belongsTo(models.Organization);
	}

	return Pet;
};
