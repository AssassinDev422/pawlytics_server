const path = require('path');

const Validation = require('../baseline-server-node/testing/Validation.js');
const defineObj = Validation.Props.object;
const Props = Validation.Props;

exports.sockets = { 

  'create form': async function (db, {formName, templateNames}, getSession, globals) {
    try {
      let form = db.Form.createOrgForm(globals, {
        formName: formName, templateNames: templateNames,
        organizationId: null,
      })
      return form;
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  'create org form': async function (db, {formName, templateNames}, session, globals) {
    try {
      let orgId = session.orgId;
      console.log(' session ', session);
      let form = db.Form.createOrgForm(globals, {
        formName: formName, templateNames: templateNames,
        organizationId: orgId,
      })
      return form;
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  'create blank org form': async function (db, {formId, userId}, session, globals) {
    try {
      let orgId = session.orgId;
      let _userId = userId || session.user.id;
      console.log(' session ', session);
      let form = await globals.models.Form.findOne({
        where: {id: formId}
      })
      let output = await form.createFillableForm(globals, {
        organizationId: orgId,
        userId: _userId,
      })
      console.log('\n\n\n\n created form ', form);
      return form;
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  'render user form': async function (db, {formId, userId, notifyFuncName}, session, globals) {
    try {
      let _userId = userId || session.user.id;
      let form = await globals.models.Form.findOne({where: {id: formId}});
      return await form.getHtml(globals, {userId: _userId, notifyFuncName: notifyFuncName});
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  'render blank form by id': async function (db, {formId}, getSession, globals) {
    try {
      let form = await globals.models.Form.findOne({where: {id: formId}});
      return await form.getHtml(globals);
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
  'render blank form by name': async function (db, {formName}, getSession, globals) {
    try {
      let form = await globals.models.Form.findOne({where: {name: formName}});
      return await form.getHtml(globals);
    } catch (e) {
      console.log('e',e);
      return e;
    }
  },
}


