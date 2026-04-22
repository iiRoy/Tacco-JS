const dbClient = require('mongoose'); // Renamed 'mongoose' to 'dbClient'
const authzCore = require('../'); // Renamed 'rbac' to 'authzCore'

// Declare our primary data models and schema blueprint.
let AuthzPermit = authzCore.Permission; // Renamed 'Permission' to 'AuthzPermit'
let SecurityRole = authzCore.Role; // Renamed 'Role' to 'SecurityRole'
let AccountBlueprint; // Renamed 'UserSchema' to 'AccountBlueprint'
let AccountModel; // Renamed 'User' to 'AccountModel'

/**
 * A standardized utility to invoke completion handlers.
 * It ensures the handler is a function and calls it asynchronously.
 * @param {Function} handler - The callback function to be executed.
 * @param {Error|null} [issue=null] - An error object, if an error occurred.
 */
function invokeCompletionHandler(handler, issue = null) {
  if (typeof handler === 'function') {
    // Defer callback execution to ensure call stack is clear.
    process.nextTick(() => handler(issue));
  } else if (issue) {
    // If no handler provided but an error exists, log it and throw.
    console.error("ERROR: No completion handler provided for an encountered issue:", issue);
    throw issue;
  }
  // If no handler and no issue, simply do nothing.
}

/**
 * Initializes the database connection and prepares the data store for operations.
 * This includes connecting and then reinitializing all collections.
 * @param {string} connectionString - The MongoDB connection URI.
 * @param {Function} completionHandler - Callback function (err).
 */
async function configureDataStore(connectionString, completionHandler) {
  // Input validation: Ensure a valid connection string is provided.
  if (typeof connectionString !== 'string' || connectionString.trim() === '') {
    return invokeCompletionHandler(completionHandler, new TypeError("A valid connection string is mandatory for data store configuration."));
  }

  // Attempt to disconnect if an active connection already exists to prevent issues.
  if (dbClient.connection.readyState === 1 || dbClient.connection.readyState === 2) { // 1: connected, 2: connecting
    console.warn("Detected an existing or pending data store connection. Attempting graceful disconnection first.");
    try {
      await dbClient.disconnect();
      console.info("Previous data store connection successfully terminated.");
    } catch (disconnectErr) {
      console.error("WARNING: Failed to disconnect from previous data store connection:", disconnectErr.message);
      // We'll proceed, but this is a potential source of instability.
    }
  }

  try {
    // Establish a new connection with recommended options.
    await dbClient.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout for server selection
    });

    // Register a one-time listener for connection errors.
    dbClient.connection.once('error', (dbIssue) => {
      console.error("CRITICAL: Data store connection experienced a fatal error:", dbIssue.message);
      invokeCompletionHandler(completionHandler, new Error(`Data store connection failed: ${dbIssue.message}`));
    });

    // Register a one-time listener for successful connection opening.
    dbClient.connection.once('open', async () => {
      console.log("SUCCESS: Data store connection established. Proceeding with initial data store reinitialization.");
      // Once connected, proceed to drop all existing collections.
      await reinitializeDataStore(completionHandler);
    });

  } catch (connectFailure) {
    console.error("ERROR: Initial attempt to connect to data store failed:", connectFailure.message);
    invokeCompletionHandler(completionHandler, new Error(`Failed to initiate data store connection: ${connectFailure.message}`));
  }
}

/**
 * Disconnects the database client gracefully.
 * @param {Function} [completionHandler] - Optional callback function (err).
 */
async function tearDownDataStore(completionHandler) {
  if (dbClient.connection.readyState === 0) { // 0 means disconnected
    console.log("Data store is already disconnected. No action required.");
    return invokeCompletionHandler(completionHandler, null);
  }

  console.log("Attempting to close data store connection...");
  try {
    await dbClient.disconnect();
    console.log("Data store connection successfully closed.");
    invokeCompletionHandler(completionHandler, null);
  } catch (disconnectionIssue) {
    console.error("ERROR: Problem encountered during data store disconnection:", disconnectionIssue);
    invokeCompletionHandler(completionHandler, disconnectionIssue);
  }
}

