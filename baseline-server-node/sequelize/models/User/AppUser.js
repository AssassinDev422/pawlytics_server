"use strict";

module.exports = function(sequelize, DataTypes) {
	const AppUser = sequelize.define("AppUser", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    lastname:  { type: DataTypes.STRING, allowNull: false },
    firstname: { type: DataTypes.STRING, allowNull: false },
		username: { type: DataTypes.STRING, unique: 'username_idx', allowNull: true},
		active: { type:DataTypes.BOOLEAN, defaultValue: true },
		hash: DataTypes.STRING,
		salt: DataTypes.STRING,
	}, {
		// add updatedAt, createdAt, and don't really delete, but set deletedAt
		// though it appears it may be set globally
		timestamps: true, paranoid: true
	});

	AppUser.associate = function(models) {     	
    // permissions
		AppUser.belongsTo(models.AppUserGroup);
    // arbitrary
		AppUser.belongsTo(models.UserType);
	};

  AppUser.createOrgUser = async function({sequelize, models}, {
    username, firstname, lastname, OrganizationId, userTypeName, AppUserGroupId,
  }) {
    try {
      const user = await sequelize.transaction(async function (t) {
        let userType = await models.UserType.findOrCreate({
          where: {name: userTypeName},
          defaults: {name: userTypeName},
          transaction: t,
        })
        let appUser = await models.AppUser.create({
          username: username,
          firstname: firstname,
          lastname: lastname,
          UserTypeId: userType.id,
          AppUserGroupId: AppUserGroupId,
        }, {transaction: t})
        let orgUser = await models.OrgUser.create({
          AppUserId: appUser.id, OrganizationId: OrganizationId,
        }, {transaction: t})
      })
    } catch (e) {
      throw e;
    }
  }

  return AppUser;
};
