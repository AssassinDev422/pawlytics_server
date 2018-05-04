module.exports = function(sequelize, DataTypes) {
	const PetInfo = sequelize.define("PetInfo", {
	}, {
		// add updatedAt, createdAt, and don't really delete, but set deletedAt
		// though it appears it may be set globally
		timestamps: false, paranoid: true
	});

	return PetInfo;
}
