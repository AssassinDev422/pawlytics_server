"use strict";

/**
 * Each AppUser is given a UserGroup id
 */
module.exports = function(sequelize, DataTypes) {
  var AppUserGroup = sequelize.define("AppUserGroup", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: { type: DataTypes.STRING, unique: 'user_group_name_idx' , allowNull: false }
  }, {
    // add updatedAt, createdAt, and don't really delete, but set deletedAt
    // though it appears it may be set globally
    timestamps: false, paranoid: true
  })

  AppUserGroup.associate = function(models) {     	
    AppUserGroup.belongsToMany(models.AppAction, {through: 'AppActionACL'});
    //AppUserGroup.belongsTo(models.AppUser);
  }

  return AppUserGroup;
};
