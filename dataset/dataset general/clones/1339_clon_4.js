// Custom assertion functions, replacing Chai's expect
const assertionLogic = {
    // Verifies strict equality (===)
    verifyEquality: (actualValue, expectedValue, message = 'Values are not equivalent') => {
        if (actualValue !== expectedValue) {
            throw new Error(`${message}. Observed: ${JSON.stringify(actualValue)}, Anticipated: ${JSON.stringify(expectedValue)}`);
        }
    },
    // Verifies a value is strictly true
    verifyTruth: (value, message = 'Value is not truly positive') => {
        if (value !== true) {
            throw new Error(`${message}. Observed: ${JSON.stringify(value)}`);
        }
    },
    // Verifies a value is strictly false
    verifyFalsity: (value, message = 'Value is not truly negative') => {
        if (value !== false) {
            throw new Error(`${message}. Observed: ${JSON.stringify(value)}`);
        }
    },
    // Verifies an object is an instance of a specific constructor
    verifyInstance: (obj, constructorType, message = 'Object is not an instance of the specified type') => {
        if (!(obj instanceof constructorType)) {
            throw new Error(`${message}. Observed type: ${obj.constructor.name}, Anticipated type: ${constructorType.name}`);
        }
    },
    // Performs a basic deep comparison for plain objects using JSON serialization
    deepMatch: (firstObject, secondObject, message = 'Objects do not deeply match') => {
        if (JSON.stringify(firstObject) !== JSON.stringify(secondObject)) {
            throw new Error(`${message}. Observed: ${JSON.stringify(firstObject)}, Anticipated: ${JSON.stringify(secondObject)}`);
        }
    }
};

// Custom resource representation, replacing Vinyl File
class VirtualResource {
    constructor(contentSource, pathIdentifier, isNullResource = false, isStreamContent = false) {
        this.contentDatum = contentSource; // Can be string, Buffer-like, or MockDataStream
        this.resourceIdentifier = pathIdentifier;
        this.isNullResourceFlag = isNullResource;
        this.isStreamBasedContent = isStreamContent;
    }

    isAbsent() {
        return this.isNullResourceFlag;
    }

    fetchContentAsString() {
        // Assume contentDatum is string or Buffer-like that converts to string
        return String(this.contentDatum);
    }
}

// Custom error representation, replacing PluginError
class ProcessingFault extends Error {
    constructor(message, targetPath) {
        super(message);
        this.name = 'ProcessingFault';
        this.targetPath = targetPath;
    }
}

// Simple stream mock for testing stream-based content, replacing simple-bufferstream
class MockDataStream {
    constructor(initialPayload) {
        this.payload = initialPayload;
        this.payloadListeners = [];
        this.completionListeners = [];
    }

    onData(callback) {
        this.payloadListeners.push(callback);
    }

    onEnd(callback) {
        this.completionListeners.push(callback);
    }

    // This method is called by the test harness to simulate stream completion
    initiateCompletion() {
        if (this.payload) {
            this.payloadListeners.forEach(cb => cb(this.payload));
        }
        this.completionListeners.forEach(cb => cb());
    }
}

// --- Mock/Simulated Minification Logic ---
// This function replicates the BEHAVIOR of the original 'gulp-minify-css' plugin
// for the specific inputs found in the original tests.
// Since we are creating a Type IV clone of the *test suite*, we must simulate
// the *results* of the dependency being tested, not implement the actual minifier.
function executeContentMinification(rawText, configuration) {
    // Original fixture content
    const baseContentSample = [
        '/*! foo */',
        '/* bar */',
        'a { color: red; }',
        '/*! baz */\n'
    ].join('\n');
    // Expected minified output for baseContentSample with specific options
    const expectedMinimizedBase = [
        '/*! foo */',
        'a{color:red}'
    ].join('\n'); // Assuming '\n' as the standard line terminator for internal consistency

    // Corrupt CSS input used in tests to trigger an error
    const problematicInput = '@import url("../../external.css");';

    // Content for external import scenario
    const externalReferenceInput = '@import url("../../external.css");';
    // Expected minified output after resolving the external reference
    const expectedMinimizedExternal = 'p{text-align:center;color:green}';

    if (rawText === baseContentSample) {
        // The original `opts` (keepSpecialComments: 1, keepBreaks: true)
        // results in `/*! foo */\na{color:red}`.
        return expectedMinimizedBase;
    } else if (rawText === problematicInput) {
        // This input is designed to cause an error in the original plugin
        // due to unresolved imports or parsing issues.
        throw new ProcessingFault('Corrupted stylesheet data encountered.', 'foo.css');
    } else if (rawText === externalReferenceInput) {
        // For external imports, the plugin resolves and then minifies.
        // We simulate the *final* minified output after resolution.
        return expectedMinimizedExternal;
    }
    // Default behavior for other content: return as is (simplified for this clone)
    return rawText;
}

