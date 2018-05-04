'use strict';

exports.User = { 
  'test': async function(db, data, session, globals) {
    try {
      return await db.Type.findAll();
    } catch (e) {
      return e;
    }
  },

  'create element': async function(db, {name, type, validValue}, session, globals) {
    try {
      const t = await db.Type.find({where: {name: type}});
      if (t) {
        const el = await db.Element.create({name: name, TypeId: t.id, validValue: validValue});
        return await db.Element.findById(el.id, {include: [{model: db.Type}]});
      } else {
        return {error: 'did not find type', result: t};
      }
    } catch (e) {
      return e;
    }
  },
  
  'create property': async function(db, {name, type, elements}, session, globals) {
    try {
      const Op = globals.Op;
      const t = await db.Property.create({name: name, type: type});
      const elems = await db.Element.findAll({where: {
        id: {[Op.in]: elements}}});
      console.log(' elements ', elems);
      await t.setElements(elems);
      return await db.Property.findAll({where: {id: t.id}, include: [{all: true}]});
      return await db.Property.findById(t.id, {include: [{model: db.Element}]});
    } catch (e) {
      return e;
    }
  }
}
