'use strict';

// --- Mock File System Module ---
const virtualFileSystem = {
    readDataFromPath: (path) => {
        if (path === 'mock/path/to/key.pem') {
            return '---BEGIN MOCKED KEY DATA---';
        }
        return '';
    }
};

// --- Custom Assertion Engine ---
const assertionEngine = {
    totalEvaluations: 0,
    failedEvaluations: 0,
    report: [],

    evaluateCondition: (condition, message = 'Condition check failed') => {
        assertionEngine.totalEvaluations++;
        if (!condition) {
            assertionEngine.failedEvaluations++;
            const error = new Error(`Assertion Failure: ${message}`);
            assertionEngine.report.push({ type: 'fail', message, error });
            throw error;
        }
    },
    evaluateEquality: (actual, expected, message = 'Equality check failed') => {
        assertionEngine.totalEvaluations++;
        if (actual !== expected) {
            assertionEngine.failedEvaluations++;
            const error = new Error(`Assertion Failure: ${message}: Expected "${expected}", got "${actual}"`);
            assertionEngine.report.push({ type: 'fail', message, error });
            throw error;
        }
    },
    evaluateInequality: (actual, expected, message = 'Inequality check failed') => {
        assertionEngine.totalEvaluations++;
        if (actual === expected) {
            assertionEngine.failedEvaluations++;
            const error = new Error(`Assertion Failure: ${message}: Expected not to be "${expected}", but got "${actual}"`);
            assertionEngine.report.push({ type: 'fail', message, error });
            throw error;
        }
    },
    evaluateLength: (collection, expectedLength, message = 'Collection length check failed') => {
        assertionEngine.totalEvaluations++;
        if (!collection || collection.length !== expectedLength) {
            assertionEngine.failedEvaluations++;
            const error = new Error(`Assertion Failure: ${message}: Expected length ${expectedLength}, got ${collection ? collection.length : 'null/undefined'}`);
            assertionEngine.report.push({ type: 'fail', message, error });
            throw error;
        }
    },
    signalUnexpectedSuccess: (message = 'Operation succeeded unexpectedly') => {
        assertionEngine.totalEvaluations++;
        assertionEngine.failedEvaluations++;
        const error = new Error(`Assertion Failure: ${message}`);
        assertionEngine.report.push({ type: 'fail', message, error });
        throw error;
    }
};

// --- Mock Secure Shell Agent Class (replaces SSH) ---
class SecureShellAgent {
    constructor(parameters) {
        this.agentParameters = parameters;
        this.connectionEndpoint = parameters.hostname || 'default.host.mock';
        this.activeDirectory = '/';
        this.commandQueue = [];
        this.internalConnectionObject = {
            _listeners: {},
            addListener: (event, handler) => {
                this.internalConnectionObject._listeners[event] = handler;
            },
            emitEvent: (event, ...args) => {
                if (this.internalConnectionObject._listeners[event]) {
                    this.internalConnectionObject._listeners[event](...args);
                }
            }
        };
        this.commandProcessorPromise = null;
        this.currentStepResolver = null;
    }

    initiate(actionCallbacks) {
        if (this.connectionEndpoint === 'This is not a valid hostname') {
            setTimeout(() => actionCallbacks.onFailure(new Error('Mock: Invalid host for connection')), 10);
            return;
        }

        setTimeout(() => {
            actionCallbacks.onSuccess();
            if (!this.commandProcessorPromise) {
                this.beginCommandProcessing();
            }
        }, 10);
    }

    terminate() {
        this.commandQueue = []; // Clear all pending commands
        setTimeout(() => {
            if (this.currentStepResolver) {
                this.currentStepResolver(); // Allow current processing step to finish/break
            }
            this.internalConnectionObject.emitEvent('close');
        }, 10);
    }

    run(operationText, operationOptions = {}) {
        const fullOperation = operationOptions.argumentList ? `${operationText} ${operationOptions.argumentList.join(' ')}` : operationText;
        this.commandQueue.push({ operation: fullOperation, options: operationOptions });
        return this;
    }

    resetAgent() {
        const priorConnection = this.internalConnectionObject;
        this.internalConnectionObject = {
            _listeners: {},
            addListener: (event, handler) => {
                this.internalConnectionObject._listeners[event] = handler;
            },
            emitEvent: (event, ...args) => {
                if (this.internalConnectionObject._listeners[event]) {
                    this.internalConnectionObject._listeners[event](...args);
                }
            }
        };
        this.commandQueue = [];
        if (this.currentStepResolver) {
            this.currentStepResolver(); // Interrupt current command processing
        }
        this.commandProcessorPromise = null;
        setTimeout(() => priorConnection.emitEvent('close'), 1);
    }

