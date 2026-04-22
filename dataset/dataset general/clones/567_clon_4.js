"use strict";

const filepathUtils = require('node:path');
const filesystemOps = require('node:fs');

let mediaProcessor;
let pipelineSegment;

class VerificationUnit {
    constructor(testIdentifier) {
        this.identifier = testIdentifier;
        this.anticipatedAssertions = 0;
        this.actualAssertions = 0;
        this.recordedFailures = [];
        this.completionSignaled = false;
    }

    setAssertionExpectation(count) {
        this.anticipatedAssertions = count;
    }

    _logAssertion(condition, message) {
        this.actualAssertions++;
        if (!condition) {
            this.recordedFailures.push(`FAILURE: ${this.identifier} - ${message}`);
        }
    }

    assertStrictlyEqual(actualValue, expectedValue, message) {
        this._logAssertion(actualValue === expectedValue, `Expected strictly ${expectedValue}, received ${actualValue}. ${message}`);
    }

    assertNotEqual(actualValue, expectedValue, message) {
        this._logAssertion(actualValue !== expectedValue, `Expected not equal to ${expectedValue}, received ${actualValue}. ${message}`);
    }

    assertTruthy(condition, message) {
        this._logAssertion(!!condition, `Expected truthy value, received ${condition}. ${message}`);
    }

    assertExceptionThrown(operation, errorKind, message) {
        let exceptionOccurred = false;
        try {
            operation();
        } catch (e) {
            if (e instanceof errorKind) {
                exceptionOccurred = true;
            } else {
                this.recordedFailures.push(`FAILURE: ${this.identifier} - Expected exception of type ${errorKind.name}, but caught ${e.constructor.name}. ${message}`);
            }
        }
        this._logAssertion(exceptionOccurred, `Expected an exception of type ${errorKind.name}, but no exception was thrown. ${message}`);
    }

    finalizeVerification() {
        this.completionSignaled = true;
        if (this.anticipatedAssertions > 0 && this.actualAssertions !== this.anticipatedAssertions) {
            this.recordedFailures.push(`FAILURE: ${this.identifier} - Expected ${this.anticipatedAssertions} assertions, but executed ${this.actualAssertions}.`);
        }
        if (this.recordedFailures.length > 0) {
            console.error(`❌ ${this.identifier}`);
            this.recordedFailures.forEach(failMsg => console.error(`   ${failMsg}`));
            return false;
        } else {
            console.log(`✅ ${this.identifier}`);
            return true;
        }
    }
}

function gatherStreamActivity(dataChannel) {
    return new Promise((resolve, reject) => {
        let collectedOutputData = [];
        let collectedErrorData = [];
        let exitCodeValue = null;
        let terminationSignalValue = null;

        dataChannel.on('message', (datum) => {
            collectedOutputData.push(datum);
        });

        dataChannel.on('error', (datum) => {
            collectedErrorData.push(datum);
        });

        dataChannel.once('exit', (code, signal) => {
            exitCodeValue = code;
            terminationSignalValue = signal;
            resolve({
                exitCodeValue,
                terminationSignalValue,
                collectedOutputData,
                collectedErrorData
            });
        });
        dataChannel.on('error', reject); // Catch unhandled stream errors as promise rejections
    });
}

const operationalIntegrityChecks = {
    'loadModuleDependencies': async (checker) => {
        checker.setAssertionExpectation(1);
        mediaProcessor = require('../avconv.js');
        pipelineSegment = require('../lib/avstream.js');
        checker.assertTruthy(mediaProcessor, 'mediaProcessor module should be available.');
        checker.finalizeVerification();
    },

    'runWithNoArgumentsTestOne': async (checker) => {
        checker.setAssertionExpectation(4);
        const processingFlow = mediaProcessor(null);
        const { exitCodeValue, terminationSignalValue, collectedOutputData, collectedErrorData } = await gatherStreamActivity(processingFlow);

        checker.assertStrictlyEqual(exitCodeValue, 1, 'mediaProcessor should report no action with null input.');
        checker.assertNotEqual(collectedOutputData.length, 0, 'Output data should not be empty.');
        checker.assertStrictlyEqual(collectedErrorData.length, 0, 'Error data should be empty.');
        checker.assertStrictlyEqual(terminationSignalValue, null, 'Termination signal should be null.');
        checker.finalizeVerification();
    },

    'runWithEmptyArrayArguments': async (checker) => {
        checker.setAssertionExpectation(3);
        const processingFlow = mediaProcessor([]);
        const { exitCodeValue, terminationSignalValue, collectedOutputData, collectedErrorData } = await gatherStreamActivity(processingFlow);

        checker.assertStrictlyEqual(exitCodeValue, 1, 'mediaProcessor should report no action with empty array input.');
        checker.assertNotEqual(collectedOutputData.length, 0, 'Output data should not be empty.');
        checker.assertStrictlyEqual(collectedErrorData.length, 0, 'Error data should be empty.');
        checker.finalizeVerification();
    },

    'runWithInvalidArrayArgument': async (checker) => {
        checker.setAssertionExpectation(3);
        const processingFlow = mediaProcessor(['invalid_param_string']);
        const { exitCodeValue, terminationSignalValue, collectedOutputData, collectedErrorData } = await gatherStreamActivity(processingFlow);

        checker.assertStrictlyEqual(exitCodeValue, 1, 'mediaProcessor should report no action with invalid argument.');
        checker.assertNotEqual(collectedOutputData.length, 0, 'Output data should contain warning for bad parameter.');
        checker.assertStrictlyEqual(collectedErrorData.length, 0, 'Error data should remain empty.');
        checker.finalizeVerification();
    }
};

