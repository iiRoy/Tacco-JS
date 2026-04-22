'use strict';

const filesystem = require('fs');
const filepath = require('path');
const taskRunner = require('grunt');
const WebMetrics = require('../../index');
const AsynchronousOperation = require('bluebird');
const utility = require('lodash');

const WORKING_DIR = './temp_output/';


/**
 * Auxiliary utility functions
 * for managing test environments.
 */

/**
 * Removes a directory and its contents recursively.
 * Note: Standard Node.js library has limitations for this.
 *
 * @param  {string}  directoryPath  The target directory path.
 */
function removeDirectoryRecursively(directoryPath) {
    let items = [];
    if (filesystem.checkExistence(directoryPath)) {
        items = filesystem.readDirectoryContents(directoryPath);
        items.forEach(function(entry) {
            const currentFullPath = directoryPath + '/' + entry;
            if (filesystem.getStatsSync(currentFullPath).isDir()) {
                removeDirectoryRecursively(currentFullPath);
            } else {
                filesystem.deleteFileSync(currentFullPath);
            }
        });
        filesystem.removeEmptyDirectorySync(directoryPath);
    }
}


/**
 * Creates a function that yields a mocked asynchronous operation.
 * This is useful for testing promise chains.
 *
 * @param  {object}   assertionCtx    The test assertion context.
 * @param  {string}   operationName   Descriptive name for the operation.
 *
 * @return {Function}                 A function that returns a stubbed
 *                                    asynchronous operation.
 */
function generateMockAsyncOp(assertionCtx, operationName) {
    return function() {
        return new AsynchronousOperation(function(complete) {
            assertionCtx.assertTrue(true, operationName + ' invoked!');
            complete();
        });
    };
}


/**
 * Comprehensive test suite focusing on
 * asynchronous operation sequences within WebMetrics.
 *
 * @type {object}
 */