    async beginCommandProcessing() {
        this.commandProcessorPromise = Promise.resolve();

        while (true) {
            if (this.commandQueue.length === 0) {
                this.commandProcessorPromise = null;
                break;
            }

            const currentOperation = this.commandQueue.shift();
            const { operation, options } = currentOperation;

            let stepResolver;
            this.commandProcessorPromise = new Promise(resolve => { stepResolver = resolve; });
            this.currentStepResolver = stepResolver;

            await new Promise(resolve => setTimeout(resolve, 5)); // Simulate operation delay

            let proceedWithQueue = true;
            let finalCode = 0;
            let stdOutput = '';
            let errOutput = '';

            // Simulate command behavior
            if (operation.startsWith('echo')) {
                const contentMatch = operation.match(/"([^"]*)"/);
                stdOutput = contentMatch ? contentMatch[1] : '';
                if (operation.includes('1>&2')) {
                    errOutput = stdOutput;
                    stdOutput = '';
                }
            } else if (operation.startsWith('exit')) {
                const codeMatch = operation.match(/exit (\d+)/);
                finalCode = codeMatch ? parseInt(codeMatch[1], 10) : 0;
            } else if (operation.includes('pwd')) {
                stdOutput = this.activeDirectory;
            } else if (operation.startsWith('sudo echo')) {
                const contentMatch = operation.match(/"([^"]*)"/);
                stdOutput = contentMatch ? contentMatch[1] : '';
            }

            // Trigger callbacks
            if (options.standardOutput && stdOutput) {
                options.standardOutput(stdOutput + '\n');
            }
            if (options.errorOutput && errOutput) {
                options.errorOutput(errOutput + '\n');
            }
            if (options.exitCallback) {
                const result = options.exitCallback(finalCode);
                if (result === false) {
                    proceedWithQueue = false;
                }
            }

            this.currentStepResolver = null;

            if (!proceedWithQueue) {
                this.commandQueue = []; // Clear remaining commands if exit callback returned false
                this.commandProcessorPromise = null;
                break;
            }

            stepResolver(); // Resolve current step, allowing next iteration
            await this.commandProcessorPromise; // Wait for the resolved promise
        }
    }
}

// --- Custom Test Runner ---
const customTestFramework = {
    currentTopic: '',
    testCases: [],
    preExecutionHook: null,
    totalCases: 0,
    successfulCases: 0,
    failedCases: 0,
    currentCaseIndex: 0,

    defineTopic: (name, setupFunction) => {
        customTestFramework.currentTopic = name;
        console.log(`\n--- ${name} ---`);
        setupFunction();
        customTestFramework.currentTopic = '';
    },

    setBeforeEach: (hookFn) => {
        customTestFramework.preExecutionHook = hookFn;
    },

    verifyOutcome: (description, testFn) => {
        customTestFramework.testCases.push({ topic: customTestFramework.currentTopic, description, fn: testFn });
        customTestFramework.totalCases++;
    },

    async commenceExecution() {
        console.log('Initiating test sequence...');
        await customTestFramework.executeNextCase();
        customTestFramework.displaySummary();
        process.exit(customTestFramework.failedCases > 0 || assertionEngine.failedEvaluations > 0 ? 1 : 0);
    },

    async executeNextCase() {
        if (customTestFramework.currentCaseIndex >= customTestFramework.testCases.length) {
            return; // All cases executed
        }

        const currentCase = customTestFramework.testCases[customTestFramework.currentCaseIndex];
        
        try {
            if (customTestFramework.preExecutionHook) {
                customTestFramework.preExecutionHook();
            }

            await new Promise((resolve, reject) => {
                const completionSignal = (error = null) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                };

                const testFnResult = currentCase.fn(completionSignal);
                if (testFnResult && typeof testFnResult.then === 'function') { // Test function returned a Promise
                    testFnResult.then(() => completionSignal()).catch(error => completionSignal(error));
                } else if (currentCase.fn.length === 0) { // Synchronous test (no completionSignal argument)
                    completionSignal();
                }
                // If it expects completionSignal but doesn't return a promise, it must call completionSignal itself.
            });

            customTestFramework.successfulCases++;
            console.log(`  ✅ ${currentCase.description}`);

        } catch (error) {
            customTestFramework.failedCases++;
            console.error(`  ❌ ${currentCase.description} - Error: ${error.message}`);
        } finally {
            customTestFramework.currentCaseIndex++;
            await customTestFramework.executeNextCase(); // Proceed to the next case
        }
    },

    displaySummary() {
        console.log(`\n--- Overall Test Report ---`);
        console.log(`Total test cases: ${customTestFramework.totalCases}`);
        console.log(`Successful cases: ${customTestFramework.successfulCases}`);
        console.log(`Failed cases: ${customTestFramework.failedCases}`);
        console.log(`Total assertion evaluations: ${assertionEngine.totalEvaluations}`);
        console.log(`Failed assertion evaluations: ${assertionEngine.failedEvaluations}`);
        if (assertionEngine.report.length > 0) {
            console.log('\nDetailed assertion failures:');
            assertionEngine.report.filter(r => r.type === 'fail').forEach(r => console.error(`  - ${r.message}`));
        }
    }
};