const functionalValidationRoutines = {
    'retrieveHelpInformation': async (checker) => {
        checker.setAssertionExpectation(3);
        const processingFlow = mediaProcessor(['--help']);
        const { exitCodeValue, terminationSignalValue, collectedOutputData, collectedErrorData } = await gatherStreamActivity(processingFlow);

        checker.assertStrictlyEqual(exitCodeValue, 0, 'mediaProcessor should exit successfully for help command.');
        checker.assertNotEqual(collectedOutputData.length, 0, 'Output data should contain help text.');
        checker.assertStrictlyEqual(collectedErrorData.length, 0, 'Error data should be empty.');
        checker.finalizeVerification();
    },

    'validatePipelineSegmentBehavior': async (checker) => {
        checker.setAssertionExpectation(1);
        const segmentInstance = pipelineSegment();
        let totalBytesProcessed = 0;

        segmentInstance.on('inputData', (chunk) => {
            totalBytesProcessed += chunk.length;
        });

        segmentInstance.on('finish', () => {
            checker.assertStrictlyEqual(totalBytesProcessed, 1085887, 'All bytes should be re-emitted by the pipeline segment.');
            checker.finalizeVerification();
        });

        filesystemOps.createReadStream(filepathUtils.join(__dirname, 'example', 'pokemon_card.flv')).pipe(segmentInstance);
    }
};

