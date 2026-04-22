const fileSystemOperations = require('fs').promises;
const { existsSync: checkExistence } = require('fs');
const directoryPathUtility = require('path');
const taskRunnerInstance = require('grunt');
const MetricAnalyzer = require('../../index'); // Renamed Phantomas
const AsyncOperation = require('bluebird'); // Renamed Promise
const utilCollection = require('lodash'); // Renamed _

const temporaryWorkspaceLocation = './interim_data/';


/**
 * Transformed Helper Functions
 */

/**
 * Asynchronously remove a directory and its contents.
 * Uses fs.promises.rm for modern Node.js.
 *
 * @param  {String} targetPath absolute path to directory
 */
async function removeDirectoryAndContents(targetPath) {
    try {
        await fileSystemOperations.rm(targetPath, { recursive: true, force: true });
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Directory doesn't exist, which is an acceptable state for deletion
            return;
        }
        throw error;
    }
}


/**
 * Create a function that
 * will return a stubbed promise (AsyncOperation)
 *
 * @param  {Object}  testHandler     Custom test handler
 * @param  {String}  operationIdentifier descriptive name for the operation
 *
 * @return {Function}                Function that will
 *                                   return stubbed AsyncOperation
 */
function generateMockAsyncCallback(testHandler, operationIdentifier) {
    return () => {
        return new AsyncOperation(resolve => {
            testHandler.ok(true, `${operationIdentifier} invoked!`);
            resolve();
        });
    };
}

/**
 * Custom Test Runner/Assertion System
 */
class VerificationEngine {
    constructor() {
        this.assertionCount = 0;
        this.expectedAssertions = 0;
        this.messages = [];
        this.errors = [];
    }

    ok(condition, message) {
        this.assertionCount++;
        if (condition) {
            this.messages.push(`  ✓ ${message}`);
        } else {
            this.errors.push(`  ✗ ${message}`);
        }
    }

    strictEqual(actual, expected, message) {
        this.ok(actual === expected, `${message} (Expected: '${expected}', Actual: '${actual}')`);
    }

    expect(count) {
        this.expectedAssertions = count;
    }

    async run(testFunction) {
        this.assertionCount = 0;
        this.expectedAssertions = 0;
        this.messages = [];
        this.errors = [];

        let testDoneCalled = false;
        let testDoneResolver;
        const testDonePromise = new AsyncOperation(resolve => { testDoneResolver = resolve; });

        const modifiedTestContext = {
            ok: (condition, message) => this.ok(condition, message),
            strictEqual: (actual, expected, message) => this.strictEqual(actual, expected, message),
            expect: (count) => this.expect(count),
            done: () => {
                testDoneCalled = true;
                if (testDoneResolver) testDoneResolver();
            },
        };

        try {
            // Execute the test function. It might be async or sync, and might return a Promise or not.
            const testResult = testFunction(modifiedTestContext);

            // If the test function explicitly returns a Promise, await it.
            if (testResult instanceof AsyncOperation || (typeof testResult === 'object' && testResult !== null && typeof testResult.then === 'function')) {
                await testResult;
            }

            // After the test function has run (or its promise has resolved), wait for test.done()
            // This handles tests that use callbacks for completion.
            if (!testDoneCalled) {
                await AsyncOperation.race([
                    testDonePromise,
                    AsyncOperation.delay(5000).then(() => { throw new Error('Test timed out waiting for done() callback.'); })
                ]);
            }

            if (this.expectedAssertions > 0 && this.assertionCount !== this.expectedAssertions) {
                this.errors.push(`  ✗ Expected ${this.expectedAssertions} assertions, but got ${this.assertionCount}.`);
            }

            if (this.errors.length > 0) {
                throw new Error(`Test Failed: \n${this.errors.join('\n')}\n${this.messages.join('\n')}`);
            }
            return { success: true, messages: this.messages, errors: this.errors };
        } catch (err) {
            this.errors.push(`  ✗ Unhandled Exception: ${err.message}`);
            return { success: false, messages: this.messages, errors: this.errors, exception: err };
        }
    }
}

class TestOrchestrator {
    constructor() {
        this.suites = {};
    }

    addSuite(name, suiteDefinition) {
        this.suites[name] = suiteDefinition;
    }

