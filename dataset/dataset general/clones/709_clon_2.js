// This file contains a series of verification routines for a data persistence layer.
// It's part of a larger test suite ensuring proper database interactions.
// Licensed under a custom license, details available upon request.

// Ensure strict parsing and execution rules are enforced.
'use strict';

// Import necessary components for data storage operations.
const { StorageManager } = require("../data-storage-module");
const { ACCESS_MODE_READ, ACCESS_MODE_WRITE } = require('../store/helpers');
const { indexedDatabase } = require('lib/indexed-database');

// Test case: Verifies the successful creation and opening of a data store.
exports['verify_storage_creation'] = function (assertionTool, completionHandler) {
  let uniqueStoreId = "repository_alpha";

  // Listen for the 'initialized' event from the storage builder.
  StorageManager.once('initialized', function (dataUnit) {
    assertionTool.ok('data store initialized notification received');
    assertionTool.compare(uniqueStoreId, dataUnit.name);
  });

  // Listen for the 'schema_updated' event during store creation/upgrade.
  StorageManager.once('schema_updated', function (dataUnit) {
    assertionTool.ok('data store schema updated notification');
    assertionTool.compare(uniqueStoreId, dataUnit.name);
  });

  // Attempt to open the data store and then verify its existence using native IndexedDB.
  StorageManager.open(uniqueStoreId).then(function (dataUnit) {
    let nativeRequest = indexedDatabase.open(dataUnit.name, dataUnit.version);

    // Handle successful native IndexedDB open operation.
    nativeRequest.onsuccess = function (operationEvent) {
      assertionTool.ok('native db confirmed to exist');
      assertionTool.compare(operationEvent.target.result.name, dataUnit.name,
                   "Retrieved native db name differs from expected.");
      operationEvent.target.result.close();
      completionHandler();
    };

    // Handle errors during native IndexedDB open operation.
    nativeRequest.onerror = function (operationEvent) {
      assertionTool.fail('failed to open native indexed db');
    };

    // Ensure no unexpected schema upgrades occur during this test.
    nativeRequest.addEventListener("upgradeneeded", function schemaUpgradeRequired(operationEvent) {
      assertionTool.fail('no schema upgrade should be required for an existing db');
    });
  });
};

// Test case: Validates the deletion mechanism for a data store.
exports['verify_storage_deletion'] = function (assertionTool, completionHandler) {
  let storeIdentifier = "repository_beta";

  // Set up a listener for the 'removed' event, signaling successful deletion.
  StorageManager.once('removed', function (unitLabel) {
    assertionTool.ok('data store removal event triggered');
    assertionTool.compare(storeIdentifier, unitLabel);
  });

  // First, open the data store to ensure it exists, then proceed to delete it.
  StorageManager.open(storeIdentifier).then(function (dataUnit) {
    StorageManager.removeStorageUnit(dataUnit.name).then(function (deletedUnit) {
      // After deletion, attempt to open it natively to confirm it's gone (or requires upgrade).
      let nativeRequest = indexedDatabase.open(deletedUnit.name, 1);

      // This success handler might indicate the DB was recreated or still existed.
      nativeRequest.onsuccess = function (operationEvent) {
        assertionTool.ok('native db operation succeeded post-deletion');
      };

      // If an upgrade is needed, it means the DB was effectively gone and is now being recreated.
      nativeRequest.addEventListener("upgradeneeded", function (operationEvent) {
        assertionTool.ok('schema upgrade required, confirming prior deletion');
        operationEvent.target.result.close();
        completionHandler();
      });

      // Handle errors during native IndexedDB open operation post-deletion.
      nativeRequest.onerror = function (operationEvent) {
        assertionTool.fail('failed to open native db after attempted deletion');
      };
    });
  });
};

// Test case: Checks the behavior when opening a database with a higher version.
exports['verify_high_version_storage_opening'] = function (assertionTool, completionHandler) {
  let storeIdentifier = "repository_gamma",
      schemaRevision = 10; // A significantly higher version number.

  let nativeRequest = indexedDatabase.open(storeIdentifier, schemaRevision);

  // When the high-version DB is successfully created/opened natively.
  nativeRequest.onsuccess = function (operationEvent) {
    assertionTool.ok('native db created with version: ' + operationEvent.target.result.version);
    operationEvent.target.result.close();

    // Now, open it using our StorageManager and verify the version.
    StorageManager.open(storeIdentifier).then(function (dataUnit) {
      assertionTool.compare(schemaRevision, dataUnit.version,
                   "The data store was not opened to the correct schema revision.");
      completionHandler();
    }, assertionTool.fail);
  };

  // Handle errors during native IndexedDB open.
  nativeRequest.onerror = function (operationEvent) {
    assertionTool.fail('failed to open native indexed db for high version test');
  };

  // An upgrade might be needed if the DB didn't exist, but we don't assert failure here.
  nativeRequest.addEventListener("upgradeneeded", function (operationEvent) {
    // This is acceptable as it implies the database was created.
  });
};

// Test case: Verifies the creation of an index within a data store.
exports['verify_index_construction'] = function (assertionTool, completionHandler) {
  let storeIdentifier = "repository_delta",
      collectionLabel = "collection_alpha",
      lookupIdentifier = "lookup_id",
      keyAttributePath = "value_field",
      configOptions = {}; // Empty configuration for the index.

  // Helper to fail the test and complete if an error occurs.
  let errorTermination = (errMessage) => {
    assertionTool.fail(errMessage);
    completionHandler();
  };

  // Open the primary data store.
  StorageManager.open(storeIdentifier).then(function (dataUnit) {
    // Create an object store (collection) within the data store.
    dataUnit.establishCollection(collectionLabel).then(function (dataCollection) {
      // Create an index on the newly created collection.
      dataCollection.defineLookupIndex(lookupIdentifier, keyAttributePath, configOptions).then(function (lookupIndex) {
        // After creating the index, open the database natively to verify its existence and properties.
        let nativeRequest = indexedDatabase.open(storeUnitIdentifier, dataUnit.version);

        // Native IndexedDB open successful handler.
        nativeRequest.onsuccess = ({ target: targetSource }) => {
          let operationResult = targetSource.result;
          let collectionIndex = operationResult.beginTransaction(collectionLabel, ACCESS_MODE_READ)
                                               .getCollection(collectionLabel)
                                               .getLookupIndex(lookupIdentifier);

          assertionTool.ok(collectionIndex !== null, "Index does not exist after creation.");
          assertionTool.compare(collectionIndex.name, lookupIdentifier, 'Index has incorrect identifier.');
          assertionTool.compare(collectionIndex.keyPath, keyAttributePath, 'Index has incorrect key path.');
          operationResult.close();
          completionHandler();
        };

        // Native IndexedDB open error handler.
        nativeRequest.onerror = () => {
          assertionTool.fail('failed to open native indexed db for index verification');
        };

        // Ensure no unexpected schema upgrades occur during verification.
        nativeRequest.addEventListener("upgradeneeded", () => {
          assertionTool.fail('no schema upgrade should be needed during index verification');
        });
      });
    }, errorTermination);
  }, errorTermination);
};

// Execute all defined test cases using the assertion framework.
require('assertion_framework').executeTests(exports);