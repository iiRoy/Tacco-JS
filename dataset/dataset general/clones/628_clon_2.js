let dbConnector = require('mongoose')
  , authzCore = require('./authz-logic')
  , AccessRight = authzCore.PermissionGrant
  , UserGroup = authzCore.PrivilegeSet
  , MemberSchema
  , MemberAccount;

process.env.APP_MODE = 'development'; // Set the application environment for testing

/*
 * Configures the database connection and prepares the environment.
 * @param {string} dbUri The URI string to connect to the database.
 * @param {Function} completionCb Callback function to execute upon completion or error.
 */
function initializeSystem(dbUri, completionCb) {
  dbConnector.connect(dbUri); // Establish connection to the database
  dbConnector.connection.on('error', function () {
    completionCb(new Error("database connection establishment error")); // Report connection issues
  });
  dbConnector.connection.once('open', function () {
    resetDatabase(completionCb); // Once connected, proceed to reset the database
  });
}

// Removes all entries from the primary collections.
function purgeData(completionCb) {
  MemberAccount.remove({});
  UserGroup.remove({});
  AccessRight.remove({});
  completionCb(); // Indicate successful data purging
}

/*
 * Drops all collections present in the active database connection.
 * @param {Function} completionCb Callback to be invoked after all collections are dropped.
 */
function resetDatabase(completionCb) {
  for (let collectionName in dbConnector.connection.collections) {
    dbConnector.connection.collections[collectionName].drop(); // Drop each collection
  }
  completionCb(); // Signal completion of the database reset
}

/**
 * Loads predefined test data into the database.
 * This includes access rights, user groups, and a sample user account.
 * @param {Function} completionCb Callback function to execute after test data loading is finished.
 */
function loadTestData(completionCb) {
  purgeData(function (issue) {
    if (issue) {
      return completionCb(issue);
    }

    // Define a set of initial access right definitions
    const rightDefinitions = [
        { targetResource: 'ContentItem', activityType: 'create' },
        { targetResource: 'ContentItem', activityType: 'read' },
        { targetResource: 'ContentItem', activityType: 'update' },
        { targetResource: 'ContentItem', activityType: 'delete' },
        { targetResource: 'FeedbackEntry', activityType: 'create' },
        { targetResource: 'FeedbackEntry', activityType: 'read' },
        { targetResource: 'FeedbackEntry', activityType: 'update' },
        { targetResource: 'FeedbackEntry', activityType: 'delete' }
      ];

    // Create and save a sample member account
    let sampleMember = new MemberAccount({ loginIdentifier: 'sarah' });
    sampleMember.save();

    // Create the defined access rights in the database
    AccessRight.create(rightDefinitions, function (issue) {
      if (issue) {
        return completionCb(issue);
      }

      let grantedRights, adminGroup, viewerGroup;

      // Extract the created access right objects from the arguments
      grantedRights = Array.prototype.slice.call(arguments, 1);

      // Define the 'administrator' user group
      adminGroup = new UserGroup({ groupName: 'administrator' });
      adminGroup.assignedRights = grantedRights; // Assign all generated rights to admin
      adminGroup.save(function (issue) {
        if (issue) {
          return completionCb(issue);
        }

        // Define the 'viewer' user group
        viewerGroup = new UserGroup({ groupName: 'viewer' });
        viewerGroup.assignedRights = [grantedRights[1], grantedRights[5]]; // Assign specific read rights
        viewerGroup.save(function (issue) {
          completionCb(issue); // Final callback for the test data loading process
        });
      });
    });
  });
}

// Define the schema structure for a MemberAccount
MemberSchema = dbConnector.SchemaDef({ loginIdentifier: String });
// Attach the authorization core's plugin to the member schema
MemberSchema.addExtension(authzCore.schemaPlugin);
// Register the 'MemberAccount' model with the database connector
MemberAccount = dbConnector.defineModel('MemberAccount', MemberSchema);

// Export the key components of this module
module.exports.MemberAccount = MemberAccount;
module.exports.initializeSystem = initializeSystem;
module.exports.purgeData = purgeData;
module.exports.resetDatabase = resetDatabase;
module.exports.loadTestData = loadTestData;