    async executeAll() {
        console.log('Starting all test suites...');
        for (const suiteName of Object.keys(this.suites)) {
            console.log(`\n--- Suite: ${suiteName} ---`);
            const suite = this.suites[suiteName];
            const suiteContext = {}; // Shared context for setUp/tearDown

            if (suite.preTestSetup) {
                console.log('  Running pre-test setup...');
                await suite.preTestSetup.call(suiteContext);
            }

            for (const testKey of Object.keys(suite)) {
                if (testKey === 'preTestSetup' || testKey === 'postTestCleanup') continue;

                if (typeof suite[testKey] === 'function') {
                    const engine = new VerificationEngine();
                    try {
                        await engine.run(async (testHandler) => { // Wrap function in async to ensure it returns a promise
                            await suite[testKey].call(suiteContext, testHandler);
                        });
                        console.log(`  ✓ ${testKey}`);
                    } catch (err) {
                        console.error(`  ✗ ${testKey}: FAILED`);
                        console.error(err.message);
                        // process.exit(1); // Exit on first failure for quick feedback
                    }
                } else if (typeof suite[testKey] === 'object' && suite[testKey] !== null) {
                    console.log(`  Sub-suite: ${testKey}`);
                    const subSuite = suite[testKey];
                    for (const subTestKey of Object.keys(subSuite)) {
                        const engine = new VerificationEngine();
                        try {
                            await engine.run(async (testHandler) => {
                                await subSuite[subTestKey].call(suiteContext, testHandler);
                            });
                            console.log(`    ✓ ${subTestKey}`);
                        } catch (err) {
                            console.error(`    ✗ ${subTestKey}: FAILED`);
                            console.error(err.message);
                            // process.exit(1);
                        }
                    }
                }
            }

            if (suite.postTestCleanup) {
                console.log('  Running post-test cleanup...');
                await suite.postTestCleanup.call(suiteContext);
            }
            console.log(`--- Suite: ${suiteName} Completed ---\n`);
        }
        console.log('All test suites finished.');
    }
}


/**
 * Test suite for checking promises flow (renamed from phantomasPromisesFlow)
 */
