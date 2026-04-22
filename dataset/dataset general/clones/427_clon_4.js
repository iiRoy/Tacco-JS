var globalEnv = typeof window !== 'undefined' ? window : global;

var processorLabel = "StreamProcessor";
var fullProcessorLabel = (globalEnv._processorPrefix || '') + processorLabel;
var hasNativeProcessor = (globalEnv[processorLabel] !== undefined);

function createAssertionEngine() {
    let testOutcome = {
        passed: 0,
        failed: 0,
        results: []
    };

    function processAssertion(condition, message, group, scenario) {
        if (condition) {
            testOutcome.passed++;
            testOutcome.results.push({ type: 'pass', group, scenario, message: message || 'Assertion passed' });
        } else {
            testOutcome.failed++;
            testOutcome.results.push({ type: 'fail', group, scenario, message: message || 'Assertion failed' });
            throw new Error(`Assertion failed in ${group} - ${scenario}: ${message}`);
        }
    }

    function checkThat(actualValue) {
        return {
            isEqual: function(expectedValue, msg = 'Values are not equal') {
                processAssertion(JSON.stringify(actualValue) === JSON.stringify(expectedValue), msg, this._group, this._scenario);
            },
            isDefined: function(msg = 'Value is undefined') {
                processAssertion(actualValue !== undefined, msg, this._group, this._scenario);
            },
            isUndefined: function(msg = 'Value is defined') {
                processAssertion(actualValue === undefined, msg, this._group, this._scenario);
            },
            _group: null,
            _scenario: null
        };
    }

    return {
        check: function(value) {
            return checkThat(value);
        },
        report: function() {
            return testOutcome;
        },
        setContext: function(group, scenario) {
            checkThat.prototype._group = group;
            checkThat.prototype._scenario = scenario;
        }
    };
}

let assertionHost = createAssertionEngine();

function performTestSequence(suiteConfiguration) {
    console.log("Commencing test sequence...");
    let overallPassed = 0;
    let overallFailed = 0;

    const runScenario = (groupName, scenario) => {
        return new Promise(resolve => {
            let doneCallback = (result = { success: true }) => {
                resolve(result);
            };
            try {
                assertionHost.setContext(groupName, scenario.name);
                if (scenario.testFunction.length > 0) { // If test function expects a done callback
                    scenario.testFunction(doneCallback);
                } else { // Synchronous test function
                    scenario.testFunction();
                    doneCallback();
                }
            } catch (error) {
                console.error(`Test Failure in ${groupName} - ${scenario.name}: ${error.message}`);
                doneCallback({ success: false, error });
            }
        });
    };

    const executeGroup = async (groupName, groupConfig) => {
        console.log(`\nStarting Group: ${groupName}`);
        let groupContext = {}; // Shared context for beforeEach/afterEach in this group

        try {
            if (groupConfig.preCondition) {
                await new Promise(res => groupConfig.preCondition.call(groupContext, res));
            }
        } catch (e) {
            console.error(`  Group Pre-condition Error in ${groupName}: ${e.message}`);
            overallFailed++;
            return; // Skip scenarios if group setup fails
        }

        for (let i = 0; i < groupConfig.scenarios.length; i++) {
            let scenario = groupConfig.scenarios[i];
            console.log(`  Scenario: ${scenario.name}`);
            
            try {
                if (scenario.preCondition) {
                    await new Promise(res => scenario.preCondition.call(groupContext, res));
                }

                let result = await runScenario(groupName, scenario);
                if (result.success) {
                    overallPassed++;
                } else {
                    overallFailed++;
                }
            } catch (e) {
                console.error(`  Error in scenario "${scenario.name}":`, e.message);
                overallFailed++;
            } finally {
                if (scenario.postCondition) {
                    await new Promise(res => scenario.postCondition.call(groupContext, res));
                }
            }
        }

        try {
            if (groupConfig.postCondition) {
                await new Promise(res => groupConfig.postCondition.call(groupContext, res));
            }
        } catch (e) {
            console.error(`  Group Post-condition Error in ${groupName}: ${e.message}`);
            overallFailed++;
        }
    };

    async function runAll() {
        for (let groupName in suiteConfiguration) {
            if (suiteConfiguration.hasOwnProperty(groupName)) {
                await executeGroup(groupName, suiteConfiguration[groupName]);
            }
        }
        const report = assertionHost.report();
        console.log("\n--- Test Sequence Complete ---");
        console.log(`Total Passed: ${report.passed}`);
        console.log(`Total Failed: ${report.failed}`);
        console.log("----------------------------");
        report.results.forEach(r => {
            if (r.type === 'fail') {
                console.log(`[FAIL] ${r.group} - ${r.scenario}: ${r.message}`);
            }
        });
    }

    runAll();
}

