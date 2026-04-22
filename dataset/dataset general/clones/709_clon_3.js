/*
 * This software component is licensed under the terms of the Modified BSD License.
 * A copy of this license can be found in the project's root directory, or online at:
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * This file contains various unit tests for the persistence layer management.
 * The tests cover database initialization, deletion, versioning, and index creation.
 */

/* eslint-disable strict, esnext, newcap, globalstrict, devel, node */
/* jshint -W097, -W104, -W004, -W083 */ // Relaxing some jshint warnings for test code

'use strict'; // Enforcing strict mode for this module

// Core dependencies for managing persistent storage and utility constants.
const { DataStoreManager: PersistenceManager } = require("../indexed-db-storage-wrapper");
const { ACCESS_MODE_READ, ACCESS_MODE_WRITE } = require('../storage/access-privileges'); // Renamed constants and path
const { indexedDB: IDBFactory } = require('platform/indexed-db-api'); // Renamed and path changed

// This object holds all exported test functions.
const testSuiteExports = {};

/**
 * Utility function to handle common assertion failures and ensure test completion.
 * @param {Function} verifier - The assertion library instance.
 * @param {Function} completionCallback - The test completion callback.
 * @returns {Function} A function that takes an error and asserts failure, then calls completionCallback.
 */
const handleTestFailure = (verifier, completionCallback) => (failureReason) => {
  verifier.fail(`Operation failed: ${failureReason instanceof Error ? failureReason.message : failureReason}`);
  completionCallback();
  return Promise.reject(new Error(failureReason)); // Propagate rejection
};

/**
 * Validates the successful opening and state of a new database.
 * This test ensures that the persistence layer correctly initializes and reports database events.
 * @param {object} verifier - The assertion library instance.
 * @param {function} completionCallback - Callback to signal test completion.
 */
testSuiteExports['verifyDatabaseInitialization'] = function (verifier, completionCallback) {
  const databaseIdentifier = "firstTestDB";
  const expectedDbVersion = 1; // Default version for initial open

  // Introduce a guard clause for the database name.
  if (!databaseIdentifier || typeof databaseIdentifier !== 'string') {
    verifier.fail("Invalid database identifier provided.");
    return completionCallback();
  }

  // A helper to track if the database was actually opened by the factory.
  let factoryOpenedAcknowledged = false;

  // Listen for the 'creation' event, which might be renamed from 'opened'.
  PersistenceManager.on('creation', function (dataStoreRef) {
    verifier.ok(dataStoreRef, 'Data store reference should be valid');
    verifier.equal(dataStoreRef.name, databaseIdentifier, 'Database name mismatch on creation event.');
    factoryOpenedAcknowledged = true;
  });

  // Listen for the 'schemaUpgrade' event, previously 'upgraded'.
  PersistenceManager.on('schemaUpgrade', function (dataStoreRef) {
    verifier.pass('Schema upgrade event received.');
    verifier.equal(dataStoreRef.name, databaseIdentifier, 'Database name mismatch on schema upgrade event.');
  });

  // Initiate the database opening process.
  PersistenceManager.initialize(databaseIdentifier)
    .then(function (dataStore) {
      verifier.ok(dataStore, 'Data store instance must be returned.');
      verifier.equal(dataStore.name, databaseIdentifier, 'Retrieved data store name should match request.');

      // Verify the event was actually fired.
      verifier.ok(factoryOpenedAcknowledged, 'Factory "creation" event should have been acknowledged.');

      // Perform a direct IndexedDB check to confirm physical existence.
      const dbOperation = IDBFactory.open(dataStore.name, dataStore.version);

      dbOperation.onCompletion = function (operationEvent) {
        const operationOutcome = operationEvent.eventSource.result;
        verifier.ok(operationOutcome, 'IndexedDB operation should yield a result.');
        verifier.equal(operationOutcome.name, dataStore.name, "IndexedDB instance name doesn't match.");
        verifier.equal(operationOutcome.version, expectedDbVersion, "IndexedDB instance version doesn't match expected.");
        operationOutcome.close(); // Ensure proper resource release.
        completionCallback(); // Signal test completion.
      };

      dbOperation.onErrorOccurred = function (operationEvent) {
        verifier.fail(`Failed to verify IndexedDB existence: ${operationEvent.eventSource.error}`);
        completionCallback();
      };

      // Ensure no unexpected schema upgrades occur during this check.
      dbOperation.addEventListener("schemaUpgradeRequired", function unexpectedUpgrade(operationEvent) {
        verifier.fail('No schema upgrade should be necessary for an existing database.');
        operationEvent.eventSource.result.close();
        completionCallback();
      });
    })
    .catch(handleTestFailure(verifier, completionCallback));
};