const flowControlVerification = {
    preTestSetup: async function() {
        this.originalMethodBackups = {
            replicateStyleAssets: MetricAnalyzer.prototype.replicateStyleAssets,
            replicateScriptAssets: MetricAnalyzer.prototype.replicateScriptAssets,
            createIndexDirectory: MetricAnalyzer.prototype.createIndexDirectory,
            createDataDirectory: MetricAnalyzer.prototype.createDataDirectory,
            executeMetricAnalysis: MetricAnalyzer.prototype.executeMetricAnalysis,
            generateAnalysisResult: MetricAnalyzer.prototype.generateAnalysisResult,
            persistMeasurementData: MetricAnalyzer.prototype.persistMeasurementData,
            processCollectedData: MetricAnalyzer.prototype.processCollectedData,
            retrieveMetricsFiles: MetricAnalyzer.prototype.retrieveMetricsFiles,
            renderUserInterface: MetricAnalyzer.prototype.renderUserInterface,
            composeIndexHtml: MetricAnalyzer.prototype.composeIndexHtml,
            alertUndisplayedMetrics: MetricAnalyzer.prototype.alertUndisplayedMetrics,
            replicateStaticAssets: MetricAnalyzer.prototype.replicateStaticAssets,
            displayCompletionMessage: MetricAnalyzer.prototype.displayCompletionMessage
        };
    },

    postTestCleanup: async function() {
        utilCollection.each(this.originalMethodBackups, (val, key) => {
            MetricAnalyzer.prototype[key] = val;
        });
        await removeDirectoryAndContents(temporaryWorkspaceLocation);
    },

    replicateStaticAssetsVerification: {
        publicDestinationExists: async function(testHandler) {
            const configurationSettings = {
                buildUi: true,
                indexPath: temporaryWorkspaceLocation
            };
            const completionCallback = () => {};

            const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

            await fileSystemOperations.mkdir(temporaryWorkspaceLocation, { recursive: true });
            await fileSystemOperations.mkdir(directoryPathUtility.join(temporaryWorkspaceLocation, 'public'), { recursive: true });

            MetricAnalyzer.prototype.replicateScriptAssets = generateMockAsyncCallback(testHandler, 'replicateScriptAssets');
            MetricAnalyzer.prototype.replicateStyleAssets = generateMockAsyncCallback(testHandler, 'replicateStyleAssets');

            await analyzerInstance.replicateStaticAssets();
            testHandler.expect(2);
            testHandler.done();
        },

        publicDestinationAbsent: async function(testHandler) {
            const configurationSettings = {
                buildUi: true,
                indexPath: temporaryWorkspaceLocation
            };
            const completionCallback = () => {};

            const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

            await fileSystemOperations.mkdir(temporaryWorkspaceLocation, { recursive: true });

            MetricAnalyzer.prototype.replicateScriptAssets = generateMockAsyncCallback(testHandler, 'replicateScriptAssets');
            MetricAnalyzer.prototype.replicateStyleAssets = generateMockAsyncCallback(testHandler, 'replicateStyleAssets');

            const originalFsPromisesMkdir = fileSystemOperations.mkdir;
            fileSystemOperations.mkdir = async (dirPath, options) => {
                testHandler.ok(true, 'fileSystemOperations.mkdir was invoked!');
                return originalFsPromisesMkdir(dirPath, options);
            };

            await analyzerInstance.replicateStaticAssets();
            testHandler.expect(3);

            fileSystemOperations.mkdir = originalFsPromisesMkdir; // Restore original
            testHandler.done();
        }
    },

    initiateAnalysis: async function(testHandler) {
        const configurationSettings = {
            buildUi: true,
            indexPath: temporaryWorkspaceLocation
        };
        const completionCallback = () => {
            testHandler.expect(6);
            testHandler.done();
        };

        const measurementOutcomes = {
            requests: {
                values: [1, 2, 3, 4]
            }
        };

        MetricAnalyzer.prototype.generateAnalysisResult = function() {
            return new AsyncOperation(resolve => {
                resolve(measurementOutcomes);
                testHandler.ok(true, 'generateAnalysisResult invoked!');
            });
        };

        const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

        MetricAnalyzer.prototype.createIndexDirectory = generateMockAsyncCallback(testHandler, 'createIndexDirectory');
        MetricAnalyzer.prototype.createDataDirectory = generateMockAsyncCallback(testHandler, 'createDataDirectory');
        MetricAnalyzer.prototype.executeMetricAnalysis = generateMockAsyncCallback(testHandler, 'executeMetricAnalysis');
        MetricAnalyzer.prototype.persistMeasurementData = generateMockAsyncCallback(testHandler, 'persistMeasurementData');
        MetricAnalyzer.prototype.processCollectedData = generateMockAsyncCallback(testHandler, 'processCollectedData');

        analyzerInstance.kickOff(); // This is not awaited as it calls the `completionCallback` internally
    },

    handleCollectedData: {
        withUserInterface: {
            jsonOutputMissing: async function(testHandler) {
                const configurationSettings = {
                    indexPath: temporaryWorkspaceLocation,
                    buildUi: true,
                    output: ['whatever']
                };
                const completionCallback = () => {};
                const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

                MetricAnalyzer.prototype.retrieveMetricsFiles = generateMockAsyncCallback(testHandler, 'retrieveMetricsFiles');
                MetricAnalyzer.prototype.renderUserInterface = generateMockAsyncCallback(testHandler, 'renderUserInterface');

                try {
                    await analyzerInstance.processCollectedData();
                    testHandler.ok(false, 'Expected an error, but none was thrown.');
                } catch (exceptionDetails) {
                    testHandler.strictEqual(
                        exceptionDetails,
                        'Please set \'output\' to \'json\' if you want to build UI\n\n' +
                        '-- or --\n\n' +
                        'set \'buildUi\' to \'false\' if you want to get only the csv files.',
                        'Error message matches expected.'
                    );
                    testHandler.expect(1);
                }
                testHandler.done();
            },
            jsonOutputPresent: async function(testHandler) {
                const configurationSettings = {
                    indexPath: temporaryWorkspaceLocation,
                    buildUi: true,
                    output: ['json']
                };
                const completionCallback = () => {};
                const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

                MetricAnalyzer.prototype.retrieveMetricsFiles = generateMockAsyncCallback(testHandler, 'retrieveMetricsFiles');
                MetricAnalyzer.prototype.renderUserInterface = generateMockAsyncCallback(testHandler, 'renderUserInterface');

                await analyzerInstance.processCollectedData();
                testHandler.expect(2);
                testHandler.done();
            },
        },
        withoutUserInterface: async function(testHandler) {
            const configurationSettings = {
                indexPath: temporaryWorkspaceLocation,
                buildUi: false,
                output: 'json'
            };
            const completionCallback = () => {};
            const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

            MetricAnalyzer.prototype.retrieveMetricsFiles = generateMockAsyncCallback(testHandler, 'retrieveMetricsFiles');
            MetricAnalyzer.prototype.renderUserInterface = generateMockAsyncCallback(testHandler, 'renderUserInterface'); // This should NOT be called

            await analyzerInstance.processCollectedData();
            testHandler.expect(1); // Only retrieveMetricsFiles is called
            testHandler.done();
        }
    },

    renderUserInterfaceVerification: async function(testHandler) {
        const configurationSettings = {
            indexPath: temporaryWorkspaceLocation,
            buildUi: true
        };
        const completionCallback = () => {};
        const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

        MetricAnalyzer.prototype.composeIndexHtml = generateMockAsyncCallback(testHandler, 'composeIndexHtml');
        MetricAnalyzer.prototype.alertUndisplayedMetrics = generateMockAsyncCallback(testHandler, 'alertUndisplayedMetrics');
        MetricAnalyzer.prototype.replicateStaticAssets = generateMockAsyncCallback(testHandler, 'replicateStaticAssets');

        await analyzerInstance.renderUserInterface();
        testHandler.expect(3);
        testHandler.done();
    }
};