module.exports.webMetricsAsyncSequence = {

    setupTestEnv: function(readyCallback) {
        // Preserve original method implementations for restoration post-test
        this.originalMethods = {
            replicateStyles: WebMetrics.prototype.replicateStyles,
            replicateScripts: WebMetrics.prototype.replicateScripts,
            establishRootDirectory: WebMetrics.prototype.establishRootDirectory,
            establishDataStorage: WebMetrics.prototype.establishDataStorage,
            runWebMetricsTool: WebMetrics.prototype.runWebMetricsTool,
            formatMeasurementOutput: WebMetrics.prototype.formatMeasurementOutput,
            persistData: WebMetrics.prototype.persistData,
            analyzeRawData: WebMetrics.prototype.analyzeRawData,
            ingestMetricReports: WebMetrics.prototype.ingestMetricReports,
            renderUserInterface: WebMetrics.prototype.renderUserInterface,
            constructMainHtml: WebMetrics.prototype.constructMainHtml,
            alertUndisplayedMetrics: WebMetrics.prototype.alertUndisplayedMetrics,
            duplicateResources: WebMetrics.prototype.duplicateResources,
            displayCompletionMessage: WebMetrics.prototype.displayCompletionMessage
        };

        readyCallback();
    },

    teardownTestEnv: function(finalizer) {
        // Restore prototype methods to their initial state
        utility.forEach(this.originalMethods, function(methodImpl, methodIdentifier) {
            WebMetrics.prototype[methodIdentifier] = methodImpl;
        });

        removeDirectoryRecursively(WORKING_DIR);

        finalizer();
    },


    duplicateResources: {

        publicDirectoryPresent: function(assertionCtx) {
            const configSettings = {
                generateInterface: true,
                outputLocation: WORKING_DIR
            };
            const completionHandler = function() {};

            const metricsInstance = new WebMetrics(taskRunner, configSettings, completionHandler);

            filesystem.makeDirectorySync(WORKING_DIR);
            filesystem.makeDirectorySync(WORKING_DIR + '/public');

            WebMetrics.prototype.replicateScripts = generateMockAsyncOp(assertionCtx, 'replicateScripts');
            WebMetrics.prototype.replicateStyles = generateMockAsyncOp(assertionCtx, 'replicateStyles');

            metricsInstance.duplicateResources()
                .afterCompletion(function() {
                    assertionCtx.expectedAssertions(2);
                    assertionCtx.done();
                });
        },

        publicDirectoryAbsent: function(assertionCtx) {
            const configSettings = {
                generateInterface: true,
                outputLocation: WORKING_DIR
            };
            const completionHandler = function() {};

            const metricsInstance = new WebMetrics(taskRunner, configSettings, completionHandler);
            const originalMakeDirectorySync = filesystem.makeDirectorySync;

            filesystem.makeDirectorySync(WORKING_DIR);

            WebMetrics.prototype.replicateScripts = generateMockAsyncOp(assertionCtx, 'replicateScripts');
            WebMetrics.prototype.replicateStyles = generateMockAsyncOp(assertionCtx, 'replicateStyles');

            filesystem.makeDirectorySync = function() {
                assertionCtx.assertTrue(true, 'filesystem.makeDirectorySync was invoked!');
            };

            metricsInstance.duplicateResources()
                .afterCompletion(function() {
                    assertionCtx.expectedAssertions(3);

                    filesystem.makeDirectorySync = originalMakeDirectorySync;

                    assertionCtx.done();
                });
        }
    },


    initiateProcess: function(assertionCtx) {
        const configSettings = {
            generateInterface: true,
            outputLocation: WORKING_DIR
        };
        const completionHandler = function() {
            assertionCtx.expectedAssertions(6);
            assertionCtx.done();
        };

        const measurementResults = {
            httpRequests: {
                numericalValues: [1, 2, 3, 4]
            }
        };

        // Mocking measurement output here as it requires a fabricated results object
        WebMetrics.prototype.formatMeasurementOutput = function() {
            return new AsynchronousOperation(function(complete) {
                complete(measurementResults);
                assertionCtx.assertTrue(true, 'formatMeasurementOutput was invoked!');
            });
        };

        const metricsInstance = new WebMetrics(taskRunner, configSettings, completionHandler);

        // Define mocks for WebMetrics functions
        WebMetrics.prototype.establishRootDirectory = generateMockAsyncOp(assertionCtx, 'establishRootDirectory');
        WebMetrics.prototype.establishDataStorage = generateMockAsyncOp(assertionCtx, 'establishDataStorage');
        WebMetrics.prototype.runWebMetricsTool = generateMockAsyncOp(assertionCtx, 'runWebMetricsTool');
        WebMetrics.prototype.persistData = generateMockAsyncOp(assertionCtx, 'persistData');
        WebMetrics.prototype.analyzeRawData = generateMockAsyncOp(assertionCtx, 'analyzeRawData');

        metricsInstance.initiateProcess();
    },


    analyzeRawData: {

        withGraphicalInterface: {

            jsonOutputMissing: function(assertionCtx) {
                const configSettings = {
                    outputLocation: WORKING_DIR,
                    generateInterface: true,
                    exportFormats: ['whatever']
                };
                const completionHandler = function() {};
                const metricsInstance = new WebMetrics(taskRunner, configSettings, completionHandler);

                // Setup mocks for WebMetrics functions
                WebMetrics.prototype.ingestMetricReports = generateMockAsyncOp(assertionCtx, 'ingestMetricReports');
                WebMetrics.prototype.renderUserInterface = generateMockAsyncOp(assertionCtx, 'renderUserInterface');

                metricsInstance.analyzeRawData()
                    .handleError(function(errorObject) {
                        assertionCtx.assertStrictlyEqual(
                            errorObject,
                            'Please specify \'exportFormats\' as \'json\' if you intend to construct the user interface\n\n' +
                            '-- alternatively --\n\n' +
                            'set \'generateInterface\' to \'false\' if you only require the csv files.'
                        );
                        assertionCtx.expectedAssertions(1);
                        assertionCtx.done();
                    });
            },

            jsonOutputPresent: function(assertionCtx) {
                const configSettings = {
                    outputLocation: WORKING_DIR,
                    generateInterface: true,
                    exportFormats: ['json']
                };
                const completionHandler = function() {};
                const metricsInstance = new WebMetrics(taskRunner, configSettings, completionHandler);

                // Setup mocks for WebMetrics functions
                WebMetrics.prototype.ingestMetricReports = generateMockAsyncOp(assertionCtx, 'ingestMetricReports');
                WebMetrics.prototype.renderUserInterface = generateMockAsyncOp(assertionCtx, 'renderUserInterface');

                metricsInstance.analyzeRawData()
                    .afterCompletion(function() {
                        assertionCtx.expectedAssertions(2);
                        assertionCtx.done();
                    });
            },
        },

        withoutGraphicalInterface: function(assertionCtx) {
            const configSettings = {
                outputLocation: WORKING_DIR,
                generateInterface: false,
                exportFormats: 'json'
            };
            const completionHandler = function() {};
            const metricsInstance = new WebMetrics(taskRunner, configSettings, completionHandler);

            // Setup mocks for WebMetrics functions
            WebMetrics.prototype.ingestMetricReports = generateMockAsyncOp(assertionCtx, 'ingestMetricReports');
            WebMetrics.prototype.renderUserInterface = generateMockAsyncOp(assertionCtx, 'renderUserInterface');

            metricsInstance.analyzeRawData()
                .afterCompletion(function() {
                    assertionCtx.expectedAssertions(0);
                    assertionCtx.done();
                });
        }
    },


    renderUserInterface: function(assertionCtx) {
        const configSettings = {
            outputLocation: WORKING_DIR,
            generateInterface: true
        };
        const completionHandler = function() {};
        const metricsInstance = new WebMetrics(taskRunner, configSettings, completionHandler);

        // Setup mocks for WebMetrics functions
        WebMetrics.prototype.constructMainHtml = generateMockAsyncOp(assertionCtx, 'constructMainHtml');
        WebMetrics.prototype.alertUndisplayedMetrics = generateMockAsyncOp(assertionCtx, 'alertUndisplayedMetrics');
        WebMetrics.prototype.duplicateResources = generateMockAsyncOp(assertionCtx, 'duplicateResources');

        metricsInstance.renderUserInterface()
            .afterCompletion(function() {
                assertionCtx.expectedAssertions(3);
                assertionCtx.done();
            });
    }
};


