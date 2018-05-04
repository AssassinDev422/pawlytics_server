"use strict";

module.exports = function(sequelize, DataTypes) {
	const OrgUser = sequelize.define("OrgUser", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
	}, {
		// add updatedAt, createdAt, and don't really delete, but set deletedAt
		// though it appears it may be set globally
		timestamps: true, paranoid: true
	});

	OrgUser.associate = function(models) {     	
    // permissions
		OrgUser.belongsTo(models.Organization, {foreignKey: {allowNull: false}});
    // arbitrary
		OrgUser.belongsTo(models.AppUser, {foreignKey: {allowNull: false}});
	};

	return OrgUser;
};
