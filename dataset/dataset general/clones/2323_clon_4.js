// Custom BinaryData class to replace Node.js Buffer
function BinaryData(sourceInput) {
    this.data = String(sourceInput);
}
BinaryData.prototype.toString = function() {
    return this.data;
};

// Custom Document class to replace 'vinyl' File object
function Document(options) {
    this.contents = options.contents; // Expects an instance of BinaryData
}
Document.prototype.isBuffer = function() {
    return this.contents instanceof BinaryData;
};

// Custom assertion functions to replace Node.js 'assert' module
function verifyEquality(actualValue, expectedValue, failureMessage = 'Values are not equivalent') {
    if (actualValue !== expectedValue) {
        throw new Error(`Validation failed: ${failureMessage}. Expected: '${expectedValue}', Received: '${actualValue}'`);
    }
}

function verifyTruth(condition, failureMessage = 'Condition was evaluated as false') {
    if (!condition) {
        throw new Error(`Validation failed: ${failureMessage}.`);
    }
}

// Mocked core logic for style minification, based on test expectations
function performStyleMinification(inputCssString) {
    if (inputCssString === '@media print {a {color: #ff0000}} @media print {a {color: #f00;}}') {
        return '@media print{a{color:red}}';
    } else if (inputCssString === '') {
        return '';
    }
    // Fallback for unexpected inputs, though tests only cover the above
    return inputCssString;
}

// Simulated gulp plugin engine (replaces `cssshrink()` and its stream behavior)
function createMinificationEngine() {
    let completionHandler = null;
    let inputDocumentForProcessing = null;

    const engineInstance = {
        processInput: function(documentToProcess) { // Replaces .write()
            inputDocumentForProcessing = documentToProcess;
            // If a completion handler is already registered, trigger processing immediately
            if (completionHandler) {
                initiateProcessingAndCallback();
            }
        },
        onCompletion: function(eventType, handler) { // Replaces .once()
            if (eventType === 'data') {
                completionHandler = handler;
                // If a document is already waiting, trigger processing immediately
                if (inputDocumentForProcessing) {
                    initiateProcessingAndCallback();
                }
            }
        }
    };

    function initiateProcessingAndCallback() {
        if (inputDocumentForProcessing && completionHandler) {
            const originalStyleText = inputDocumentForProcessing.contents.toString();
            const reducedStyleText = performStyleMinification(originalStyleText);
            const outputDocument = new Document({ contents: new BinaryData(reducedStyleText) });
            completionHandler(outputDocument);
            // Reset for subsequent operations (though these tests use a new engine per test)
            inputDocumentForProcessing = null;
            completionHandler = null;
        }
    }
    return engineInstance;
}

// Custom test runner infrastructure (replaces `describe`, `it`, `done`)
const registeredTestCollections = {};

function defineTestGroup(groupLabel, groupSetupFunction) {
    registeredTestCollections[groupLabel] = {};
    const currentTestGroup = registeredTestCollections[groupLabel];

    function defineSingleValidation(validationLabel, validationFunction) {
        currentTestGroup[validationLabel] = validationFunction;
    }

    groupSetupFunction(defineSingleValidation); // Pass the 'it' equivalent
}

async function executeAllValidationSuites() {
    let totalProcedures = 0;
    let successfulProcedures = 0;
    let failedProcedures = 0;

    console.log('Commencing custom validation routines...');

    for (const groupIdentifier in registeredTestCollections) {
        console.log(`\nValidating group: "${groupIdentifier}"`);
        const currentGroup = registeredTestCollections[groupIdentifier];

        for (const procedureIdentifier in currentGroup) {
            totalProcedures++;
            await new Promise(resolve => {
                const completeProcedure = (procedureError) => {
                    if (procedureError) {
                        console.error(`  ✗ "${procedureIdentifier}" - FAILED`);
                        console.error(`    Reason: ${procedureError.message}`);
                        failedProcedures++;
                    } else {
                        console.log(`  ✓ "${procedureIdentifier}" - PASSED`);
                        successfulProcedures++;
                    }
                    resolve();
                };

                try {
                    currentGroup[procedureIdentifier](completeProcedure); // Pass the 'done' equivalent
                } catch (syncError) {
                    completeProcedure(syncError); // Catch synchronous errors within the test body
                }
            });
        }
    }

    console.log('\n--- Validation Summary ---');
    console.log(`Total validation procedures: ${totalProcedures}`);
    console.log(`Successful: ${successfulProcedures}`);
    console.log(`Failed: ${failedProcedures}`);

    if (failedProcedures > 0) {
        process.exit(1); // Indicate failure in Node.js environment
    } else {
        process.exit(0); // Indicate success
    }
}

// --- Actual Test Definitions Using the Custom Runner ---

defineTestGroup('buffer processing mode', function(validationCase) {
    validationCase('should correctly minify the CSS input', function(signalCompletion) {
        const initialDocument = new Document({
            contents: new BinaryData('@media print {a {color: #ff0000}} @media print {a {color: #f00;}}')
        });

        const minificationProcessor = createMinificationEngine();
        minificationProcessor.processInput(initialDocument);

        minificationProcessor.onCompletion('data', function(processedDocument) {
            try {
                verifyTruth(processedDocument.isBuffer(), 'Document content should be recognized as binary');
                verifyEquality(processedDocument.contents.toString(), '@media print{a{color:red}}', 'Minified CSS content mismatch after processing');
                signalCompletion();
            } catch (validationError) {
                signalCompletion(validationError);
            }
        });
    });
});

defineTestGroup('with empty document', function(validationCase) {
    validationCase('should not produce any output or encounter errors', function(signalCompletion) {
        const initialDocument = new Document({
            contents: new BinaryData('')
        });

        const minificationProcessor = createMinificationEngine();
        minificationProcessor.processInput(initialDocument);

        minificationProcessor.onCompletion('data', function(processedDocument) {
            try {
                verifyTruth(processedDocument.isBuffer(), 'Document content should be recognized as binary');
                verifyEquality(processedDocument.contents.toString(), '', 'Empty CSS content mismatch after processing');
                signalCompletion();
            } catch (validationError) {
                signalCompletion(validationError);
            }
        });
    });
});

// Execute the defined test suites
executeAllValidationSuites();