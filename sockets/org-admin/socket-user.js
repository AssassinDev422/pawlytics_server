const user = require('../../crud/user.js');
const createUser = user.createUser;
const updateUser = user.updateUser;
/**
*/
exports.sockets = { 
  'create employee': (db, data, s) => {
    async function work() {
      try {
        const org = s.user.Person.Organization;
        return await createUser(db, data, 'employee', org.id);
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  },

  'update employee': (db, {id = null, data}, s) => {
    async function work() {
      try {
        const org = s.user.Person.Organization;
        return await updateUser(db, 'employee', id, data, org.id);
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  },

  'create volunteer': (db, data, s) => {
    async function work() {
      try {
        const org = s.user.Person.Organization;
        return await createUser(db, data, 'volunteer', org.id);
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  },

  'update volunteer': (db, {id = null, data}, s) => {
    async function work() {
      try {
        const org = s.user.Person.Organization;
        return await updateUser(db, 'volunteer', id, data, org.id);
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  },

  'create user': (db, data, s) => {
    async function work() {
      try {
        const org = s.user.Person.Organization;
        return await createUser(db, data, 'user', org.id);
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  },

  'update user': (db, {id = null, data}, s) => {
    async function work() {
      try {
        const org = s.user.Person.Organization;
        return await updateUser(db, 'user', id, data, org.id);
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  },

  'get all employees': (db, data, s) => {
    async function work() {
      try {
        const org = s.user.Person.Organization;
        return await db.Person.findAll({where: {OrganizationId: org.id, type: 'employee'}});
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  },

  'get all users': (db, data, s) => {
    async function work() {
      try {
        const org = s.user.Person.Organization;
        return await db.Person.findAll({where: {OrganizationId: org.id, type: 'user'}});
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  },

  'get all volunteers': (db, data, s) => {
    async function work() {
      try {
        const org = s.user.Person.Organization;
        return await db.Person.findAll({where: {OrganizationId: org.id, type: 'volunteer'}});
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  }
}

exports.sockets.tags = ['org-admin'];
