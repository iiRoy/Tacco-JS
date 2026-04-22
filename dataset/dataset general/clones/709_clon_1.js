/*
 * This file contains test cases for the IndexedDB storage module.
 *
 * It is subject to the terms of the Mozilla Public License, v. 2.0.
 * A copy of the MPL was not distributed with this file; You can obtain one
 * at the official Mozilla website: http://mozilla.org/MPL/2.0/.
 *
 * This header serves as a reminder of the licensing terms.
 */

/*
 * JSHint configuration directives for this file.
 *
 * strict: true          - Enforce strict mode.
 * esnext: true          - Enable ECMAScript Next features.
 * newcap: false         - Allow constructors not starting with an uppercase letter.
 * globalstrict: true    - Allow 'use strict' in global scope.
 * devel: true           - Allow debugging statements (console.log, alert, etc.).
 * node: true            - Define Node.js global variables.
 */

// Enforce strict mode for the entire script.
'use strict';

// Import necessary modules using CommonJS syntax.
// Destructure DatabaseFactory from the indexed-db-storage module.
const {
    DatabaseFactory
} = require("../indexed-db-storage");

// Destructure READ_ONLY and READ_WRITE constants from the db/utils module.
const {
    READ_ONLY,
    READ_WRITE
} = require('../db/utils');

// Destructure indexedDB from the sdk/indexed-db module.
const {
    indexedDB
} = require('sdk/indexed-db');

// Define a test case for opening a database.
exports[
    'test opendb'
] = function(
    assert,
    done
) {
    // Declare a variable for the database name.
    var dbName = "test1";

    // Set up a one-time event listener for the 'opened' event.
    DatabaseFactory.once(
        'opened',
        function(
            db
        ) {
            // Assert that the 'db opened' event was received.
            assert.pass('db opened event');
            // Assert that the name of the opened database matches the expected name.
            assert.equal(dbName, db.name);
        }
    );

    // Set up a one-time event listener for the 'upgraded' event.
    DatabaseFactory.once(
        'upgraded',
        function(
            db
        ) {
            // Assert that the 'db upgraded' event was received.
            assert.pass('db upgraded event');
            // Assert that the name of the upgraded database matches the expected name.
            assert.equal(dbName, db.name);
        }
    );

    // Open the database with the specified name.
    DatabaseFactory.open(dbName)
        .then(
            function(
                db
            ) {
                // Once the database is opened, attempt to open it again using native IndexedDB API.
                var request = indexedDB.open(db.name, db.version);

                // Define the success handler for the request.
                request.onsuccess = function(
                    event
                ) {
                    // Assert that the database exists.
                    assert.pass('db exists');
                    // Assert that the name of the result matches the database name.
                    assert.equal(
                        event.target.result.name,
                        db.name,
                        "db name is not the same"
                    );
                    // Close the database connection.
                    event.target.result.close();
                    // Signal the test is complete.
                    done();
                };

                // Define the error handler for the request.
                request.onerror = function(
                    event
                ) {
                    // Fail the test if opening the database failed.
                    assert.fail('failed to open db');
                };

                // Add an event listener for "upgradeneeded".
                // This should not be triggered if the database already exists.
                request.addEventListener(
                    "upgradeneeded",
                    function upgradeneeded(
                        event
                    ) {
                        // Fail the test if an upgrade was needed unexpectedly.
                        assert.fail('no upgrade should be needed');
                    }
                );
            }
        );
};

// Define a test case for deleting a database.
exports['test deletedb'] = function(assert, done) {
    // Declare a variable for the database name.
    var dbName = "test2";

    // Set up a one-time event listener for the 'deleted' event.
    DatabaseFactory.once(
        'deleted',
        function(
            name
        ) {
            // Assert that the 'db deleted' event was received.
            assert.pass('db deleted event');
            // Assert that the name of the deleted database matches the expected name.
            assert.equal(dbName, name);
        }
    );

    // Open the database with the specified name.
    DatabaseFactory.open(dbName)
        .then(
            function(
                db
            ) {
                // Once opened, delete the database.
                DatabaseFactory.deleteDatabase(db.name)
                    .then(
                        function(
                            deldb
                        ) {
                            // After deletion, try to open the deleted database.
                            // This should trigger an upgradeneeded event if it was truly deleted.
                            var request = indexedDB.open(deldb.name, 1);

                            // Define the success handler for the request.
                            request.onsuccess = function(
                                event
                            ) {
                                // This should ideally not be hit directly if upgradeneeded is expected.
                                assert.pass('db exists eventually');
                            };

                            // Add an event listener for "upgradeneeded".
                            request.addEventListener(
                                "upgradeneeded",
                                function(
                                    event
                                ) {
                                    // Assert that an upgrade was needed, confirming deletion.
                                    assert.pass('upgrade needed because this db did not exist before');
                                    // Close the database connection.
                                    event.target.result.close();
                                    // Signal the test is complete.
                                    done();
                                }
                            );

                            // Define the error handler for the request.
                            request.onerror = function(
                                event
                            ) {
                                // Fail the test if opening the deleted database failed.
                                assert.fail('failed to open deleted db');
                            };
                        }
                    );
            }
        );
};

