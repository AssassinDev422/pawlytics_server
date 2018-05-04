const path = require('path');

const Validation = require('../baseline-server-node/testing/Validation.js');
const defineObj = Validation.Props.object;
const Props = Validation.Props;

exports.sockets = { 

  'create usertype': async function (db, {name}, getSession) {
    try {
      let _tml = await db.UserType.findOrCreate({
        where: {
          name: name,
        },
        defaults: {
          name: name,
        }
      }).spread( await function(userType, wasCreated) {
        return {userType: userType, wasCreated: wasCreated};
      })
      return _tml;
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
}