// --- Global Aliases for Test Framework ---
const defineTestGroup = customTestFramework.defineTopic;
const setupProcedure = customTestFramework.setBeforeEach;
const checkScenario = customTestFramework.verifyOutcome;

// --- Global Aliases for Assertions ---
const assertTruth = assertionEngine.evaluateCondition;
const assertEquivalence = assertionEngine.evaluateEquality;
const assertDifference = assertionEngine.evaluateInequality;
const assertCollectionSize = assertionEngine.evaluateLength;
const assertFailure = assertionEngine.signalUnexpectedSuccess;

// --- Mock Configuration Data ---
const runtimeSettings = {
    keyPath: 'mock/path/to/key.pem',
    hostname: 'test-host-mock.example.com',
    port: 2222 // Different port
};

// --- Initialize Mock Dependencies ---
let shellAgent;

// Apply key data if path is specified
if (runtimeSettings.keyPath) {
    runtimeSettings.keyData = virtualFileSystem.readDataFromPath(runtimeSettings.keyPath);
}

// --- Test Definitions ---
defineTestGroup('SecureShellAgent Operations', function() {
    setupProcedure(function() {
        shellAgent = new SecureShellAgent(runtimeSettings);
    });

    defineTestGroup('Connection Initiation', function() {
        checkScenario('should establish connection with valid credentials', function(completionCallback) {
            shellAgent.initiate({
                onSuccess: completionCallback,
                onFailure: function(issue) {
                    assertFailure(issue.message);
                }
            });
        });

        checkScenario('should fail to connect with invalid endpoint', function(completionCallback) {
            shellAgent.connectionEndpoint = 'This is not a valid hostname';
            shellAgent.initiate({
                onSuccess: function() {
                    assertFailure('Connection should not succeed with invalid info');
                },
                onFailure: function() {
                    completionCallback();
                }
            });
        });
    });

    defineTestGroup('Connection Termination', function() {
        checkScenario('should terminate the active connection', function(completionCallback) {
            shellAgent.internalConnectionObject.addListener('close', function() {
                completionCallback();
            });

            shellAgent.initiate({
                onSuccess: function() {
                    shellAgent.terminate();
                }
            });
        });
    });

    defineTestGroup('Command Execution', function() {
        checkScenario('should enqueue a single command', function() {
            shellAgent.run('single_command_alias');
            assertCollectionSize(shellAgent.commandQueue, 1);
        });

        checkScenario('should append arguments to command string', function() {
            shellAgent.run('command_with_args', {
                argumentList: ['arg1', 'arg2', 'arg3']
            });

            const queuedOperation = shellAgent.commandQueue[0].operation;
            assertEquivalence(queuedOperation, 'command_with_args arg1 arg2 arg3');
        });

        checkScenario('should capture standard output', function(completionCallback) {
            const resultContent = 'Alpha Beta';
            shellAgent.run('echo', {
                argumentList: ['"' + resultContent + '"'],
                standardOutput: function(outputData) {
                    assertEquivalence(outputData.trim(), resultContent);
                    completionCallback();
                }
            }).initiate({ onSuccess: () => {} }); // Start processing after queuing
        });

        checkScenario('should capture error output', function(completionCallback) {
            const errorContent = 'Gamma Delta';
            shellAgent.run('echo', {
                argumentList: ['"' + errorContent + '"', '1>&2'],
                errorOutput: function(errorData) {
                    assertEquivalence(errorData.trim(), errorContent);
                    completionCallback();
                }
            }).initiate({ onSuccess: () => {} });
        });

        checkScenario('should capture the operation exit code', function(completionCallback) {
            const simulatedExitCode = Math.round(Math.random() * 200);
            shellAgent.run('exit', {
                argumentList: [simulatedExitCode],
                exitCallback: function(code) {
                    assertEquivalence(code, simulatedExitCode);
                    completionCallback();
                }
            }).initiate({ onSuccess: () => {} });
        });

        checkScenario('should process multiple sequential commands', function(completionCallback) {
            let callCounter = 0;
            shellAgent
                .run('echo_first')
                .run('echo_second')
                .run('echo_third', {
                    exitCallback: function() {
                        callCounter++;
                        if (callCounter === 3) {
                            completionCallback();
                        }
                    }
                })
                .initiate({ onSuccess: () => {} });
        });

        checkScenario('should allow setting the working directory', function(completionCallback) {
            shellAgent.activeDirectory = '/';
            shellAgent
                .run('pwd_check_root', {
                    standardOutput: function(data) {
                        assertEquivalence(data.trim(), '/');
                        shellAgent.activeDirectory = '/usr/local';
                    }
                })
                .run('pwd_check_usr_local', {
                    standardOutput: function(data) {
                        assertEquivalence(data.trim(), '/usr/local');
                        completionCallback();
                    }
                })
                .initiate({ onSuccess: () => {} });
        });

        checkScenario('should handle sudo property when pseudo-terminal is set', function(completionCallback) {
            const contentInput = 'Echo Nine';
            let collectedOutput = '';
            shellAgent.run('sudo echo', {
                allocateTerminal: true, // Renamed pty
                argumentList: ['"' + contentInput + '"'],
                standardOutput: function(data) {
                    collectedOutput += data.trim();
                },
                exitCallback: function(code) {
                    assertEquivalence(collectedOutput, contentInput);
                    assertEquivalence(code, 0);
                    completionCallback();
                }
            }).initiate({ onSuccess: () => {} });
        });

        checkScenario('should discard subsequent commands when exit returns false', function(completionCallback) {
            shellAgent
                .run('exit 0_first', {
                    exitCallback: function() {
                        completionCallback();
                        return false; // This should clear the queue
                    }
                })
                .run('exit 1_second', {
                    exitCallback: function() {
                        assertFailure('Expected second command to be ignored');
                    }
                })
                .initiate({ onSuccess: () => {} });
        });

        checkScenario('should initiate a new command queue when exit returns false', function(completionCallback) {
            shellAgent
                .run('exit 0_initial', {
                    exitCallback: function() {
                        shellAgent.run('exit 0_new_queue', { // This command should be added to a new queue
                            exitCallback: function() {
                                completionCallback();
                            }
                        });
                        return false; // This clears the current queue
                    }
                })
                .run('exit 1_old_queue', {
                    exitCallback: function() {
                        assertFailure('Command from old queue should have been removed');
                    }
                })
                .initiate({ onSuccess: () => {} });
        });

        checkScenario('should append to queue if exit does not return false', function(completionCallback) {
            let triggerCount = 0;
            shellAgent
                .run('exit 0_step1', {
                    exitCallback: function() {
                        assertEquivalence(triggerCount, 0);
                        triggerCount++;
                    }
                })
                .run('exit 0_step2', {
                    exitCallback: function() {
                        assertEquivalence(triggerCount, 1);
                        triggerCount++;
                        shellAgent.run('exit 0_step4', { // This should be added to the end of the current queue
                            exitCallback: function() {
                                assertEquivalence(triggerCount, 3);
                                completionCallback();
                            }
                        });
                    }
                })
                .run('exit 0_step3', {
                    exitCallback: function() {
                        assertEquivalence(triggerCount, 2);
                        triggerCount++;
                    }
                })
                .initiate({ onSuccess: () => {} });
        });
    });

    defineTestGroup('Agent Reset', function() {
        checkScenario('should construct a fresh connection object', function() {
            const priorConnectionInstance = shellAgent.internalConnectionObject;
            shellAgent.resetAgent();
            assertDifference(priorConnectionInstance, shellAgent.internalConnectionObject);
        });

        checkScenario('should empty the command instruction queue', function() {
            shellAgent
                .run('cmd_a')
                .run('cmd_b')
                .run('cmd_c');
            assertCollectionSize(shellAgent.commandQueue, 3);

            shellAgent.resetAgent();
            assertCollectionSize(shellAgent.commandQueue, 0);
        });

        checkScenario('should terminate current connection before replacement', function(completionCallback) {
            shellAgent
                .run('exit 0_terminate_early', {
                    exitCallback: function() {
                        shellAgent.resetAgent();
                        completionCallback();
                    }
                })
                .run('exit 0_should_not_run', {
                    exitCallback: function() {
                        assertFailure('Connection should have been ended and commands cleared');
                    }
                })
                .initiate({ onSuccess: () => {} });
        });
    });
});

// --- Execute all defined tests ---
customTestFramework.commenceExecution();