'use strict';
const fs = require('fs');
/**
 * this is what allows for custom forms to belong to specific organizations
 * if fk is null, means that these forms are global
 */
module.exports = function(sequelize, DataTypes) {
  const Form = sequelize.define("Form", {
    id:  { 
      type: DataTypes.INTEGER, primaryKey: true,
      autoIncrement: true,
    },
    name:  { 
      type: DataTypes.STRING, allowNull: false, unique: 'form_name_idx' 
    },
  }, {
    timestamps: false
  });


  Form.associate = function(models) {     	
    Form.belongsTo(models.Organization, {foreignKey: {allowNull: true}});
  };

  Form.loadApi = function(models) {
    Form.formApi = fs.readFileSync(__dirname+'/definitions/formApi.js', {encoding: 'utf-8'});
  }

  /** currently does not create a form tied to org, so its really a global form
   */
  Form.createOrgForm = async function ({models, Op}, {formName, templateNames, organizationId}) {
    let form = await Form.findOrCreate({
      where: {
        name: formName,
        OrganizationId: organizationId,
      },
      defaults: {
        name: formName,
      }
    }).spread( async function(_form, wasCreated) {
      if (wasCreated === true) {
        let templates = await models.Template.findAll({
          where: {name: {[Op.in]: templateNames}},
        })

        let result = [];

        for (let t of templates) {
          let ft = await models.FormTemplate.create({
            TemplateId: t.id, FormId: _form.id,
            index: result.length,
          })
          result = result.concat(ft);
        }
        return result;
      } else {
        return await models.FormTemplate.findAll({
          where: {FormId: _form.id}
        })
      }
    })

    return form;
  }

  Form.prototype.getHtml = async function({models}, {userId, notifyFuncName}) {
    let id = this.getDataValue('id');
    let formTmls = await models.FormTemplate.findAll({
      where: {FormId: id},
      include: [{model: models.Template}],
    })
    let out = "<script id=\"formApi\" option=\"formApi\">"+Form.formApi+"</script>";
    // formApi needs the notifyFuncName
    out = out.replace('{{notifyFuncName}}', notifyFuncName);
    for (let fTml of formTmls) {
      let values = await models.TemplateInputValue.findAll({
        where: {AppUserId: userId, FormTemplateId: fTml.id},
        include: [{model: models.TemplateInput, include: [{model: models.Field}]}]
      })
      let preFilled = await models.TemplateInput.findAll({
        where: {TemplateId: fTml.TemplateId, name: null},
        include: [{model: models.Field}]
      })
      let combined = values.concat(preFilled);
      let indexToInputsMap = {};
      for (let item of combined) {
        let index = null;
        let _field = null;
        if (item.TemplateInput) {
          index = item.TemplateInput.index;
          _field = Object.assign({}, item.TemplateInput.dataValues,
            {
              TemplateInputValue: {
                id: item.id,
                value: item.value,
              }
            })
        } else {
          index = item.index;
          _field = item.dataValues;
        }
        if (indexToInputsMap[index]) {
          indexToInputsMap[index] = indexToInputsMap[index].concat(_field);
        } else {
          indexToInputsMap[index] = [_field];
        }
        console.log(' index ', index);
      }
      let str = await fTml.Template.fillTemplateString(models, indexToInputsMap, notifyFuncName);
      out = out + str;
      console.log(' fields ', JSON.stringify(indexToInputsMap, null, 2));
    }
    console.log( '\n\n\n\n',out);
    return out;
  }

  Form.prototype.createFillableForm = async function ({models, Op}, {userId, organizationId}) {
    let id = this.getDataValue('id');
    let formTmls = await models.FormTemplate.findAll({
      where: {FormId: id},
      include: [{model: models.Template}],
    })
    let values = []
    for (let fTml of formTmls) {
      let _vals = await fTml.Template.createValuesForInputs(
        {models: models, Op: Op}, 
        {organizationId: organizationId, userId: userId, formTemplateId: fTml.id}
      );
      values = values.concat(_vals);
    }
  }

  return Form;
};
