exports.Pet = { 
  /**
   * creates pet, also sets PetId in current session
   */
  'create pet': function ( db, petData, session) {
    // name, intake date, age, species, breed, color, special markings, weight, location
    // status, out of date
    // brand, how much, how often , instructions, special needs (boolean),
    // medical (text area)
    async function work() {
      try {
        const id = await session.user.orgId;
        const org = await db.Organization.findById(id);
        const pet = await db.Pet.create(petData);
        session.set('PetId', pet.id);
        await pet.setOrganization(org);
        return pet;
      } catch (e) {
        console.log(e);
        return e;
      }
    }
    return work();
  },

  // get the logged in user's org pets
  // @todo: need to add a date constraint
  // or simply slices it
  'get my org pets': function ( db, petData, s) {
    async function work() {
      try {
        // NOTE FOR DEV ONLY FOR NOW
        const LIMIT = 100;

        const o = await db.Organization.findById(s.orgId);
        const pets = await db.Pet.findAll({where: {OrganizationId: s.user.orgId}, limit: LIMIT, 
          attributes: {
            exclude: ['OrganizationId'],
          },
          include: [
            {attributes: {exclude: ['id']}, model: db.Organization},
            //{attributes: {exclude: []}, model: db.PetBreed},
            //{attributes: {exclude: []}, model: db.PetSpecies},
          ]});
        return pets;
      } catch (e) {
        console.log(' an error was thrown ', e);
        return Promise.reject(e);
      }
    }
    return work();
  },

  'update pet': (db, petData, getSession) => {
    async function work() {
      try {
        if (petData && petData.id) {
          const s = await getSession();
          var id = petData.id;
          var args = {where: {id: {$eq: id}}};
          const result = await db.Pet.update(petData, {where: {id: {$eq: id}}});
          const updated = await db.Pet.findOne({where: {id: {$eq: id}}});
          return updated;
        } else return Promise.reject("need id to update");
      } catch (e) {
        console.log(e);
        return {error: e};
      }
    }
    return work();
  },

  /** uses the pet in the current session, as of now, session
   * only stores current pet on creation 
   */
  'update current pet': (db, petData, s) => {
    async function work() {
      try {
        if (petData) {
          var id = s.PetId;
          var args = {where: {id: {$eq: id}}};
          const result = await db.Pet.update(petData, {where: {id: {$eq: id}}});
          const updated = await db.Pet.findOne({where: {id: {$eq: id}}});
          return updated;
        } else return Promise.reject("did not give any data to update");
      } catch (e) {
        console.log(e);
        return Promise.reject(e);
      }
    }
    return work();
  },

  'all pet breeds': db => db.PetBreed.findAll({attributes: ['id', 'name']}),

  // get animal breeds doesn't work completely
  'all pet species': db => db.PetSpecies.findAll({attributes: ['id', 'name']}), //.then ( dogs => dogs[0].getAnimalBreeds()),

}

