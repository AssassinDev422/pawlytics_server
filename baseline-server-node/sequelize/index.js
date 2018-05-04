var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var lodash    = require('lodash');
var config    = require('../database.json')[process.env.NODE_ENV];
var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
var db        = {};



fs
.readdirSync(__dirname) //scan all the files in the given folder (__direname = currently folder)
	.filter(function(file) { // this filter takes all the js files (all the models)
		return ((file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) == '.js'));
	})
.forEach(function(file) { // takes evey file and create a model from each one and instet into db array
	var model = sequelize.import(path.join(__dirname, file));
	db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) { // check if the model have asociations with others models
	if (db[modelName].hasOwnProperty('associate')) {
		db[modelName].associate(db);
	}
});
//finally export the models 
module.exports = lodash.extend({
	sequelize: sequelize,
	Sequelize: Sequelize
}, db);
