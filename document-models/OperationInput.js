'use strict';
const strutils = require('../baseline-server-node/utils/string-parsing.js');
const fs = require('fs');

/**
 * allowed inputs to an operation
 */
module.exports = function(sequelize, DataTypes) {
  const OperationInput = sequelize.define("OperationInput",
    {
      id:  { 
        type: DataTypes.INTEGER, primaryKey: true,
        autoIncrement: true,
      },
      /** the named field of the operation which it exports */
      name:  { type: DataTypes.STRING, allowNull: false},
      data:  { type: DataTypes.JSON, allowNull: true},

    }, {
      timestamps: false
    });

  OperationInput.prototype.templateString = {};
  OperationInput.prototype.templateJson = {};
  OperationInput.associate = function(models) {
    OperationInput.belongsTo(models.Operation, {foreignKey: {allowNull: false}})
    // the parent field, which in turn contains the fields that are allowed to be filled
    OperationInput.belongsTo(models.Field, {foreignKey: {allowNull: true}})
  }

  /** associate the template to this particular OperationInput
   * see Operation.fillTemplateString to actually fill it
   */
  OperationInput.prototype.setTemplateString = function (string) {
    let id = this.getDataValue('id');
    OperationInput.prototype.templateString[id] = string;
  }

  OperationInput.prototype.getTemplateString = function (id) {
    if (id) {
      return OperationInput.prototype.templateString[id];
    } else {
      let id = this.getDataValue('id');
      return OperationInput.prototype.templateString[id];
    }
  }

  /**
   * similar to setTemplateString except for JSON
   */
  OperationInput.prototype.setTemplateJson = function (obj) {
    let id = this.getDataValue('id');
    OperationInput.prototype.templateJson[id] = obj;
  }

  OperationInput.prototype.getTemplateJson = function () {
    let id = this.getDataValue('id');
    return OperationInput.prototype.templateJson[id];
  }

  /** loads html templates, assumes that the file name not including
   * the extension, is identical to the name of the OperationField
   */
  OperationInput.loadTemplateStringsFromListSync = async function (db, list) {
    // filename should equal to OperationInput.name
    for (let _f of list) {
      let opInput = await OperationInput.findOne({where: {name: _f.file.replace(".html","")}});
      var tmlstr = fs.readFileSync (_f.path);
      if (opInput) {
        opInput.setTemplateString(tmlstr.toString());
      }
    }
  }

  /**
   * @param {Object[]} templateInputs - list of fields to use to fill template string
   * @param {string|null} templateInputs[].name - if null its prefilled by template, so use filledValue to fill in the template, else look inside Value object
   * @param {string|null} templateInputs[].filledValue - if a field is prefilled by the template, this field will contain the value
   * @param {string} templateInputs[].defaultValue - @todo, should fill with default if Value is not given
   * @param {Object} templateInputs[].Field - field used to find which field is being filled
   * @param {Object|null} templateInputs[].UserValue - value with which to fill, if null, fill with empty string
   */
  OperationInput.fillTemplateString = function (db, id, templateInputs, {notifyFuncName}) {
    let tmlstr = OperationInput.prototype.getTemplateString(id);
    //console.log('\n\n\n\n template inputs', templateInputs)
    for (let tmlInput of templateInputs) {
      // two cases: if name is null, then its prefilled by template
      // so use filledValue, else fill with userValue
      // -- also, OperationInput uses Field to identify fillable fields
      // but template renames them, thus, use Field object inside templateInputs to 
      // reference what were filling
      let fieldName = tmlInput.Field.name;
      let tmlInputName = tmlInput.name;
      let fieldValue = null;
      if (tmlInput.TemplateInputValue) {
        // filling with actual stored value
        fieldValue = tmlInput.TemplateInputValue.value || ""; // for null, just do blank string
        // in order to give the field a unique id, in order to set up javascript listeners and all that
        // use TemplateInput as it is unique to the template, but need to augment it with something
        // because templates are reusable between forms, THOUGH: templateValues are really what is 
        // unique...
        tmlstr = strutils.replaceAll(tmlstr, "{{dataObject}}",
          "{templateInputValueId:"+tmlInput.TemplateInputValue.id+"}");
        tmlstr = strutils.replaceAll(tmlstr, "{{uniqueId}}", tmlInput.TemplateInputValue.id);
      } else {
        fieldValue = tmlInput.filledValue || tmlInput.defaultValue || "no value found";
      }
      //console.log( 'filling fieldValue to : ', fieldValue);
      tmlstr = strutils.replaceAll(tmlstr, "{{"+fieldName+"}}", fieldValue);
    }
    if (notifyFuncName) {
      tmlstr = strutils.replaceAll(tmlstr, "{{notifyFuncName}}", notifyFuncName);
    } else {
      tmlstr = strutils.replaceAll(tmlstr, "{{notifyFuncName}}", 
        "console.log");
    }
    // finally replace unfilled with blanks
    tmlstr = strutils.replaceAll(tmlstr, /{{.*}}/, "");
    return tmlstr;
  }

  return OperationInput;
};