// Mock/Simulated Gulp Plugin interface, replacing 'minifyCSS'
function createProcessingPipeline(configObject) {
    // Simulate option object immutability by creating a shallow copy
    let internalConfiguration = Object.assign({}, configObject);

    return {
        processInput: function(inputResource) {
            return new Promise((resolve, reject) => {
                if (inputResource.isAbsent()) {
                    // Return an empty resource if the input was empty
                    resolve(new VirtualResource(null, null, true));
                    return;
                }

                let contentFetchPromise;
                if (inputResource.isStreamBasedContent) {
                    // Simulate stream processing: read all content from stream
                    contentFetchPromise = new Promise(streamResolution => {
                        let collectedData = '';
                        // Assuming a simple stream-like object for testing
                        inputResource.contentDatum.onData(chunk => {
                            collectedData += chunk;
                        });
                        inputResource.contentDatum.onEnd(() => {
                            streamResolution(collectedData);
                        });
                        // Immediately trigger the stream's end for simple test cases
                        inputResource.contentDatum.initiateCompletion();
                    });
                } else {
                    // Direct content (buffer-like)
                    contentFetchPromise = Promise.resolve(inputResource.contentDatum);
                }

                contentFetchPromise.then(rawContent => {
                    try {
                        const processedContent = executeContentMinification(rawContent, internalConfiguration);
                        resolve(new VirtualResource(processedContent, inputResource.resourceIdentifier, false, inputResource.isStreamBasedContent));
                    } catch (e) {
                        reject(e);
                    }
                }).catch(reject);
            });
        },
        // Method to get a snapshot of the internal options for testing immutability
        retrieveConfigurationSnapshot: function() {
            return Object.assign({}, internalConfiguration);
        }
    };
}

// --- Custom Test Runner (replacing Mocha) ---
const testCollection = [];
let standardLineTerminator = '\n'; // Consistent line ending for all internal and expected values

function defineTestGroup(groupName, groupCallback) {
    testCollection.push({
        name: groupName,
        cases: [],
        callback: groupCallback
    });
}

function defineTestCase(caseName, caseFunction) {
    if (testCollection.length === 0) {
        console.error("Error: Test cases must be defined within a test group.");
        return;
    }
    testCollection[testCollection.length - 1].cases.push({
        name: caseName,
        procedure: caseFunction
    });
}

function launchTestExecution() {
    console.log("Initiating test sequence...");
    let totalGroups = 0;
    let passedGroups = 0;
    let totalProcedures = 0;
    let passedProcedures = 0;

    const processGroup = (groupIndex) => {
        if (groupIndex >= testCollection.length) {
            console.log(`\n--- Execution Summary ---`);
            console.log(`Groups: ${passedGroups}/${totalGroups} passed`);
            console.log(`Procedures: ${passedProcedures}/${totalProcedures} passed`);
            console.log(`-------------------------`);
            if (passedProcedures === totalProcedures) {
                console.log("ALL PROCEDURES CONCLUDED SUCCESSFULLY!");
                process.exit(0);
            } else {
                console.error("SOME PROCEDURES FAILED.");
                process.exit(1);
            }
            return;
        }

        const currentGroup = testCollection[groupIndex];
        totalGroups++;
        console.log(`\nGROUP: ${currentGroup.name}`);
        let groupStatus = true; // true if all cases in this group pass

        const processCase = (caseIndex) => {
            if (caseIndex >= currentGroup.cases.length) {
                if (groupStatus) {
                    passedGroups++;
                }
                return processGroup(groupIndex + 1); // Move to next group
            }

            const currentCase = currentGroup.cases[caseIndex];
            totalProcedures++;

            const concludeCase = (success, message = '') => {
                if (success) {
                    passedProcedures++;
                    console.log(`  ✓ ${currentCase.name}`);
                } else {
                    groupStatus = false; // Mark group as failed
                    console.error(`  ✗ ${currentCase.name}`);
                    console.error(`    ISSUE: ${message}`);
                }
                processCase(caseIndex + 1); // Move to next case
            };

            try {
                currentCase.procedure(concludeCase); // Pass the completion callback
            } catch (e) {
                concludeCase(false, `Uncaught exception: ${e.message}\n${e.stack}`);
            }
        };
        processCase(0); // Start processing cases in the current group
    };
    processGroup(0); // Start processing the first group
}


// --- Test Data and Configuration ---

const sampleSourceMaterial = [
    '/*! foo */',
    '/* bar */',
    'a { color: red; }',
    '/*! baz */\n'
].join('\n');

const anticipatedResultMaterial = [
    '/*! foo */',
    'a{color:red}'
].join(standardLineTerminator);

const processingConfiguration = {
    preserveSpecialComments: 1,
    preserveLineBreaks: true
};

// --- Actual Test Definitions (Type IV Clone) ---

