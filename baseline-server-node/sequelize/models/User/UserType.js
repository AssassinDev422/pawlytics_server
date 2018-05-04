"use strict";

module.exports = function(sequelize, DataTypes) {
	const UserType = sequelize.define("UserType", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
		name: { type: DataTypes.STRING, unique: 'user_type_idx', allowNull: false},
	}, {
		// add updatedAt, createdAt, and don't really delete, but set deletedAt
		// though it appears it may be set globally
		timestamps: false, paranoid:false 
	});

	return UserType;
};