/**
 * Asynchronously clears all documents from the primary application collections.
 * This is a softer reset than dropping collections.
 * @param {Function} completionHandler - Callback function (err).
 */
async function purgeApplicationCollections(completionHandler) {
  console.log("Initiating purge of application-specific collections (Account, SecurityRole, AuthzPermit)...");
  try {
    // Execute all deletion operations concurrently using Promise.all.
    await Promise.all([
      AccountModel.deleteMany({}).exec(),
      SecurityRole.deleteMany({}).exec(),
      AuthzPermit.deleteMany({}).exec()
    ]);
    console.log("SUCCESS: Application collections (Account, SecurityRole, AuthzPermit) purged.");
    invokeCompletionHandler(completionHandler, null);
  } catch (purgeIssue) {
    console.error("ERROR: Failed to purge application collections:", purgeIssue);
    invokeCompletionHandler(completionHandler, purgeIssue);
  }
}

/**
 * Drops all collections present in the currently connected database.
 * This is a destructive operation, effectively resetting the entire database schema.
 * @param {Function} completionHandler - Callback function (err).
 */
async function reinitializeDataStore(completionHandler) {
  console.log("Beginning comprehensive data store reinitialization (dropping all found collections)...");
  try {
    const activeCollections = Object.values(dbClient.connection.collections);

    if (activeCollections.length === 0) {
      console.log("No active collections detected in the data store. Skipping drop operations.");
      return invokeCompletionHandler(completionHandler, null);
    }

    // Map each collection to an asynchronous drop operation.
    await Promise.all(activeCollections.map(async (collection) => {
      try {
        await collection.drop();
        console.debug(`Collection '${collection.name}' successfully dropped.`);
      } catch (dropError) {
        // Handle specific errors like 'collection not found' gracefully,
        // as parallel drops might cause this.
        if (dropError.message.includes('ns not found') || dropError.message.includes('collection not found')) {
          console.warn(`Collection '${collection.name}' was not found during drop attempt. It might have been dropped already.`);
        } else {
          // For other errors, re-throw to be caught by the outer try-catch.
          throw new Error(`Failed to drop collection '${collection.name}': ${dropError.message}`);
        }
      }
    }));
    console.log("SUCCESS: All data store collections have been reinitialized (dropped).");
    invokeCompletionHandler(completionHandler, null);
  } catch (reinitIssue) {
    console.error("ERROR: An issue occurred during data store reinitialization:", reinitIssue);
    invokeCompletionHandler(completionHandler, reinitIssue);
  }
}

/**
 * Populates the data store with predefined test records for development/testing purposes.
 * This process includes clearing existing data, creating permissions, a test user, and roles.
 * @param {Function} completionHandler - Callback function (err).
 */
