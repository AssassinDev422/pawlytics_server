"use strict";

module.exports = function(sequelize, DataTypes) {
	const Address = sequelize.define("Address",
		{
			address1: DataTypes.STRING,
			address2: DataTypes.STRING,
			city: DataTypes.STRING,
			zip: DataTypes.INTEGER,
		});

	Address.associate = function(models) {     	
		Address.belongsTo(models.State);
	};

  /**
   * Returns the addressId after making the address
   */
  Address.makeAddress = fields => {
    return sequelize.models.State.get(fields.state).then ( state => {
      return Address.create({
        address1: fields.address1,
        address2: fields.address2,
        city: fields.city,
        zip: fields.zip
      }).then( address => address.setState(state)).then( result => result);
    })
  }

  // not done yet
  Address.updateAddress = (addressObj, fields) => {
    if (fields.state) return sequelize.models.State.get(fields.state).then ( state =>
      addressObj.setState(state)).then ( updatedAddress => updatedAddress.update(fields))
    else return addressObj.update(fields);
  }

	return Address;
};
