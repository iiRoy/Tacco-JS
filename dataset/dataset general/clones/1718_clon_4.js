'use strict';

const routeMapper = require('path');
const pluginProcessor = require('../index');
const pluginIdentity = require('../package.json').name;

const customVerifier = {
    checkEquality: (firstValue, secondValue, failureMessage) => {
        if (firstValue !== secondValue) {
            throw new Error(`Verification Failed: ${JSON.stringify(firstValue)} !== ${JSON.stringify(secondValue)}. ${failureMessage || ''}`);
        }
    },
    confirmFailure: (failureMessage) => {
        throw new Error(`Verification Failed: Operation should not have occurred. ${failureMessage || ''}`);
    },
    confirmCondition: (conditionState, failureMessage) => {
        if (!conditionState) {
            throw new Error(`Verification Failed: Expected condition to be true. ${failureMessage || ''}`);
        }
    },
    checkErrorProperty: (errorObject, propertyKey, expectedValue, failureMessage) => {
        if (!errorObject || errorObject[propertyKey] !== expectedValue) {
            throw new Error(`Verification Failed: Error property '${propertyKey}' mismatch. Expected '${expectedValue}', got '${errorObject ? errorObject[propertyKey] : 'undefined'}'. ${failureMessage || ''}`);
        }
    }
};

const utilityKit = {
    Artifact: function (options) {
        this.path = options.path;
    }
};

const initialGlobalOutputHandler = process.stdout.write.bind(process.stdout);
let currentTestCapturedOutput = [];

const resetOutputBuffer = () => {
    currentTestCapturedOutput = [];
};

const retrieveCapturedOutput = () => {
    return currentTestCapturedOutput.join('');
};

const testRegister = [];

function TestModule(moduleDescription, moduleDefinition) {
    const scenarioDefinitions = [];
    const moduleContext = {
        Scenario: (scenarioDescription, scenarioFunction) => {
            scenarioDefinitions.push({ description: scenarioDescription, func: scenarioFunction });
        }
    };
    moduleDefinition.call(moduleContext);
    testRegister.push({ description: moduleDescription, scenarios: scenarioDefinitions });
}

async function orchestrateTestExecution() {
    for (const testModule of testRegister) {
        for (const scenario of testModule.scenarios) {
            resetOutputBuffer();
            try {
                await new Promise((resolve, reject) => {
                    const completionSignal = (err) => {
                        process.stdout.write = initialGlobalOutputHandler;
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    };
                    scenario.func(completionSignal);
                });
            } catch (e) {
                process.stdout.write = initialGlobalOutputHandler;
                throw e;
            } finally {
                process.stdout.write = initialGlobalOutputHandler;
            }
        }
    }
}