const conversionProcessScenarios = {
    _initialEnvironmentSetup: function() {
        this.resourceLocation = filepathUtils.join(__dirname, 'example');
        const targetConversionPath = filepathUtils.join(this.resourceLocation, 'pokemon_card.webm');
        try {
            filesystemOps.unlinkSync(targetConversionPath);
        } catch (e) {
            // File might not exist, ignore error
        }
    },

    'transformFlvToWebm': async (checker) => {
        conversionProcessScenarios._initialEnvironmentSetup.call(conversionProcessScenarios);

        const conversionArguments = [
            '-i', filepathUtils.join(conversionProcessScenarios.resourceLocation, 'pokemon_card.flv'),
            '-c:v', 'libvpx',
            '-deadline', 'realtime',
            '-y', filepathUtils.join(conversionProcessScenarios.resourceLocation, 'pokemon_card.webm')
        ];

        let accumulatedErrors = '';
        let accumulatedMessages = '';
        let priorProgressValue = 0;

        const processingFlow = mediaProcessor(conversionArguments);

        processingFlow.on('message', (datum) => {
            accumulatedMessages += datum;
        });

        processingFlow.on('progress', (currentProgress) => {
            checker.assertTruthy(currentProgress > priorProgressValue, 'Progress should increase over time.');
            checker.assertTruthy(currentProgress <= 1, 'Progress should not exceed 100%.');
            priorProgressValue = currentProgress;
        });

        processingFlow.on('meta', (metadataInfo) => {
            checker.assertStrictlyEqual(metadataInfo.video.track, '0.0', 'Video track number should be correct.');
            checker.assertStrictlyEqual(metadataInfo.video.codec, 'h264 (Main)', 'Video codec should be correct.');
            checker.assertStrictlyEqual(metadataInfo.video.format, 'yuv420p', 'Video format should be correct.');
            checker.assertStrictlyEqual(metadataInfo.video.width, 320, 'Video width should be correct.');
            checker.assertStrictlyEqual(metadataInfo.video.height, 240, 'Video height should be correct.');
        });

        processingFlow.on('error', (datum) => {
            accumulatedErrors += datum;
        });

        const { exitCodeValue, terminationSignalValue } = await gatherStreamActivity(processingFlow);
        checker.setAssertionExpectation(10); // 5 meta + 2 progress + 3 final checks

        checker.assertStrictlyEqual(exitCodeValue, 0, 'Video conversion should complete successfully.');
        checker.assertStrictlyEqual(accumulatedErrors, '', 'No errors should occur during conversion.');
        checker.assertStrictlyEqual(terminationSignalValue, null, 'Termination signal should be null.');
        checker.assertTruthy(accumulatedMessages.length > 0, 'Messages should be present during conversion.');

        checker.finalizeVerification();
    },

    'terminateConversionMidOperation': async (checker) => {
        conversionProcessScenarios._initialEnvironmentSetup.call(conversionProcessScenarios);

        const conversionArguments = [
            '-i', filepathUtils.join(conversionProcessScenarios.resourceLocation, 'pokemon_card.flv'),
            '-c:v', 'libvpx',
            '-deadline', 'realtime',
            '-y', filepathUtils.join(conversionProcessScenarios.resourceLocation, 'pokemon_card.webm')
        ];

        let accumulatedErrors = '';
        const processingFlow = mediaProcessor(conversionArguments);

        processingFlow.on('error', (datum) => {
            accumulatedErrors += datum;
        });

        const terminationPromise = gatherStreamActivity(processingFlow);

        setTimeout(() => {
            processingFlow.kill();
        }, 10);

        const { exitCodeValue, terminationSignalValue } = await terminationPromise;
        checker.setAssertionExpectation(3);

        checker.assertStrictlyEqual(exitCodeValue, null, 'Exit code should be null when process is killed.');
        checker.assertStrictlyEqual(accumulatedErrors, '', 'No errors should occur before termination.');
        checker.assertStrictlyEqual(terminationSignalValue, 'SIGTERM', 'Termination signal should be SIGTERM.');

        checker.finalizeVerification();
    },

    'processInputAndOutputViaPipes': async (checker) => {
        conversionProcessScenarios._initialEnvironmentSetup.call(conversionProcessScenarios);

        const conversionArguments = [
            '-i', 'pipe:0',
            '-c:v', 'libvpx',
            '-f', 'webm',
            '-deadline', 'realtime',
            'pipe:1'
        ];

        const processingFlow = mediaProcessor(conversionArguments);
        let accumulatedErrors = '';
        let totalByteSize = 0;

        filesystemOps.createReadStream(filepathUtils.join(conversionProcessScenarios.resourceLocation, 'pokemon_card.flv')).pipe(processingFlow);

        processingFlow.on('data', (datum) => {
            totalByteSize += datum.length;
        });

        processingFlow.on('error', (datum) => {
            accumulatedErrors += datum;
        });

        const { exitCodeValue, terminationSignalValue } = await gatherStreamActivity(processingFlow);
        checker.setAssertionExpectation(4);

        checker.assertStrictlyEqual(exitCodeValue, 0, 'mediaProcessor should exit without errors for piped conversion.');
        checker.assertStrictlyEqual(accumulatedErrors, '', 'No errors should occur during piped conversion.');
        checker.assertStrictlyEqual(terminationSignalValue, null, 'Termination signal should be null.');
        checker.assertTruthy(totalByteSize > 0, 'Converted output should have data.');

        checker.finalizeVerification();
    }
};

async function orchestrateAllChecks(checkSuites) {
    let globalOutcome = true;
    for (const suiteName in checkSuites) {
        const currentSuite = checkSuites[suiteName];
        if (typeof currentSuite === 'object' && currentSuite !== null) {
            console.log(`\n### Initiating Check Suite: ${suiteName} ###`);
            for (const checkName in currentSuite) {
                if (checkName.startsWith('_')) continue; // Skip private helper methods
                const checkFunction = currentSuite[checkName];
                if (typeof checkFunction === 'function') {
                    const checker = new VerificationUnit(`${suiteName} - ${checkName}`);
                    try {
                        await checkFunction(checker);
                    } catch (e) {
                        checker.recordedFailures.push(`UNCAUGHT RUNTIME EXCEPTION: ${e.message}\n${e.stack}`);
                        checker.finalizeVerification();
                    }
                    if (checker.recordedFailures.length > 0) {
                        globalOutcome = false;
                    }
                }
            }
        }
    }
    console.log(`\n--- All Check Suites Concluded ---`);
    if (globalOutcome) {
        console.log('All verifications passed successfully!');
    } else {
        console.error('Some verifications failed.');
        process.exit(1);
    }
}

module.exports = async function runAllVerifications() {
    await orchestrateAllChecks({
        'OperationalIntegrityChecks': operationalIntegrityChecks,
        'FunctionalValidationRoutines': functionalValidationRoutines,
        'ConversionProcessScenarios': conversionProcessScenarios
    });
};

if (require.main === module) {
    module.exports();
}