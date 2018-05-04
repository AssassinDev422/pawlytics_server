
exports.createDoNotAdopt = async function (db, {adopterId, currentUser, orgId}) {
    const appUser = await db.AppUser.create({
      username: data.username, 
      password: data.password,
      email: data.email,
      Person: {
        lastname: data.lastname, 
        firstname: data.firstname, 
        middlename: data.middlename,
        phone: data.phone,
        OrganizationId: orgId,
        type: type,
      }},
      {include: [{model: db.Person}]})
    return await db.AppUser.findById(appUser.id, {include: [{all: true}]});
}

exports.updateUser = updateUser = async function (db, type = user, id, data, orgId) {
    const appuser = await db.AppUser.findById(id, {include: [{all: true}]});
  if (appuser) {
    await appuser.update(Object.assign(data, {type: type}));
    return await db.AppUser.findById(appuser.id, {include: [{all: true}]});
  } else return Promise.reject({error: " could not find user sorry "});
}

