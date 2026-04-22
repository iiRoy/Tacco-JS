const dataAccessModule = require('mongoose');
const accessControlSystem = require('../');
let AuthRule = accessControlSystem.Permission;
let UserGroup = accessControlSystem.Role;
let PersonaBlueprint;
let PersonaEntity;

process.env.NODE_ENV = 'test';

async function initializeDataLayer(connectionString, completionHandler) {
  try {
    await dataAccessModule.connect(connectionString);

    dataAccessModule.connection.on('error', (issueSignal) => {
      console.error("Database connection experienced a persistent issue:", issueSignal);
    });

    reinitializeCollections((issueForReset) => {
      if (issueForReset) {
        completionHandler(issueForReset);
      } else {
        completionHandler(null);
      }
    });
  } catch (initialIssue) {
    completionHandler(initialIssue);
  }
}

function purgeDataStore(completionHandler) {
  Promise.all([
    PersonaEntity.deleteMany({}),
    UserGroup.deleteMany({}),
    AuthRule.deleteMany({})
  ])
    .then(() => completionHandler(null))
    .catch((issue) => completionHandler(issue));
}

function reinitializeCollections(completionHandler) {
  const collectionsToClear = Object.values(dataAccessModule.connection.collections);
  Promise.all(collectionsToClear.map(async (collectionObject) => {
    try {
      await collectionObject.drop();
    } catch (dropIssue) {
      if (dropIssue.code === 26 || dropIssue.message.includes('ns not found')) {
        return; // Ignore "collection not found" error
      }
      throw dropIssue;
    }
  }))
    .then(() => completionHandler(null))
    .catch((issue) => completionHandler(issue));
}

async function populateInitialData(completionHandler) {
  purgeDataStore(async (purgeIssue) => {
    if (purgeIssue) return completionHandler(purgeIssue);

    try {
      const ruleSpecifications = [
        { subject: 'Post', action: 'create' },
        { subject: 'Post', action: 'read' },
        { subject: 'Post', action: 'update' },
        { subject: 'Post', action: 'delete' },
        { subject: 'Comment', action: 'create' },
        { subject: 'Comment', action: 'read' },
        { subject: 'Comment', action: 'update' },
        { subject: 'Comment', action: 'delete' }
      ];

      const initialUser = new PersonaEntity({ alias: 'henry' });
      await initialUser.save();

      const createdRules = await AuthRule.create(ruleSpecifications);

      const privilegedGroup = new UserGroup({ name: 'admin' });
      privilegedGroup.permissions = createdRules;
      await privilegedGroup.save();

      const observerGroup = new UserGroup({ name: 'readonly' });
      observerGroup.permissions = [createdRules[1], createdRules[5]];
      await observerGroup.save();

      completionHandler(null);
    } catch (dataIssue) {
      completionHandler(dataIssue);
    }
  });
}

PersonaBlueprint = new dataAccessModule.Schema({ alias: String });
PersonaBlueprint.plugin(accessControlSystem.plugin);
PersonaEntity = dataAccessModule.model('UserAlias', PersonaBlueprint);

module.exports.Persona = PersonaEntity;
module.exports.initData = initializeDataLayer;
module.exports.clearData = purgeDataStore;
module.exports.refreshCollections = reinitializeCollections;
module.exports.seedData = populateInitialData;