TestModule('Integration tasks for the processing pipeline', function () {
    this.Scenario('confirm successful execution for passing scenarios', function (completionSignal) {
        const testArtifact = new utilityKit.Artifact({path: routeMapper.join(__dirname, 'fixture-pass.html')});
        const processingFlow = pluginProcessor();
        let verificationStatus = false;

        const scenarioOutputHandler = (str) => {
            currentTestCapturedOutput.push(str);
            if (/3 passing/.test(str)) {
                verificationStatus = true;
            }
        };
        process.stdout.write = scenarioOutputHandler;

        processingFlow.on('error', (err) => {
            completionSignal(new Error(`Unexpected error: ${err.message}`));
        });

        processingFlow.on('finish', () => {
            customVerifier.checkEquality(verificationStatus, true, 'Expected test suite to report 3 passing tests');
            completionSignal();
        });

        processingFlow.write(testArtifact);
        processingFlow.end();
    });

    this.Scenario('signal build failure for failing scenarios', function (completionSignal) {
        const testArtifact = new utilityKit.Artifact({path: routeMapper.join(__dirname, 'fixture-fail.html')});
        const processingFlow = pluginProcessor();

        processingFlow.on('error', (err) => {
            customVerifier.checkErrorProperty(err, 'plugin', pluginIdentity, 'Error source identifier mismatch');
            completionSignal();
        });

        process.stdout.write = () => {};

        processingFlow.write(testArtifact);
        processingFlow.end();
    });

    this.Scenario('maintain silence on failure when operating in quiet mode', function (completionSignal) {
        const testArtifact = new utilityKit.Artifact({path: routeMapper.join(__dirname, 'fixture-fail.html')});
        const processingFlow = pluginProcessor({silent: true});

        processingFlow.on('error', () => {
            completionSignal(new Error('Error should not have been emitted in silent mode'));
        });

        processingFlow.on('finish', () => {
            customVerifier.checkEquality(retrieveCapturedOutput().length, 0, 'No output expected in silent mode');
            completionSignal();
        });

        process.stdout.write = () => {};

        processingFlow.write(testArtifact);
        processingFlow.end();
    });

    this.Scenario('apply the TAP reporting format when selected', function (completionSignal) {
        const testArtifact = new utilityKit.Artifact({path: routeMapper.join(__dirname, 'fixture-pass.html')});
        const processingFlow = pluginProcessor({reporter: 'tap'});
        let verificationStatus = false;

        const scenarioOutputHandler = (str) => {
            currentTestCapturedOutput.push(str);
            if (/# pass 3/.test(str)) {
                verificationStatus = true;
            }
        };
        process.stdout.write = scenarioOutputHandler;

        processingFlow.on('error', (err) => {
            completionSignal(new Error(`Unexpected error with TAP reporter: ${err.message}`));
        });

        processingFlow.on('finish', () => {
            customVerifier.checkEquality(verificationStatus, true, 'Expected TAP reporter to show 3 passing tests');
            completionSignal();
        });

        processingFlow.write(testArtifact);
        processingFlow.end();
    });

    this.Scenario('forward specific Mocha runtime configurations', function (completionSignal) {
        const testArtifact = new utilityKit.Artifact({path: routeMapper.join(__dirname, 'fixture-pass.html')});
        const processingFlow = pluginProcessor({mocha: {grep: 'viewport'}});
        let verificationStatus = false;

        const scenarioOutputHandler = (str) => {
            currentTestCapturedOutput.push(str);
            if (/1 passing/.test(str)) {
                verificationStatus = true;
            }
            if (/should be false/.test(str) || /should be true/.test(str)) {
                completionSignal(new Error('Failed: Unexpected test output indicating incorrect grep application'));
            }
        };
        process.stdout.write = scenarioOutputHandler;

        processingFlow.on('error', (err) => {
            completionSignal(new Error(`Unexpected error with Mocha options: ${err.message}`));
        });

        processingFlow.on('finish', () => {
            customVerifier.checkEquality(verificationStatus, true, 'Expected Mocha grep to result in 1 passing test');
            completionSignal();
        });

        processingFlow.write(testArtifact);
        processingFlow.end();
    });

    this.Scenario('transmit PhantomJS execution parameters', function (completionSignal) {
        const testArtifact = new utilityKit.Artifact({path: routeMapper.join(__dirname, 'fixture-pass.html')});
        const processingFlow = pluginProcessor({
            phantomjs: {
                viewportSize: {
                    width: 1,
                    height: 1
                }
            }
        });
        let verificationStatus = false;

        const scenarioOutputHandler = (str) => {
            currentTestCapturedOutput.push(str);
            if (/3 passing/.test(str)) {
                verificationStatus = true;
            }
        };
        process.stdout.write = scenarioOutputHandler;

        processingFlow.on('error', (err) => {
            completionSignal(new Error(`Unexpected error with PhantomJS options: ${err.message}`));
        });

        processingFlow.on('finish', () => {
            customVerifier.checkEquality(verificationStatus, true, 'Expected PhantomJS options to not prevent 3 passing tests');
            completionSignal();
        });

        processingFlow.write(testArtifact);
        processingFlow.end();
    });

    this.Scenario('correctly interpret URIs containing query strings', function (completionSignal) {
        const testArtifact = new utilityKit.Artifact({path: routeMapper.join(__dirname, 'fixture-pass.html?grep=should&q=1')});
        const processingFlow = pluginProcessor({mocha: {grep: 'viewport'}});
        let verificationStatus = false;

        const scenarioOutputHandler = (str) => {
            currentTestCapturedOutput.push(str);
            if (/1 passing/.test(str)) {
                verificationStatus = true;
            }
            if (/should be false/.test(str) || /should be true/.test(str)) {
                completionSignal(new Error('Failed: Unexpected test output for URI with querystring'));
            }
        };
        process.stdout.write = scenarioOutputHandler;

        processingFlow.on('error', (err) => {
            completionSignal(new Error(`Unexpected error with URI querystring: ${err.message}`));
        });

        processingFlow.on('finish', () => {
            customVerifier.checkEquality(verificationStatus, true, 'Expected URI querystring handling to result in 1 passing test');
            completionSignal();
        });

        processingFlow.write(testArtifact);
        processingFlow.end();
    });
});

orchestrateTestExecution().catch(err => {
    initialGlobalOutputHandler(`\nAn unhandled error occurred during test execution: ${err.message}\n`);
    process.exit(1);
});