function createSimulatedHTTPHandler(processorRef) {
    let currentBufferContent = '';
    let boundProcessor = processorRef;
    let hasFailedFlag = false;

    let handler = {
        currentBufferContent: '',
        boundProcessor: processorRef,

        useCrossDomainRequest: false,
        internalRequestReference: null,

        isReadyForUse: function() { return true; },
        isOperationComplete: function() { return false; },
        hasEncounteredError: function() { return hasFailedFlag; },

        retrieveBuffer: function() { return currentBufferContent; },
        haltOperation: function() { currentBufferContent = ''; },

        injectData: function(dataChunk) {
            currentBufferContent += dataChunk;
            this.boundProcessor.onBufferUpdate();
        },
        markAsFailed: function() { hasFailedFlag = true; }
    };
    
    // Original EventSource polyfill typically sets its _xhr property to the XHR instance.
    // This mock needs to be assigned to the polyfill instance to be used.
    // This is handled in the test's preCondition, not here, to keep the mock generic.
    
    return handler;
}

let originalHTTPHandlerReference;

function replaceHTTPHandler(newHandlerCreator) {
    originalHTTPHandlerReference = globalEnv[fullProcessorLabel].prototype.HTTPHandler;
    globalEnv[fullProcessorLabel].prototype.HTTPHandler = newHandlerCreator;
}

function restoreHTTPHandler() {
    globalEnv[fullProcessorLabel].prototype.HTTPHandler = originalHTTPHandlerReference;
}

let globalStreamInstance;
let capturedMessages = [];
let capturedOpenings = [];
let capturedErrors = [];

