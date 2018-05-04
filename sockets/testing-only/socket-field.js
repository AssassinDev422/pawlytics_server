exports.sockets = { 
  'create test field': async function ( db, prop) {
    try {
      let result = await db.Field.createFromProp(db, prop);
      return result;
    } catch (e) {
      return e;
    }
  },
  'get field': async function ( db, id) {
    try {
      let result = await db.Field.findById(id);
      let children = await db.ChildField.findAll({
        where: {ParentFieldId: id},
        include: [{model: db.Field}]
      });
      return {Field: result, ChildFields: children};
    } catch (e) {
      console.log(' did some crazy error happen ', e);
      return e;
    }
  },
}

exports.sockets.tags = ['testing-only'];
