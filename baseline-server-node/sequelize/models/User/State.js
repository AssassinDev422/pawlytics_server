"use strict";

var stateList = require ('./config/states_titlecase.json');


module.exports = function(sequelize, DataTypes) {
  var State = sequelize.define("State", {
    //stateId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: { type: DataTypes.STRING, unique: 'state_name_idx', allowNull: false },
    longName: { type: DataTypes.STRING, allowNull: false },
  });

  State.initialization = function(){    
    var states = [];
    let len = stateList.length;
    for (var i = 0; i < len; i++) {
      states.push( State.findOrCreate({
        where: {
          name: stateList[i].abbreviation,
          longName: stateList[i].name
        }, 
        defaults: { 
          name: stateList[i].abbreviation,
          longName: stateList[i].name
        } 
      }))	
    }
    return Promise.all(states);
  }

  State.get = name => {
    if (name == null) return Promise.resolve(null)
    else {
      return State.findAll({where: {name: {$iLike: name}}}).then ( r => {
        if (r.length === 1) {
          return r[0];
        } else {
          return State.findAll({where: {longName: {$iLike: name}}}).then ( r => {
            if (r.length === 1) return r[0];
            else return null;
          })
        }
      })
    }
  }


  return State;
};
