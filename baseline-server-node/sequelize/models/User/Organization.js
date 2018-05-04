
module.exports = function(sequelize, DataTypes) {
  var Organization = sequelize.define("Organization", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    isBlocked: { type: DataTypes.BOOLEAN },
  }, {
  })

  Organization.associate = function(models) {     	
    Organization.belongsTo(models.Address);
  }

  Organization.getUnique = args => {
    return new Promise ( (resolve, reject) => {
      return Organization.findAll ({
        where: args
      }, {
      }).then (result => {
        if (result.length !== 1) reject ({error: 'Organization.getUnique got more than one result'})
        else resolve (result[0]);
      })
    })
  }

  Organization.tryCreate = async function({models}, name) {
    try {
      let r = await models.Organization.findOrCreate({
        where: {
          name: name,
        },
        defaults: {
          name: name,
          isBlocked: false,
        }
      }).spread( await function(_org, wasCreated) {
        if (wasCreated===true) {
          return _org;
        } else {
          return {error: "Org already exists"}
        }
      })
      return r;
    } catch (e) {
      return {error: "Error creating org: "+e}
    }
  }


  return Organization;
};
