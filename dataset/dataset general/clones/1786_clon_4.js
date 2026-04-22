const verifier = {
    ensureEquality: (firstValue, secondValue, failureMessage = 'Values are not equivalent') => {
        if (firstValue !== secondValue) {
            throw new Error(`Verification Failed: ${failureMessage} - Expected '${secondValue}', Obtained '${firstValue}'`);
        }
    },
    confirmTruthiness: (condition, failureMessage = 'Condition evaluated to false') => {
        if (!condition) {
            throw new Error(`Verification Failed: ${failureMessage} - Condition was false`);
        }
    },
    validateType: (item, anticipatedType, failureMessage = 'Unexpected data type') => {
        if (typeof item !== anticipatedType) {
            throw new Error(`Verification Failed: ${failureMessage} - Anticipated type '${anticipatedType}', Obtained '${typeof item}'`);
        }
    },
    checkByteLength: (buffer, requiredLength, failureMessage = 'Buffer byte length mismatch') => {
        if (buffer.length !== requiredLength) {
            throw new Error(`Verification Failed: ${failureMessage} - Anticipated length '${requiredLength}', Obtained '${buffer.length}'`);
        }
    },
    examineFirstChar: (textOutput, expectedCharacter, failureMessage = 'First character mismatch in text output') => {
        if (textOutput.toString('utf8')[0] !== expectedCharacter) {
            throw new Error(`Verification Failed: ${failureMessage} - Anticipated first char '${expectedCharacter}', Obtained '${textOutput.toString('utf8')[0]}'`);
        }
    }
};

let totalEvaluations = 0;
let failedEvaluations = 0;
let activeAsyncOperations = 0;
let scenarioQueue = [];
let suiteFinished = false;

const signalTestFinalization = (error = null) => {
    activeAsyncOperations--;
    if (error) {
        // Error already handled by the specific scenario's catch block
        // and failedEvaluations incremented there.
    }
    initiateNextScenario();
};

const finalizeOverallReport = () => {
    if (!suiteFinished && activeAsyncOperations === 0 && scenarioQueue.length === 0) {
        suiteFinished = true;
        console.log(`\n--- Comprehensive Evaluation Summary ---`);
        console.log(`Total scenarios examined: ${totalEvaluations}`);
        console.log(`Scenarios with issues: ${failedEvaluations}`);
        console.log(`Scenarios passed: ${totalEvaluations - failedEvaluations}`);
        if (failedEvaluations > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    }
};

const initiateNextScenario = () => {
    if (scenarioQueue.length > 0) {
        const nextActivity = scenarioQueue.shift();
        nextActivity();
    } else {
        setTimeout(finalizeOverallReport, 0);
    }
};

const establishEvaluationBlock = (blockTitle, scenarioDefinitions) => {
    console.log(`\nInitiating Evaluation Block: ${blockTitle}`);
    const currentBlockScenarios = [];

    const defineEvaluationScenario = (scenarioTitle, scenarioLogic) => {
        totalEvaluations++;
        currentBlockScenarios.push({ title: scenarioTitle, logic: scenarioLogic });
    };

    scenarioDefinitions(defineEvaluationScenario);

    currentBlockScenarios.forEach(scenarioEntry => {
        const executeScenarioWrapper = () => {
            try {
                console.log(`  Executing Scenario: ${scenarioEntry.title}`);
                const expectsCallback = scenarioEntry.logic.length > 0;

                if (expectsCallback) {
                    activeAsyncOperations++;
                    scenarioEntry.logic((err) => {
                        if (err) {
                            failedEvaluations++;
                            console.error(`  Scenario FAILED: ${scenarioEntry.title}`);
                            console.error(err);
                        } else {
                            console.log(`  Scenario PASSED: ${scenarioEntry.title}`);
                        }
                        signalTestFinalization(err);
                    });
                } else {
                    scenarioEntry.logic();
                    console.log(`  Scenario PASSED: ${scenarioEntry.title}`);
                    initiateNextScenario();
                }
            } catch (problem) {
                failedEvaluations++;
                console.error(`  Scenario FAILED: ${scenarioEntry.title}`);
                console.error(problem);
                if (scenarioEntry.logic.length > 0 && activeAsyncOperations > 0) {
                    signalTestFinalization(problem);
                } else {
                    initiateNextScenario();
                }
            }
        };
        scenarioQueue.push(executeScenarioWrapper);
    });
    initiateNextScenario();
};

const currentScriptPath = __filename;

establishEvaluationBlock('File System Operations', (defineEvaluation) => {
    const fileSystemManager = require('../fs');

    defineEvaluation('Asynchronous File Metadata Retrieval', (completionSignal) => {
        fileSystemManager.stat(currentScriptPath).then(function (fileMetadata) {
            verifier.validateType(fileMetadata.size, 'number', 'File size should be numeric');
            completionSignal();
        }).catch(completionSignal);
    });

    defineEvaluation('Synchronous File Metadata Retrieval', () => {
        const fileMetadata = fileSystemManager.statSync(currentScriptPath);
        verifier.validateType(fileMetadata.size, 'number', 'Sync file size should be numeric');
    });

    defineEvaluation('Asynchronous Path Existence Verification', (completionSignal) => {
        fileSystemManager.exists(currentScriptPath).then(function (pathPresence) {
            verifier.confirmTruthiness(pathPresence, 'Path must be present');
            completionSignal();
        }).catch(completionSignal);
    });

    defineEvaluation('Synchronous Path Existence Verification', () => {
        const pathPresence = fileSystemManager.existsSync(currentScriptPath);
        verifier.confirmTruthiness(pathPresence, 'Sync path must be present');
    });
});

establishEvaluationBlock('External Process Control', (defineEvaluation) => {
    const processCoordinator = require('../child_process');

    defineEvaluation('Command Execution with Expected Output', (completionSignal) => {
        processCoordinator.exec('node --version').then(function (outputBuffer) {
            verifier.examineFirstChar(outputBuffer, 'v', 'Node version output should begin with "v"');
            completionSignal();
        }).catch(completionSignal);
    });

    defineEvaluation('Command Execution with Anticipated Failure', (completionSignal) => {
        processCoordinator.exec('nonexistent_utility_xyz').catch(function (executionError) {
            completionSignal();
        }).catch(completionSignal);
    });
});

establishEvaluationBlock('Cryptographic Randomness', (defineEvaluation) => {
    const secureOperations = require('../crypto');

    defineEvaluation('Generation of Random Byte Sequence', (completionSignal) => {
        secureOperations.randomBytes(8).then(function (randomBuffer) {
            verifier.checkByteLength(randomBuffer, 8, 'Generated random buffer must be 8 bytes long');
            completionSignal();
        }).catch(completionSignal);
    });
});

establishEvaluationBlock('Data Archiving and Decompression', (defineEvaluation) => {
    const archivingTool = require('../zlib');

    defineEvaluation('Gzip Compression and Gunzip Decompression Cycle', (completionSignal) => {
        const initialText = 'a unique string for compression testing';
        archivingTool.gzip(initialText).then(function (compressedData) {
            return archivingTool.gunzip(compressedData);
        }).then(function (decompressedData) {
            verifier.ensureEquality(decompressedData, initialText, 'Decompressed data must match original text');
            completionSignal();
        }).catch(completionSignal);
    });
});