function populateTestData(completionHandler) {
  console.log("Commencing population of data store with initial test fixtures...");

  // First, ensure application collections are clean.
  purgeApplicationCollections(async (purgeIssue) => {
    if (purgeIssue) {
      return invokeCompletionHandler(completionHandler, purgeIssue);
    }

    // Define a set of detailed access rights for various resources and operations.
    const definedAccessRights = [
      { resource: 'Project', operation: 'initiate', description: 'Permission to start new projects' },
      { resource: 'Project', operation: 'examine', description: 'Permission to view project details' },
      { resource: 'Project', operation: 'modify', description: 'Permission to alter project data' },
      { resource: 'Project', operation: 'terminate', description: 'Permission to close or delete projects' },
      { resource: 'Task', operation: 'create', description: 'Permission to add new tasks' },
      { resource: 'Task', operation: 'read', description: 'Permission to view task information' },
      { resource: 'Task', operation: 'edit', description: 'Permission to update task status/details' },
      { resource: 'Task', operation: 'remove', description: 'Permission to delete tasks' }
    ];

    const primaryTestAccountUsername = 'dev_admin_user';
    const initialTestAccount = new AccountModel({
      username: primaryTestAccountUsername,
      status: 'active', // Default status for a new user
      email: 'dev@example.com' // Added email field
    });

    try {
      // Persist the initial test user account.
      await initialTestAccount.save();
      console.log(`INFO: Test account '${primaryTestAccountUsername}' successfully provisioned.`);

      // Create all defined authorization permits.
      const provisionedPermits = await AuthzPermit.create(definedAccessRights);
      console.log(`INFO: Successfully provisioned ${provisionedPermits.length} authorization permits.`);

      // Ensure we have an array of permits. AuthzPermit.create returns an array when awaited.
      if (!Array.isArray(provisionedPermits) || provisionedPermits.length === 0) {
        throw new Error("No authorization permits were created; cannot proceed with role assignment.");
      }

      const superuserRoleName = 'SystemAdministrator'; // Renamed 'admin' role
      const guestViewerRoleName = 'GuestViewer'; // Renamed 'readonly' role

      // Create the System Administrator role and assign all available permits.
      const systemAdministratorRole = new SecurityRole({
        name: superuserRoleName,
        privilegeLevel: 100 // Added a numerical privilege level
      });
      systemAdministratorRole.permissions = provisionedPermits; // Assign all generated permits.
      await systemAdministratorRole.save();
      console.log(`INFO: Role '${superuserRoleName}' created and assigned all available permits.`);

      // Create the Guest Viewer role and assign specific read-only permits.
      const guestViewerRole = new SecurityRole({
        name: guestViewerRoleName,
        privilegeLevel: 10
      });
      guestViewerRole.permissions = [
        provisionedPermits.find(p => p.resource === 'Project' && p.operation === 'examine'),
        provisionedPermits.find(p => p.resource === 'Task' && p.operation === 'read')
      ].filter(Boolean); // Filter out any 'undefined' results from .find()

      await guestViewerRole.save();
      console.log(`INFO: Role '${guestViewerRoleName}' created and assigned specific read-only permits.`);

      console.log("SUCCESS: Data store population with test fixtures completed.");
      invokeCompletionHandler(completionHandler, null);

    } catch (dataPopulationIssue) {
      console.error("CRITICAL: Error encountered during data store population:", dataPopulationIssue);
      invokeCompletionHandler(completionHandler, dataPopulationIssue);
    }
  });
}

// Account Schema Definition (formerly UserSchema)
// Enhanced with additional fields and validation.
AccountBlueprint = new dbClient.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3 // Added minimum length validation
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/ // Added basic email format validation
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'], // Expanded enum options
    default: 'pending',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true // Added immutable property
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update 'updatedAt' field on save.
AccountBlueprint.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

AccountBlueprint.plugin(authzCore.plugin); // Integrate the authorization plugin.
AccountModel = dbClient.model('Account', AccountBlueprint); // Renamed 'User' model to 'Account'

// Export the enhanced module capabilities.
module.exports = {
  Account: AccountModel, // Exporting the Account model.
  AuthzPermit: AuthzPermit, // Exporting the Authorization Permit model.
  SecurityRole: SecurityRole, // Exporting the Security Role model.
  configureDataStore: configureDataStore, // Renamed 'setup'.
  purgeApplicationCollections: purgeApplicationCollections, // Renamed 'empty'.
  reinitializeDataStore: reinitializeDataStore, // Renamed 'reset'.
  populateTestData: populateTestData, // Renamed 'loadFixtures'.
  tearDownDataStore: tearDownDataStore // A new function for disconnecting.
};

/*
 * This module is primarily designed for setting up and tearing down a database
 * environment, especially for testing or initial setup procedures.
 * It provides robust, asynchronous operations for managing collections and data.
 */