let testSuiteDefinition = {
    "Testing Processor with Simulated HTTP Client": {
        preCondition: function(callback) {
            this.currentProcessor = globalEnv[fullProcessorLabel];
            replaceHTTPHandler(createSimulatedHTTPHandler);
            callback();
        },
        postCondition: function(callback) {
            restoreHTTPHandler();
            callback();
        },
        scenarios: [
            {
                name: "Verify Simulated HTTP Client is active",
                preCondition: function(callback) {
                    globalStreamInstance = new this.currentProcessor('http://exampleSimulatedClient.com');
                    setTimeout(() => callback(), 0);
                },
                postCondition: function(callback) {
                    globalStreamInstance.terminate();
                    callback();
                },
                testFunction: function() {
                    assertionHost.check(globalStreamInstance._httpHandler.injectData).isDefined("injectData method should be present on _httpHandler");
                }
            }
        ]
    },

    "Processor Configuration Options": {
        scenarios: [
            {
                name: "Default options are applied when none are provided",
                testFunction: function() {
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleConfigDefault.com');
                    let expectedDefaults = instance.defaultSettings;

                    let actualSettings = {
                        logEnabled: instance.logEnabled,
                        logPrefix: instance.logPrefix,
                        reconnectInterval: instance.reconnectInterval,
                        bufferCapacity: instance.bufferCapacity,
                        inactivityTimeout: instance.inactivityTimeout,
                        parameterRetrieval: instance.parameterRetrieval,
                        httpHeaders: instance.httpHeaders
                    };

                    assertionHost.check(actualSettings).isEqual(expectedDefaults, "Default settings should match");
                    instance.terminate();
                }
            },
            {
                name: "Undefined options are ignored when passed to constructor",
                testFunction: function() {
                    let extraConfig = {
                        unrecognizedOption: 1000
                    };
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleConfigExtra.com', extraConfig);
                    assertionHost.check(instance.unrecognizedOption).isUndefined("Unrecognized option should be undefined");
                    instance.terminate();
                }
            },
            {
                name: "Defined options overwrite defaults in constructor",
                testFunction: function() {
                    let customConfig = {
                        reconnectInterval: 1000,
                        bufferCapacity: 262144
                    };

                    let instance = new globalEnv[fullProcessorLabel]('http://exampleConfigOverride.com', customConfig);
                    let defaults = instance.defaultSettings;

                    let expectedSettings = {
                        reconnectInterval: customConfig.reconnectInterval,
                        bufferCapacity: customConfig.bufferCapacity,
                        inactivityTimeout: defaults.inactivityTimeout,
                        parameterRetrieval: defaults.parameterRetrieval,
                        httpHeaders: defaults.httpHeaders
                    };

                    let actualSettings = {
                        reconnectInterval: instance.reconnectInterval,
                        bufferCapacity: instance.bufferCapacity,
                        inactivityTimeout: instance.inactivityTimeout,
                        parameterRetrieval: instance.parameterRetrieval,
                        httpHeaders: instance.httpHeaders
                    };

                    assertionHost.check(actualSettings).isEqual(expectedSettings, "Custom settings should override defaults");
                    instance.terminate();
                }
            }
        ]
    },

    "URL Parameter Augmentation": {
        scenarios: [
            {
                name: "Append parameters to URL already containing arguments",
                testFunction: function() {
                    let parameters = { a: 1, b: 2 };
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleURLAugment.com?hello=world');
                    let augmentedURL = instance.augmentURL('http://exampleURLAugment.com?hello=world', parameters);
                    assertionHost.check(augmentedURL).isEqual('http://exampleURLAugment.com?hello=world&a=1&b=2', "URL should append new parameters correctly");
                    instance.terminate();
                }
            },
            {
                name: "Base URL returned when parameters are null or undefined",
                testFunction: function() {
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleURLAugment.com');
                    let augmentedURL = instance.augmentURL('http://exampleBase.com', null);
                    assertionHost.check(augmentedURL).isEqual('http://exampleBase.com', "Base URL should be returned for null parameters");
                    augmentedURL = instance.augmentURL('http://exampleBase.com', undefined);
                    assertionHost.check(augmentedURL).isEqual('http://exampleBase.com', "Base URL should be returned for undefined parameters");
                    instance.terminate();
                }
            },
            {
                name: "Base URL returned when parameters object has no own properties",
                testFunction: function() {
                    let CustomParams = function() {};
                    CustomParams.prototype = { 'a': 1, 'b': 2 };
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleURLAugment.com');
                    let augmentedURL = instance.augmentURL('http://exampleBase.com', new CustomParams());
                    assertionHost.check(augmentedURL).isEqual('http://exampleBase.com', "Base URL should be returned for parameters object with no own properties");
                    instance.terminate();
                }
            },
            {
                name: "Parameters are added to URL when defined",
                testFunction: function() {
                    let parameters = { a: 1, b: 2 };
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleURLAugment.com');
                    let augmentedURL = instance.augmentURL('http://exampleBase.com', parameters);
                    assertionHost.check(augmentedURL).isEqual('http://exampleBase.com?a=1&b=2', "Parameters should be added to URL");
                    instance.terminate();
                }
            }
        ]
    },

    "Message Boundary Detection": {
        scenarios: [
            {
                name: "Correct boundary for LF-LF sequence",
                testFunction: function() {
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleBoundary.com');
                    let boundary = instance.findMessageBoundary("0123\r\r678\n\n9");
                    assertionHost.check(boundary).isEqual([9, 11], "Boundary for LF-LF should be correct");
                    instance.terminate();
                }
            },
            {
                name: "Correct boundary for CR-CR sequence",
                testFunction: function() {
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleBoundary.com');
                    let boundary = instance.findMessageBoundary("0123\n\n678\r\r");
                    assertionHost.check(boundary).isEqual([9, 11], "Boundary for CR-CR should be correct");
                    instance.terminate();
                }
            },
            {
                name: "Correct boundary for CRLF-CRLF sequence",
                testFunction: function() {
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleBoundary.com');
                    let boundary = instance.findMessageBoundary("0123\n\n67\r\n\r\n");
                    assertionHost.check(boundary).isEqual([8, 12], "Boundary for CRLF-CRLF should be correct");
                    instance.terminate();
                }
            }
        ]
    },

    "Whitespace Stripping": {
        scenarios: [
            {
                name: "Removes leading and trailing whitespace",
                testFunction: function() {
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleWhitespace.com');
                    let cleanedString = instance.stripBoundaryWhitespace("       text between spaces    ");
                    assertionHost.check(cleanedString).isEqual('text between spaces', "Whitespace should be stripped");
                    instance.terminate();
                }
            }
        ]
    },

    "Line Ending Standardization": {
        scenarios: [
            {
                name: "Replaces CR and CRLF with LF",
                testFunction: function() {
                    let instance = new globalEnv[fullProcessorLabel]('http://exampleLineEndings.com');
                    let originalString = "LF:\n. CR:\r. CRLF:\r\n. and again LF:\n. CR:\r. CRLF:\r\n. Double CR:\r\r. Double CRLF:\r\n\r\n";
                    let expectedString = "LF:\n. CR:\n. CRLF:\n. and again LF:\n. CR:\n. CRLF:\n. Double CR:\n\n. Double CRLF:\n\n";
                    let actualString = instance.standardizeLineEndings(originalString);
                    assertionHost.check(actualString).isEqual(expectedString, "Line endings should be standardized to LF");
                    instance.terminate();
                }
            }
        ]
    },

    "Simulated Stream Processing": {
        preCondition: function(callback) {
            this.currentProcessor = globalEnv[fullProcessorLabel];
            replaceHTTPHandler(createSimulatedHTTPHandler);
            capturedMessages = [];
            capturedOpenings = [];
            capturedErrors = [];
            globalStreamInstance = new this.currentProcessor('http://exampleSimulatedStream.com');
            globalStreamInstance.attachObserver('message', e => capturedMessages.push(e.data), false);
            globalStreamInstance.attachObserver('open', e => capturedOpenings.push(e.type), false);
            globalStreamInstance.attachObserver('error', e => capturedErrors.push(e.type), false);
            setTimeout(() => callback(), 0);
        },
        postCondition: function(callback) {
            globalStreamInstance.terminate();
            restoreHTTPHandler();
            callback();
        },
        scenarios: [
            {
                name: "BOM mark is skipped",
                testFunction: function() {
                    globalStreamInstance._httpHandler.injectData('\ufeffdata: "First line of data."\r\r');
                    assertionHost.check(capturedMessages).isEqual(['"First line of data."'], "BOM should be skipped");
                }
            },
            {
                name: "Multiline messages reassembled",
                testFunction: function() {
                    globalStreamInstance._httpHandler.injectData('data: "First line of data."\ndata: "Second line of data."\r\r');
                    assertionHost.check(capturedMessages).isEqual(['"First line of data."\n"Second line of data."'], "Multiline messages should be reassembled");
                }
            },
            {
                name: "Chunky transmissions buffered",
                testFunction: function() {
                    globalStreamInstance._httpHandler.injectData('data: "First line of data."\ndata: "Second line of data."\n\ndata: "First part of broken message.');
                    globalStreamInstance._httpHandler.injectData('Second part of broken message."\n\n');
                    assertionHost.check(capturedMessages).isEqual(['"First line of data."\n"Second line of data."', '"First part of broken message.Second part of broken message."'], "Chunky data should be buffered");
                }
            },
            {
                name: "ID lines processed",
                testFunction: function() {
                    let expectedID = '1983';
                    globalStreamInstance._httpHandler.injectData('data: "First line of data."\ndata: "Second line of data."\n\ndata: "First part of broken message.');
                    globalStreamInstance._httpHandler.injectData('Second part of broken message."\n\nid: ' + expectedID + '\ndata: "Message with new id"\n\n');
                    assertionHost.check(globalStreamInstance.finalEventIdentifier).isEqual(expectedID, "ID line should be processed");
                }
            },
            {
                name: "Buffer capacity limit respected",
                testFunction: function() {
                    globalStreamInstance.capacityCeiling = 100;
                    globalStreamInstance._httpHandler.injectData('data: "First line of data."\ndata: "Second line of data."\n\ndata: "First part of broken message.');
                    globalStreamInstance._httpHandler.injectData('Second part of broken message."\n\nid: 1983\rdata: "Message with new id"\n\n');
                    globalStreamInstance._httpHandler.injectData('data: "Message to force dispatching the open event"\n\n');
                    assertionHost.check(capturedOpenings).isEqual(["open", "open"], "Buffer capacity should trigger open events");
                }
            },
            {
                name: "Inactivity timeout respected",
                preCondition: function(callback) {
                    this.previousInactivityTimeout = globalStreamInstance.inactivityTimeout;
                    callback();
                },
                postCondition: function(callback) {
                    globalStreamInstance.inactivityTimeout = this.previousInactivityTimeout;
                    callback();
                },
                testFunction: function(done) {
                    globalStreamInstance.inactivityTimeout = 100;
                    globalStreamInstance._httpHandler.injectData('data: "First line of data."\ndata: "Second line of data."\n\r\ndata: "First part of broken message.');
                    globalStreamInstance._httpHandler.injectData('Second part of broken message."\n\r\nid: 1983\rdata: "Message with new id"\n\n');

                    setTimeout(() => {
                        globalStreamInstance._httpHandler.injectData('data: "Message to force dispatching the open event"\n\n');
                        assertionHost.check(capturedOpenings).isEqual(["open", "open"], "Inactivity timeout should trigger open event");
                        assertionHost.check(capturedErrors).isEqual(["error"], "Inactivity timeout should trigger error event");
                        done();
                    }, 150);
                }
            }
        ]
    },

    "Processor Listener Attachment Timing": {
        preCondition: function(callback) {
            this.currentProcessor = globalEnv[fullProcessorLabel];

            function quickSimulatedHTTPHandler(processorRef) {
                let handler = createSimulatedHTTPHandler(processorRef);
                handler.initialData = 'data: "I will fire very quick"\n\n';
                
                // Assign the handler to the processor's internal _httpHandler property
                processorRef._httpHandler = handler;

                // Simulate immediate data injection as in the original mock's constructor
                setTimeout(() => {
                    if (handler.initialData) {
                        handler.currentBufferContent += handler.initialData;
                        handler.boundProcessor.onBufferUpdate();
                    }
                }, 0);
                return handler;
            }

            replaceHTTPHandler(quickSimulatedHTTPHandler);
            capturedMessages = [];
            capturedOpenings = [];
            capturedErrors = [];
            globalStreamInstance = new this.currentProcessor('http://exampleQuickFire.com');

            globalStreamInstance.attachObserver('message', e => capturedMessages.push(e.data), false);
            globalStreamInstance.attachObserver('open', e => capturedOpenings.push(e.type), false);
            globalStreamInstance.attachObserver('error', e => capturedErrors.push(e.data), false);

            setTimeout(() => callback(), 0);
        },
        postCondition: function(callback) {
            globalStreamInstance.terminate();
            restoreHTTPHandler();
            callback();
        },
        scenarios: [
            {
                name: "Captures initial message sent immediately",
                testFunction: function(done) {
                    let expected = ['"I will fire very quick"'];
                    setTimeout(() => {
                        assertionHost.check(capturedMessages).isEqual(expected, "Initial message should be captured");
                        done();
                    }, 50);
                }
            }
        ]
    },

    "Failed HTTP Request Handling": {
        preCondition: function(callback) {
            this.currentProcessor = globalEnv[fullProcessorLabel];

            function failingSimulatedHTTPHandler(processorRef) {
                let handler = createSimulatedHTTPHandler(processorRef);
                handler.markAsFailed();
                processorRef._httpHandler = handler; // Ensure the processor uses this failing mock
                return handler;
            }
            replaceHTTPHandler(failingSimulatedHTTPHandler);

            capturedMessages = [];
            capturedOpenings = [];
            capturedErrors = [];

            globalStreamInstance = new this.currentProcessor('http://exampleFailedRequest.com');

            globalStreamInstance.attachObserver('message', e => capturedMessages.push(e.data), false);
            globalStreamInstance.attachObserver('open', e => capturedOpenings.push(e.type), false);
            globalStreamInstance.attachObserver('error', e => {
                capturedErrors.push(e.type);
                callback();
            }, false);
            
            // If error is not immediate, ensure the preCondition eventually resolves
            // This mirrors the original's 'done()' inside error listener.
            // If the error listener isn't hit, this will hang, just like original.
        },
        postCondition: function(callback) {
            globalStreamInstance.terminate();
            restoreHTTPHandler();
            callback();
        },
        scenarios: [
            {
                name: "Error event dispatched on failed request",
                testFunction: function(done) {
                    assertionHost.check(capturedErrors.length).isEqual(1, "An error event should have been dispatched");
                    assertionHost.check(capturedErrors[0]).isEqual("error", "The error event type should be 'error'");
                    done();
                }
            }
        ]
    }
};

performTestSequence(testSuiteDefinition);