const socketTestEnv = require('../baseline-server-node/testing/SocketTest.js');

socketTestEnv.testSocketsAsList([
  {
    handler: 'get all users',
    data: {name: 'excelente inc'}
  },
  {
    handler: 'create employee',
    data: {
      username: 'hey my name is what'+Date.now(), 
      email: 'fakeemail'+Date.now()+'@fake.com',
      firstname: 'heyFirst name here', lastname: 'hey last name here',
    }
  },
  {
    handler: 'create volunteer',
    data: {
      username: 'hey my name SHABBY VOLUNTEERis what'+Date.now(), 
      email: 'fa'+Date.now()+'@VOLUNTEERke.com',
      firstname: 'heyFirst name here', lastname: 'hey last name here',
    }
  },
  {
    handler: 'create user',
    data: {
      username: 'hey my name SHABBY VOLUNTEERis what'+Date.now(), 
      email: 'fa'+Date.now()+'@VOLUNTEERke.com',
      firstname: 'heyFirst name here', lastname: 'hey last name here',
    }
  },
  {
    handler: 'get all employees',
    data: {
      id: '3e980ab2-4d82-41a1-8070-ecf96a306995',
      data: {
        username: 'hupdated '+Date.now(), 
        email: 'fakeupdated '+Date.now()+'@fake.com',
        firstname: 'heyFirst name here', lastname: 'hey last name here',
      }
    }
  },
  {
    handler: 'get all volunteers',
    data: {
      id: '3e980ab2-4d82-41a1-8070-ecf96a306995',
      data: {
        username: 'hupdated '+Date.now(), 
        email: 'fakeupdated '+Date.now()+'@fake.com',
        firstname: 'heyFirst name here', lastname: 'hey last name here',
      }
    }
  },
  {
    handler: 'get all users',
    data: {
      id: '3e980ab2-4d82-41a1-8070-ecf96a306995',
      data: {
        username: 'hupdated '+Date.now(), 
        email: 'fakeupdated '+Date.now()+'@fake.com',
        firstname: 'heyFirst name here', lastname: 'hey last name here',
      }
    }
  },
  /*{
    handler: 'update employee',
    data: {
      id: '3e980ab2-4d82-41a1-8070-ecf96a306995',
      data: {
        username: 'hupdated '+Date.now(), 
        email: 'fakeupdated '+Date.now()+'@fake.com',
        firstname: 'heyFirst name here', lastname: 'hey last name here',
      }
    }
  },*/

])

