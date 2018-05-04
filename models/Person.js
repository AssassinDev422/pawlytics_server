"use strict";

module.exports = function(sequelize, DataTypes) {
	const Person = sequelize.define("Person",
			{
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
				lastname:  { type: DataTypes.STRING, allowNull: false },
				firstname: { type: DataTypes.STRING, allowNull: false },
				middlename: { type: DataTypes.STRING, allowNull: true },
				birthDate: { type: DataTypes.DATE, allowNull: true },
				email: { 
          type: DataTypes.STRING, allowNull: true,
          validate: { isEmail: true }
        },
				phone: { type: DataTypes.STRING, allowNull: true },
				//type: { type: DataTypes.ENUM('employee','volunteer'), allowNull: true },
        // could not get enums to work so moving on for now
        type: { 
          type: DataTypes.STRING,
          validate: {
            is: ["^(employee|user|volunteer)$"]
          }
        }
			});

	Person.associate = function(models) {     	
		Person.belongsTo(models.Address);
		//Person.belongsTo(models.AppUser);
    // this is not working very well with org.belngsToMany relationship
    // and trying to do: Person.setEmployer, but then don't have anything from the other side
    // like Org.getEmployees comes up empty
		Person.belongsTo(models.Organization);
	};


	return Person;
};