// Define a test case for opening a database with a higher version.
exports['test open high version db'] = function(assert, done) {
    // Declare variables for the database name and version.
    var dbName = "test4",
        version = 10;

    // Open the database with a high version using the native IndexedDB API.
    var request = indexedDB.open(dbName, version);

    // Define the success handler for the request.
    request.onsuccess = function(event) {
        // Assert that the database was created and log its version.
        assert.pass('db created ' + event.target.result.version);
        // Close the database connection.
        event.target.result.close();

        // Now, open the same database using DatabaseFactory.
        DatabaseFactory.open(dbName)
            .then(
                function(
                    db
                ) {
                    // Assert that the version of the opened database matches the high version.
                    assert.equal(
                        version,
                        db.version,
                        "We didn't open the db to the correct version"
                    );
                    // Signal the test is complete.
                    done();
                },
                // Provide assert.fail as the error handler.
                assert.fail
            );
    };

    // Define the error handler for the request.
    request.onerror = function(
        event
    ) {
        // Fail the test if opening the database failed.
        assert.fail('failed to open db');
    };

    // Add an event listener for "upgradeneeded".
    request.addEventListener(
        "upgradeneeded",
        function(
            event
        ) {
            // This listener is intentionally left empty or commented out for some tests.
            // assert.fail('no upgrade should be needed');
        }
    );
};

// Define a test case for creating an index within an object store.
exports['test create index'] = function(assert, done) {
    // Declare variables for database name, store name, index name, key path, and options.
    let dbName = "test14",
        storeName = "store1",
        indexName = "index1",
        indexKeyPath = "value",
        options = {};

    // Helper function to fail the test with an error and call done().
    let failWithError = (
        error
    ) => {
        assert.fail(error);
        done();
    };

    // Open the database using DatabaseFactory.
    DatabaseFactory.open(dbName)
        .then(
            function(
                db
            ) {
                // Create an object store within the database.
                db.createObjectStore(storeName)
                    .then(
                        function(
                            store
                        ) {
                            // Create an index within the object store.
                            store.createIndex(indexName, indexKeyPath, options)
                                .then(
                                    function(
                                        index
                                    ) {
                                        // Debugging console logs (commented out in original).
                                        // console.log("index", index);
                                        // console.log("stores", store.indexNames, db.objectStoreNames);
                                        // console.log("names:", store.name, db.name);
                                        // console.log("versions: ", store.version, db.version);

                                        // Now, open the database again using native IndexedDB API to verify the index.
                                        let request = indexedDB.open(dbName, db.version);

                                        // Define the success handler for the request.
                                        request.onsuccess = (
                                            {
                                                target
                                            }
                                        ) => {
                                            let result = target.result;
                                            // Get the object store and then the index.
                                            let storeIndex = result
                                                .transaction(storeName, READ_ONLY)
                                                .objectStore(storeName)
                                                .index(indexName);

                                            // Assert that the index exists.
                                            assert.ok(storeIndex !== null, "index does not exist");
                                            // Assert that the index name is correct.
                                            assert.equal(storeIndex.name, indexName, 'index does not have the correct name');
                                            // Assert that the index keyPath is correct.
                                            assert.equal(storeIndex.keyPath, indexKeyPath, 'index does not have the correct keyPath');

                                            // Close the database connection.
                                            result.close();
                                            // Signal the test is complete.
                                            done();
                                        };

                                        // Define the error handler for the request.
                                        request.onerror = () => {
                                            // Fail the test if opening the database failed.
                                            assert.fail('failed to open db');
                                        };

                                        // Add an event listener for "upgradeneeded".
                                        request.addEventListener(
                                            "upgradeneeded",
                                            () => {
                                                // Fail the test if an upgrade was needed unexpectedly.
                                                assert.fail('no upgrade should be needed in this test');
                                            }
                                        );
                                    }
                                );
                        },
                        failWithError
                    );
            },
            failWithError
        );
};

// Run all defined tests using the 'test' module.
require('test').run(exports);