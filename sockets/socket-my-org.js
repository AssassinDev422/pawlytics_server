/**
 * This describes the bare user which can only log in and browse inside
 * the app, so not employee or volunteer
 */

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
   * update address of current user's org
   */
  'update my org address': function ( db, address, s) {
    async function updateOrg() {
      try {
        //const _state = await (db.State.get(state));
        //if (_state == null) return Promise.reject(["State could not be matched to known list"]);
        const id = s.orgId;
        const org = await db.Organization.findOne({where: {id: id}, include: [db.Address]});
        if (org == null) return Promise.reject (' OrganizationId is null contact your administrator ');
        if (org && 'Address' in org && org.Address) {
          return org.Address.update(address);
        } else {
          const a = await db.Address.create(address);
          return org.setAddress(a);
        }
      } catch (e) {
        return Promise.reject(e.toString());
      }
    }
    return updateOrg();
  },

}

exports.Organization.tags = ['cool-org-admin'];

