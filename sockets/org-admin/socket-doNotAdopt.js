const doNotAdopt = require('../../crud/doNotAdopt.js');

/**
*/
exports.sockets = { 
  'create do not adopt': (db, {adopterId = null, reason = null, notes = null, applicationId = null}, s) => {
    async function work() {
      try {
        if (adopterId === null) return Promise.reject('adopterId was not provided');
        const orgId = s.user.Person.Organization.id;
        const adopter = db.AppUser.findById(adopterId);
        if (adopter) {
          const dna = await db.DoNotAdopt.create({
            reason: reason, notes: notes, AdopterId: adopter.id,
            AddoptionApplicationId: applicationId, OrganizationId: orgId,
            EnteredByPersonId: s.user.Person.id,
          })
          return dna;
        } else return Promise.reject('adopter was not found');
      } catch (e) {
        console.log(' error? ', e);
        return Promise.reject(e);
      }
    } return work();
  },
}

exports.sockets.tags = ['org-admin'];