/**
 * Confirms that a database can be successfully removed from the system.
 * This test verifies both the internal persistence manager's deletion event and IndexedDB's behavior.
 * @param {object} verifier - The assertion library instance.
 * @param {function} completionCallback - Callback to signal test completion.
 */
testSuiteExports['confirmDatabaseDeletion'] = function (verifier, completionCallback) {
  const databaseIdentifier = "secondTestDB";
  let deletionEventFired = false;

  // Add a non-essential check: ensure the DB doesn't exist *before* we try to delete it.
  // This helps confirm the factory logic handles non-existent DBs gracefully.
  IDBFactory.deleteDatabase(databaseIdentifier)
    .then(() => {
      // Listen for the 'erased' event, previously 'deleted'.
      PersistenceManager.on('erased', function (id) {
        verifier.pass('Database erased event received.');
        verifier.equal(id, databaseIdentifier, 'Erased database identifier mismatch.');
        deletionEventFired = true;
      });

      // First, create the database so it can be deleted.
      return PersistenceManager.initialize(databaseIdentifier);
    })
    .then(function (dataStore) {
      verifier.ok(dataStore, 'Data store must be created before deletion.');
      verifier.equal(dataStore.name, databaseIdentifier, 'Created data store name mismatch.');

      // Now, proceed with deletion.
      return PersistenceManager.removeDataStore(dataStore.name);
    })
    .then(function (removedDataStore) {
      verifier.ok(removedDataStore, 'Removed data store reference should be valid.');
      verifier.equal(removedDataStore.name, databaseIdentifier, 'Removed data store name mismatch.');
      verifier.ok(deletionEventFired, 'PersistenceManager "erased" event should have fired.');

      // Attempt to open the deleted database with a new version to trigger upgradeneeded.
      // This is the standard way to check if a DB truly no longer exists.
      const dbOperation = IDBFactory.open(removedDataStore.name, 2); // Use a new version

      dbOperation.onCompletion = function (operationEvent) {
        // If onCompletion fires here, it means the DB *still* exists, which is a failure.
        const operationOutcome = operationEvent.eventSource.result;
        verifier.fail(`Database '${operationOutcome.name}' still exists after deletion.`);
        operationOutcome.close();
        completionCallback();
      };

      dbOperation.addEventListener("schemaUpgradeRequired", function (operationEvent) {
        verifier.pass('Schema upgrade required, indicating database was successfully deleted and recreated.');
        operationEvent.eventSource.result.close();
        completionCallback();
      });

      dbOperation.onErrorOccurred = function (operationEvent) {
        verifier.fail(`Failed to open deleted database for verification: ${operationEvent.eventSource.error}`);
        completionCallback();
      };
    })
    .catch(handleTestFailure(verifier, completionCallback));
};

/**
 * Tests the persistence layer's ability to handle and report existing database versions correctly.
 * This scenario involves opening a database that was previously created with a specific version.
 * @param {object} verifier - The assertion library instance.
 * @param {function} completionCallback - Callback to signal test completion.
 */
testSuiteExports['validateSchemaVersionHandling'] = function (verifier, completionCallback) {
  const databaseIdentifier = "versionTestDB";
  const initialSchemaVersion = 10; // Explicitly setting a higher version
  const commonFailureHandler = handleTestFailure(verifier, completionCallback);

  // Step 1: Create the database directly via IndexedDB with a high version.
  const initialDbRequest = IDBFactory.open(databaseIdentifier, initialSchemaVersion);

  initialDbRequest.onCompletion = function (operationEvent) {
    const operationOutcome = operationEvent.eventSource.result;
    if (!operationOutcome) {
      verifier.fail("IndexedDB did not return a database instance on initial open.");
      return completionCallback();
    }
    verifier.pass(`Database created with version: ${operationOutcome.version}`);
    operationOutcome.close(); // Close the direct IndexedDB connection.

    // Step 2: Now, use the PersistenceManager to open the same database.
    // It should detect the existing version.
    PersistenceManager.initialize(databaseIdentifier)
      .then(function (dataStore) {
        verifier.ok(dataStore, 'PersistenceManager should successfully open the database.');
        verifier.equal(dataStore.name, databaseIdentifier, 'Database name from manager should match.');

        // Introduce a small delay to simulate network latency or other async operations
        // before asserting the version, although not strictly needed for correctness.
        setTimeout(() => {
          verifier.equal(initialSchemaVersion, dataStore.version,
                         "PersistenceManager did not report the correct existing schema version.");
          completionCallback();
        }, 50); // 50ms delay
      }, commonFailureHandler);
  };

  initialDbRequest.onErrorOccurred = function (operationEvent) {
    commonFailureHandler(`Failed to open database initially: ${operationEvent.eventSource.error}`);
  };

  initialDbRequest.addEventListener("schemaUpgradeRequired", function (operationEvent) {
    // This listener is typically for initial creation; no actual "upgrade" expected if version matches.
    // If it triggers, it means the DB was new or version changed.
    const dbInstance = operationEvent.eventSource.result;
    verifier.pass(`Schema upgrade needed for initial creation. Version: ${dbInstance.version}`);
    // No explicit failure, as this is expected for a new DB.
  });
};