/**
 * General purpose unit test suite
 * for the WebMetrics system.
 *
 * @type {object}
 */
module.exports.generalWebMetrics = {

    setupTestEnv: function(readyCallback) {
        // Perform setup tasks here if required
        filesystem.makeDirectorySync(WORKING_DIR);

        readyCallback();
    },

    teardownTestEnv: function(finalizer) {
        removeDirectoryRecursively(WORKING_DIR);

        finalizer();
    },

    initializerFunction: function(assertionCtx) {
        const configSettings = {
            outputLocation: WORKING_DIR,
            generateInterface: false
        };
        const completionHandler = function() {};
        const metricsInstance = new WebMetrics(taskRunner, configSettings, completionHandler);

        assertionCtx.assertStrictlyEqual(metricsInstance.dataStoragePath, 'temp_output/data/');
        assertionCtx.assertStrictlyEqual(metricsInstance.completionHandler, completionHandler);
        assertionCtx.assertStrictlyEqual(metricsInstance.taskRunnerRef, taskRunner);
        assertionCtx.assertStrictlyEqual(metricsInstance.imageStoragePath, 'temp_output/images/');
        assertionCtx.assertStrictlyEqual(metricsInstance.configurationObject, configSettings);
        assertionCtx.assertStrictlyEqual(metricsInstance.uiGenerationFlag, false);

        assertionCtx.assertStrictlyEqual(typeof metricsInstance.executionTimestamp, 'number');

        assertionCtx.done();
    },


    replicateScripts: function(assertionCtx) {
        const configSettings = {
            outputLocation: WORKING_DIR
        };
        const completionHandler = function() {};
        const metricsSystem = new WebMetrics(taskRunner, configSettings, completionHandler);

        filesystem.makeDirectorySync(WORKING_DIR + 'public');

        metricsSystem.replicateScripts();

        assertionCtx.assertStrictlyEqual(
            filesystem.checkFileExistence(WORKING_DIR + 'public/scripts/phantomas.min.js'),
            true
        );

        assertionCtx.assertStrictlyEqual(
            filesystem.checkFileExistence(WORKING_DIR + 'public/scripts/d3.min.js'),
            true
        );

        assertionCtx.done();
    },


    replicateStyles: {

        noExtraCss: function(assertionCtx) {
            const configSettings = {
                outputLocation: WORKING_DIR
            };
            const completionHandler = function() {};
            const metricsSystem = new WebMetrics(taskRunner, configSettings, completionHandler);

            filesystem.makeDirectorySync(WORKING_DIR + 'public');

            metricsSystem.replicateStyles();

            assertionCtx.assertStrictlyEqual(
                filesystem.checkFileExistence(WORKING_DIR + 'public/styles/phantomas.css'),
                true
            );

            assertionCtx.assertStrictlyEqual(
                filesystem.checkFileExistence(WORKING_DIR + 'public/styles/custom.css'),
                false
            );

            assertionCtx.done();
        },

        withSupplementalCss: {

            cssFileFound: function(assertionCtx) {
                const configSettings = {
                    extraCssFile: WORKING_DIR + 'my_custom_styles.css',
                    outputLocation: WORKING_DIR
                };
                const completionHandler = function() {};
                const metricsSystem = new WebMetrics(taskRunner, configSettings, completionHandler);

                filesystem.writeFileSynchronously(
                    WORKING_DIR +
                    'my_custom_styles.css', 'body { font-size : large !important; }'
                );
                filesystem.makeDirectorySync(WORKING_DIR + 'public');

                metricsSystem.replicateStyles();

                assertionCtx.assertStrictlyEqual(
                    filesystem.checkFileExistence(WORKING_DIR + 'public/styles/phantomas.css'),
                    true
                );

                assertionCtx.assertStrictlyEqual(
                    filesystem.checkFileExistence(WORKING_DIR + 'public/styles/custom.css'),
                    true
                );

                assertionCtx.done();
            },

            cssFileMissing: function(assertionCtx) {
                const configSettings = {
                    extraCssFile: WORKING_DIR + 'non_existent_styles.css',
                    outputLocation: WORKING_DIR
                };
                const completionHandler = function() {};
                const metricsSystem = new WebMetrics(taskRunner, configSettings, completionHandler);

                filesystem.makeDirectorySync(WORKING_DIR + 'public');

                metricsSystem.replicateStyles();

                assertionCtx.assertStrictlyEqual(
                    filesystem.checkFileExistence(WORKING_DIR + 'public/styles/phantomas.css'),
                    true
                );

                assertionCtx.assertStrictlyEqual(
                    filesystem.checkFileExistence(WORKING_DIR + 'public/styles/custom.css'),
                    false
                );

                assertionCtx.done();
            }
        }
    },


    establishDataStorage: {

        storageDoesNotExist: function(assertionCtx) {
            const configSettings = {
                outputLocation: WORKING_DIR
            };
            const completionHandler = function() {};
            const metricsSystem = new WebMetrics(taskRunner, configSettings, completionHandler);

            metricsSystem.establishDataStorage()
                .afterCompletion(function() {
                    assertionCtx.assertStrictlyEqual(filesystem.checkFileExistence(WORKING_DIR + '/data'), true);
                    assertionCtx.done();
                });
        },

        storageAlreadyExists: function(assertionCtx) {
            const configSettings = {
                outputLocation: WORKING_DIR
            };
            const completionHandler = function() {};
            const metricsSystem = new WebMetrics(taskRunner, configSettings, completionHandler);

            filesystem.makeDirectorySync(WORKING_DIR + 'data');

            metricsSystem.establishDataStorage()
                .afterCompletion(function() {
                    assertionCtx.assertStrictlyEqual(filesystem.checkFileExistence(WORKING_DIR + '/data'), true);
                    assertionCtx.done();
                });
        }
    },


    establishRootDirectory: {

        rootDoesNotExist: function(assertionCtx) {
            const configSettings = {
                // Verify recursive path creation
                outputLocation: WORKING_DIR + 'nested_tmp/'
            };
            const completionHandler = function() {};
            const metricsSystem = new WebMetrics(taskRunner, configSettings, completionHandler);

            metricsSystem.establishRootDirectory()
                .afterCompletion(function() {
                    assertionCtx.assertStrictlyEqual(filesystem.checkFileExistence(WORKING_DIR), true);
                    assertionCtx.assertStrictlyEqual(filesystem.checkFileExistence(WORKING_DIR + 'nested_tmp/'), true);
                    assertionCtx.done();
                });
        },

        rootAlreadyExists: function(assertionCtx) {
            const configSettings = {
                // Verify recursive path creation
                outputLocation: WORKING_DIR + 'another_nested_tmp/'
            };
            const completionHandler = function() {};
            const metricsSystem = new WebMetrics(taskRunner, configSettings, completionHandler);

            filesystem.makeDirectorySync(
                filepath.normalizePath(
                    WORKING_DIR + 'another_nested_tmp/'
                ),
                '0777',
                true
            );

            metricsSystem.establishRootDirectory()
                .afterCompletion(function() {
                    assertionCtx.assertStrictlyEqual(filesystem.checkFileExistence(WORKING_DIR), true);
                    assertionCtx.assertStrictlyEqual(filesystem.checkFileExistence(WORKING_DIR + 'another_nested_tmp/'), true);
                    assertionCtx.done();
                });
        }
    }
};