/*
 * meant for site admin calls, for specific org calls
 * @see socket-my-org.js
 */
const success = () => ({success: true});
const org = db => db.Organization;
const orgFields = org => {
  if (org) return org.dataValues;
  else return "requested org not found";
}
async function getEmployees(db, orgId) {
  try {
    const org = await db.Organization.findOne({
      where: {id: orgId}, 
      include: [{model: db.Person, as: 'Employees'}],
    });
    const employees = await org.getEmployees({attributes: {exclude: ['id', 'EmployerId', 'VolunteerForId']}});
    let r = [];
    for (e of employees) {
      let p = await db.Person.findById(e.org_workers.PersonId);
      r.push(p);
    }
    return r;
  } catch (e) {
    console.log(e);
    return Promise.reject(e.toString());
  }
}
exports.Organization = { 
  /**
   * creates a org with name adress, state and all that
   * returns true on succes
   */
  'create org': function ( db, {name, Address, state}) {
    async function createOrg() {
      try {
        const _state = await db.State.get(state);
        const org = await db.Organization.create({
          name: name,
          Address: Address,
        },{
          include: [db.Address]//'Address']
        });
        const _org = await org.Address.setState(_state).then ( addr => org);
        return _org;
      } catch (e) {
        //return Promise.reject(e);
        return Promise.reject('error creating org '+e);
        return Promise.reject('org already exists');
      }
    }
    return createOrg();
  },

  'get org': (db, {id}, getSession) => {
    return db.Organization.getUnique({where: {id: id}});
  },

  'get all orgs': db => 
  db.Organization.findAll({attributes: ['name', 'id']}).then ( r => r.map(org => org.dataValues )),

  /** meant to be available to superadmin, because can get any org employees */
  'get org employees': (db, orgId, getSession) => {
    async function get() { 
      try {
        //const _state = await (db.State.get(state));
        //if (_state == null) return Promise.reject(["State could not be matched to known list"]);
        return await getEmployees(db, orgId);
      } catch (e) {
        return (e.toString());
      }
    }
    return get();
  },

}