/**
 * Verifies the creation of an object store and an index within it.
 * This test ensures that the persistence layer correctly handles schema modifications.
 * @param {object} verifier - The assertion library instance.
 * @param {function} completionCallback - Callback to signal test completion.
 */
testSuiteExports['ensureIndexCreation'] = function (verifier, completionCallback) {
  const databaseIdentifier = "indexingTestDB";
  const objectCollectionName = "userProfiles"; // Renamed from storeName
  const indexLabel = "profileIdIndex";       // Renamed from indexName
  const keyProperty = "userId";             // Renamed from indexKeyPath
  const indexConfiguration = { unique: false, multiEntry: false }; // Renamed from options

  // Helper for consistent error handling.
  const handleOperationFailure = (err) => {
    verifier.fail(`Operation failed: ${err.message || err}`);
    completionCallback();
  };

  // Introduce a pre-check: ensure the database does not exist from a previous run.
  IDBFactory.deleteDatabase(databaseIdentifier)
    .then(() => PersistenceManager.initialize(databaseIdentifier))
    .then(async function (dataStore) { // Using async/await for clearer promise chaining here.
      verifier.ok(dataStore, 'Data store must be available for index creation.');
      verifier.equal(dataStore.name, databaseIdentifier, 'Data store name mismatch.');

      try {
        const collectionRef = await dataStore.createObjectCollection(objectCollectionName); // Renamed method
        verifier.ok(collectionRef, 'Object collection reference must be valid.');
        verifier.equal(collectionRef.name, objectCollectionName, 'Collection name mismatch.');

        const indexRef = await collectionRef.createSearchIndex(indexLabel, keyProperty, indexConfiguration); // Renamed method
        verifier.ok(indexRef, 'Index reference must be valid.');
        verifier.equal(indexRef.name, indexLabel, 'Index name mismatch.');
        verifier.equal(indexRef.keyPath, keyProperty, 'Index key path mismatch.');

        // Direct IndexedDB verification of the created index.
        const dbOperation = IDBFactory.open(databaseIdentifier, dataStore.version);

        dbOperation.onCompletion = ({ eventSource }) => {
          const operationOutcome = eventSource.result;
          if (!operationOutcome) {
            verifier.fail("IndexedDB instance not returned for verification.");
            return completionCallback();
          }

          let transactionHandle;
          try {
            // Access mode changed from READ_ONLY to ACCESS_MODE_READ
            transactionHandle = operationOutcome.transaction(objectCollectionName, ACCESS_MODE_READ);
            const objectStoreHandle = transactionHandle.objectStore(objectCollectionName);
            const retrievedIndex = objectStoreHandle.index(indexLabel);

            verifier.ok(retrievedIndex, `Index '${indexLabel}' should exist in the store.`);
            verifier.equal(retrievedIndex.name, indexLabel, 'Retrieved index name is incorrect.');
            verifier.equal(retrievedIndex.keyPath, keyProperty, 'Retrieved index keyPath is incorrect.');
            verifier.equal(retrievedIndex.unique, indexConfiguration.unique, 'Retrieved index unique property is incorrect.');

            // Introduce a non-essential check: log the index names.
            // console.log(`Debug: Found indexes: ${Array.from(objectStoreHandle.indexNames).join(', ')}`);

            operationOutcome.close();
            completionCallback();
          } catch (innerError) {
            verifier.fail(`Error during IndexedDB verification: ${innerError.message}`);
            if (operationOutcome) operationOutcome.close();
            completionCallback();
          }
        };

        dbOperation.onErrorOccurred = (operationEvent) => {
          verifier.fail(`Failed to open IndexedDB for index verification: ${operationEvent.eventSource.error}`);
          completionCallback();
        };

        dbOperation.addEventListener("schemaUpgradeRequired", () => {
          verifier.fail('No schema upgrade should be needed when opening an existing database for verification.');
          completionCallback();
        });

      } catch (err) {
        handleOperationFailure(err);
      }
    })
    .catch(handleOperationFailure);
};

// Execute all defined tests using a custom test runner.
// Renamed 'test' module to 'SystemTestingFramework'.
require('system-test-runner').execute(testSuiteExports);