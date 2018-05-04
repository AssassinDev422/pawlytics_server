"use strict";

module.exports = function(sequelize, DataTypes) {
	const AppUserType = sequelize.define("AppUserType", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
		name: { type: DataTypes.STRING, unique: 'user_type_idx', allowNull: false},
	}, {
		timestamps: false, paranoid:false 
	});

	AppUserType.associate = function(models) {     	
		AppUserType.belongsTo(models.AppUser, {foreignKey: {allowNull: false}});
		AppUserType.belongsTo(models.UserType, {foreignKey: {allowNull: false}});
	};

	return AppUserType;
};