/**
 * General unit test suite (renamed from phantomas)
 */
const generalAnalyzerTests = {
    preTestSetup: async function() {
        await fileSystemOperations.mkdir(temporaryWorkspaceLocation, { recursive: true });
    },

    postTestCleanup: async function() {
        await removeDirectoryAndContents(temporaryWorkspaceLocation);
    },

    analyzerConstructor: async function(testHandler) {
        const configurationSettings = {
            indexPath: temporaryWorkspaceLocation,
            buildUi: false
        };
        const completionCallback = () => {};
        const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

        testHandler.strictEqual(analyzerInstance.dataStoragePath, directoryPathUtility.join(temporaryWorkspaceLocation, 'data/'), 'dataStoragePath property check');
        testHandler.strictEqual(analyzerInstance.completionHandler, completionCallback, 'completionHandler property check');
        testHandler.strictEqual(analyzerInstance.taskRunner, taskRunnerInstance, 'taskRunner property check');
        testHandler.strictEqual(analyzerInstance.imageOutputLocation, directoryPathUtility.join(temporaryWorkspaceLocation, 'images/'), 'imageOutputLocation property check');
        testHandler.strictEqual(analyzerInstance.configOptions, configurationSettings, 'configOptions property check');
        testHandler.strictEqual(analyzerInstance.enableUserInterface, false, 'enableUserInterface property check');
        testHandler.ok(typeof analyzerInstance.generationTimestamp === 'number', 'generationTimestamp property is a number');

        testHandler.expect(7);
        testHandler.done();
    },


    replicateScriptAssetsTest: async function(testHandler) {
        const configurationSettings = {
            indexPath: temporaryWorkspaceLocation
        };
        const completionCallback = () => {};
        const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

        await fileSystemOperations.mkdir(directoryPathUtility.join(temporaryWorkspaceLocation, 'public'), { recursive: true });

        await analyzerInstance.replicateScriptAssets();

        testHandler.ok(
            checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'public/scripts/phantomas.min.js')),
            'phantomas.min.js exists.'
        );

        testHandler.ok(
            checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'public/scripts/d3.min.js')),
            'd3.min.js exists.'
        );

        testHandler.expect(2);
        testHandler.done();
    },


    replicateStyleAssetsTest: {
        noExtraStylesheet: async function(testHandler) {
            const configurationSettings = {
                indexPath: temporaryWorkspaceLocation
            };
            const completionCallback = () => {};
            const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

            await fileSystemOperations.mkdir(directoryPathUtility.join(temporaryWorkspaceLocation, 'public'), { recursive: true });

            await analyzerInstance.replicateStyleAssets();

            testHandler.ok(
                checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'public/styles/phantomas.css')),
                'phantomas.css exists.'
            );

            testHandler.ok(
                !checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'public/styles/custom.css')),
                'custom.css does not exist.'
            );

            testHandler.expect(2);
            testHandler.done();
        },
        withSupplementalStylesheet: {
            stylesheetFound: async function(testHandler) {
                const cssFilePath = directoryPathUtility.join(temporaryWorkspaceLocation, 'style_extra.css');
                const configurationSettings = {
                    additionalStylesheet: cssFilePath,
                    indexPath: temporaryWorkspaceLocation
                };
                const completionCallback = () => {};
                const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

                await fileSystemOperations.writeFile(
                    cssFilePath,
                    'body { color : red !important; }'
                );
                await fileSystemOperations.mkdir(directoryPathUtility.join(temporaryWorkspaceLocation, 'public'), { recursive: true });

                await analyzerInstance.replicateStyleAssets();

                testHandler.ok(
                    checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'public/styles/phantomas.css')),
                    'phantomas.css exists.'
                );

                testHandler.ok(
                    checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'public/styles/custom.css')),
                    'custom.css exists.'
                );

                testHandler.expect(2);
                testHandler.done();
            },
            stylesheetNotFound: async function(testHandler) {
                const cssFilePath = directoryPathUtility.join(temporaryWorkspaceLocation, 'style_extra.css');
                const configurationSettings = {
                    additionalStylesheet: cssFilePath,
                    indexPath: temporaryWorkspaceLocation
                };
                const completionCallback = () => {};
                const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

                await fileSystemOperations.mkdir(directoryPathUtility.join(temporaryWorkspaceLocation, 'public'), { recursive: true });

                await analyzerInstance.replicateStyleAssets();

                testHandler.ok(
                    checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'public/styles/phantomas.css')),
                    'phantomas.css exists.'
                );

                testHandler.ok(
                    !checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'public/styles/custom.css')),
                    'custom.css does not exist.'
                );

                testHandler.expect(2);
                testHandler.done();
            }
        }
    },


    establishDataStorage: {
        storageAbsent: async function(testHandler) {
            const configurationSettings = {
                indexPath: temporaryWorkspaceLocation
            };
            const completionCallback = () => {};
            const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

            await analyzerInstance.createDataDirectory();
            testHandler.ok(checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'data')), 'Data directory exists.');
            testHandler.expect(1);
            testHandler.done();
        },
        storagePresent: async function(testHandler) {
            const configurationSettings = {
                indexPath: temporaryWorkspaceLocation
            };
            const completionCallback = () => {};
            const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

            await fileSystemOperations.mkdir(directoryPathUtility.join(temporaryWorkspaceLocation, 'data'), { recursive: true });

            await analyzerInstance.createDataDirectory();
            testHandler.ok(checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'data')), 'Data directory exists.');
            testHandler.expect(1);
            testHandler.done();
        }
    },


    establishIndexLocation: {
        indexLocationAbsent: async function(testHandler) {
            const configurationSettings = {
                indexPath: directoryPathUtility.join(temporaryWorkspaceLocation, 'nested_temp/')
            };
            const completionCallback = () => {};
            const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

            await analyzerInstance.createIndexDirectory();
            testHandler.ok(checkExistence(temporaryWorkspaceLocation), 'Base temporary directory exists.');
            testHandler.ok(checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'nested_temp/')), 'Nested temporary directory exists.');
            testHandler.expect(2);
            testHandler.done();
        },
        indexLocationPresent: async function(testHandler) {
            const configurationSettings = {
                indexPath: directoryPathUtility.join(temporaryWorkspaceLocation, 'nested_temp/')
            };
            const completionCallback = () => {};
            const analyzerInstance = new MetricAnalyzer(taskRunnerInstance, configurationSettings, completionCallback);

            await fileSystemOperations.mkdir(
                directoryPathUtility.join(temporaryWorkspaceLocation, 'nested_temp/'),
                { recursive: true }
            );

            await analyzerInstance.createIndexDirectory();
            testHandler.ok(checkExistence(temporaryWorkspaceLocation), 'Base temporary directory exists.');
            testHandler.ok(checkExistence(directoryPathUtility.join(temporaryWorkspaceLocation, 'nested_temp/')), 'Nested temporary directory exists.');
            testHandler.expect(2);
            testHandler.done();
        }
    }
};

// Orchestrate and execute tests
(async () => {
    const testCoordinator = new TestOrchestrator();
    testCoordinator.addSuite('FlowControlVerification', flowControlVerification);
    testCoordinator.addSuite('GeneralAnalyzerTests', generalAnalyzerTests);
    await testCoordinator.executeAll();
})();