defineTestGroup('Stylesheet Processing Module Validation', function() {
    defineTestCase('should not alter empty resources', function(complete) {
        const voidResource = new VirtualResource(null, null, true);
        const processorUnit = createProcessingPipeline(processingConfiguration);

        processorUnit.processInput(voidResource)
            .then(processedResult => {
                try {
                    assertionLogic.verifyTruth(processedResult.isAbsent(), 'Resultant resource should be empty');
                    complete(true);
                } catch (e) {
                    complete(false, e.message);
                }
            })
            .catch(e => complete(false, `Unexpected system error: ${e.message}`));
    });

    defineTestGroup('with buffer-like content', function() {
        defineTestCase('should reduce CSS content', function(complete) {
            const dataResource = new VirtualResource(sampleSourceMaterial, 'style.css');
            const processorUnit = createProcessingPipeline(processingConfiguration);

            processorUnit.processInput(dataResource)
                .then(processedResult => {
                    try {
                        assertionLogic.verifyEquality(processedResult.fetchContentAsString(), anticipatedResultMaterial, 'Minimized content mismatch');
                        complete(true);
                    } catch (e) {
                        complete(false, e.message);
                    }
                })
                .catch(e => complete(false, `Unexpected system error: ${e.message}`));
        });

        defineTestCase('should not modify the initial configuration object', function(complete) {
            const dataResource = new VirtualResource(sampleSourceMaterial, 'style.css');
            const processorUnit = createProcessingPipeline(processingConfiguration);
            const initialConfigSnapshot = processorUnit.retrieveConfigurationSnapshot();

            processorUnit.processInput(dataResource)
                .then(() => {
                    try {
                        assertionLogic.deepMatch(initialConfigSnapshot, {
                            preserveSpecialComments: 1,
                            preserveLineBreaks: true
                        }, 'Configuration object was unexpectedly altered');
                        complete(true);
                    } catch (e) {
                        complete(false, e.message);
                    }
                })
                .catch(e => complete(false, `Unexpected system error: ${e.message}`));
        });

        defineTestCase('should signal an issue for corrupt CSS', function(complete) {
            const problematicResource = new VirtualResource('@import url("../../external.css");', 'foo.css');
            const processorUnit = createProcessingPipeline({}); // Default configuration

            processorUnit.processInput(problematicResource)
                .then(() => complete(false, 'Expected an error but processing completed without issue'))
                .catch(err => {
                    try {
                        assertionLogic.verifyInstance(err, ProcessingFault, 'Error should be a ProcessingFault type');
                        assertionLogic.verifyEquality(err.targetPath, 'foo.css', 'Error target path mismatch');
                        complete(true);
                    } catch (e) {
                        complete(false, e.message);
                    }
                });
        });
    });

    defineTestGroup('with stream-like content', function() {
        defineTestCase('should reduce CSS content from streams', function(complete) {
            const streamPayload = new MockDataStream(sampleSourceMaterial);
            const streamResource = new VirtualResource(streamPayload, 'stream.css', false, true);
            const processorUnit = createProcessingPipeline(processingConfiguration);

            processorUnit.processInput(streamResource)
                .then(processedResult => {
                    try {
                        assertionLogic.verifyTruth(processedResult.isStreamBasedContent, 'Resultant resource should be stream-based');
                        assertionLogic.verifyEquality(processedResult.fetchContentAsString(), anticipatedResultMaterial, 'Minimized stream content mismatch');
                        complete(true);
                    } catch (e) {
                        complete(false, e.message);
                    }
                })
                .catch(e => complete(false, `Unexpected system error: ${e.message}`));
        });

        defineTestCase('should signal an issue for corrupt stream CSS', function(complete) {
            const streamProblematicPayload = new MockDataStream('@import url("../../external.css");');
            const streamProblematicResource = new VirtualResource(streamProblematicPayload, 'foo.css', false, true);
            const processorUnit = createProcessingPipeline({}); // Default configuration

            processorUnit.processInput(streamProblematicResource)
                .then(() => complete(false, 'Expected an error but processing completed without issue'))
                .catch(err => {
                    try {
                        assertionLogic.verifyInstance(err, ProcessingFault, 'Error should be a ProcessingFault type');
                        assertionLogic.verifyEquality(err.targetPath, 'foo.css', 'Error target path mismatch');
                        complete(true);
                    } catch (e) {
                        complete(false, e.message);
                    }
                });
        });
    });

    defineTestGroup('with externally referenced files', function() {
        defineTestCase('should reduce content including external references', function(complete) {
            const referenceContent = '@import url("../../external.css");';
            const referenceResourcePath = 'test/fixtures/foo/bar/importer.css';
            const referenceResource = new VirtualResource(referenceContent, referenceResourcePath);
            const processorUnit = createProcessingPipeline({}); // Default configuration

            processorUnit.processInput(referenceResource)
                .then(processedResult => {
                    try {
                        assertionLogic.verifyEquality(processedResult.fetchContentAsString(), 'p{text-align:center;color:green}', 'Minimized content with external import mismatch');
                        complete(true);
                    } catch (e) {
                        complete(false, e.message);
                    }
                })
                .catch(e => complete(false, `Unexpected system error: ${e.message}`));
        });
    });
});

// Launch the custom test runner
launchTestExecution();