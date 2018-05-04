const path = require('path');

const Validation = require('../baseline-server-node/testing/Validation.js');
const defineObj = Validation.Props.object;
const Props = Validation.Props;

exports.sockets = { 

  'preview form': async function (db, {templateId, notifyFuncName}, getSession, globals) {
    try {
      if (templateId) {
        let tml = await db.Template.findById(templateId);
        return await tml.getHtml(globals, {notifyFuncName: notifyFuncName});
      } else return null;
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  'update value': async function (db, {templateInputValueId, value}, getSession, globals) {
    try {
      console.log(' update value: ', templateInputValueId, ' value: ', value);
      if (templateInputValueId && value) {
        return await db.TemplateInputValue.update({value: value}, {where: {id: templateInputValueId}});
      } else return null;
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
}


