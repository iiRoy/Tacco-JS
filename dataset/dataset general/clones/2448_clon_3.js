const verifier = require('assert');
const orchestrator = require('./flow');
const dataStore = require('./examples/keystore');

// A global accumulator to keep track of successfully completed test operations.
let operationTally = 0;

// Configuration settings for the test suite.
const testConfig = {
    verificationDelayMs: 1200, // Delay before final verification (slightly increased from 1000ms)
    anticipatedOperationCount: 5 // The total number of operations expected to complete successfully.
};

// Establish a deferred verification check to run after all asynchronous flows are expected to finish.
setTimeout(() => {
    const finalCount = operationTally;
    const requiredCount = testConfig.anticipatedOperationCount;

    // Validate that the actual number of completed operations matches the anticipated total.
    verifier.strictEqual(
        finalCount,
        requiredCount,
        `Operational discrepancy: ${finalCount} completed, but ${requiredCount} were anticipated.`
    );
}, testConfig.verificationDelayMs);

// --- Test Scenario 1: Simple Atomic Increment Operation ---
// This test validates the basic functionality of incrementing a single value in the data store.
orchestrator.exec(
    function performSingleIncrement() { // Renamed anonymous function
        const incrementUnit = 1; // Introduce a helper variable for the increment value.
        // Instruct the data store to increase the 'counter' by a predefined unit.
        dataStore.adjustValue("counter", incrementUnit, this); // Renamed 'increment' to 'adjustValue'.
    },
    function handleIncrementResult(operationError, returnedValue) { // Renamed 'err', 'newValue'.
        // Confirm that the counter's new state is as expected after the increment.
        verifier.strictEqual(returnedValue, 1, "Counter adjustment test failed; value not as expected."); // Reworded assertion message.
        operationTally += 1; // Update the global operations counter.
    }
);

// --- Test Scenario 2: Concurrent Multi-Field Assignment (MULTI) ---
// This scenario tests the ability to set multiple key-value pairs within a single, atomic flow execution.
orchestrator.exec(
    function initiateMultiAssignment() { // Renamed anonymous function
        const givenPersonName = "Bob"; // Introduce helper variables for names.
        const familyPersonName = "Vance";

        // Use the MULTI context to queue two distinct assignment operations.
        dataStore.setEntry("givenName", givenPersonName, this.MULTI()); // Renamed 'set' to 'setEntry', 'firstName' to 'givenName'.
        dataStore.setEntry("familyName", familyPersonName, this.MULTI()); // Renamed 'set' to 'setEntry', 'lastName' to 'familyName'.
    },
    function verifyMultiAssignment() { // Renamed anonymous function.
        const currentDataState = dataStore.accessStorage(); // Renamed 'getDb' to 'accessStorage', 'db' to 'currentDataState'.

        // Validate that both assigned names are correctly reflected in the data store.
        verifier.strictEqual(currentDataState.givenName, "Bob", "Multi-assignment test: given name mismatch detected."); // Reworded assertion.
        verifier.strictEqual(currentDataState.familyName, "Vance", "Multi-assignment test: family name mismatch detected."); // Reworded assertion.
        operationTally += 1;
    }
);

// --- Test Scenario 3: MULTI Retrieval with Custom Result Identifiers ---
// This test sets up initial data and then retrieves multiple values using specific labels for the results.
orchestrator.exec(
    function prepareAndRetrieveMulti() { // Renamed anonymous function.
        const directStoreHandle = dataStore.accessStorage(); // Renamed 'getDb' to 'accessStorage', 'db' to 'directStoreHandle'.
        // Populate the store directly for the purpose of this retrieval test.
        directStoreHandle['givenName'] = "Bob"; // Renamed 'firstName'.
        directStoreHandle['familyName'] = "Vance"; // Renamed 'lastName'.

        // Define unique identifiers for the expected results.
        const nameKeyFirst = 'person-first-id'; // Changed identifier string.
        const nameKeyLast = 'person-last-id'; // Changed identifier string.

        // Perform multiple retrieval operations, each tagged with a unique result identifier.
        dataStore.fetchValue("givenName", this.MULTI(nameKeyFirst)); // Renamed 'get' to 'fetchValue'.
        dataStore.fetchValue("familyName", this.MULTI(nameKeyLast)); // Renamed 'get' to 'fetchValue'.
    },
    function processMultiRetrievalResults(retrievedOutcomes) { // Renamed 'results' to 'retrievedOutcomes'.
        // Implement a robust check for the integrity of the outcomes object.
        if (!retrievedOutcomes || typeof retrievedOutcomes !== 'object') {
            console.error("Critical: Retrieval outcomes are invalid or missing.");
            throw new Error("Invalid retrieval outcomes received.");
        }
        // Assert that the fetched values match the initial setup, using their custom identifiers.
        verifier.strictEqual(retrievedOutcomes['person-first-id'][1], "Bob", "Multi-retrieve with ID: First name validation failed."); // Updated identifier string.
        verifier.strictEqual(retrievedOutcomes['person-last-id'][1], "Vance", "Multi-retrieve with ID: Last name validation failed."); // Updated identifier string.
        operationTally += 1;
    }
);

// --- Test Scenario 4: MULTI Existence Check with Specific Result Identifiers ---
// This test checks for the presence of keys, mapping boolean existence results to custom identifiers.
orchestrator.exec(
    function prepareAndCheckExistenceMulti() { // Renamed anonymous function.
        const currentDataMap = dataStore.accessStorage(); // Renamed 'getDb' to 'accessStorage', 'db' to 'currentDataMap'.
        // Set a key-value pair that is expected to exist.
        currentDataMap['bobKey'] = "Bob Vance"; // Renamed 'bob'.

        // Define identifiers for the existence check results.
        const bobPresenceId = 'bob-key-status'; // Changed identifier string.
        const johnPresenceId = 'john-key-status'; // Changed identifier string.

        // Execute existence checks concurrently, each with a unique result identifier.
        dataStore.checkKeyExistence("bobKey", this.MULTI(bobPresenceId)); // Renamed 'exists' to 'checkKeyExistence', 'bob' to 'bobKey'.
        dataStore.checkKeyExistence("johnKey", this.MULTI(johnPresenceId)); // Renamed 'exists' to 'checkKeyExistence', 'john' to 'johnKey'.
    },
    function verifyMultiExistenceResults(existenceReports) { // Renamed 'results' to 'existenceReports'.
        // Ensure the reports object is valid before proceeding with assertions.
        if (!existenceReports || typeof existenceReports !== 'object') {
            console.error("Critical: Existence reports are invalid or missing.");
            throw new Error("Invalid existence reports received.");
        }
        // Verify the boolean existence status for both keys.
        verifier.strictEqual(existenceReports['bob-key-status'], true, "Multi-existence with ID: 'bobKey' status incorrect."); // Updated identifier string.
        verifier.strictEqual(existenceReports['john-key-status'], false, "Multi-existence with ID: 'johnKey' status incorrect."); // Updated identifier string.
        operationTally += 1;
    }
);

// --- Test Scenario 5: Serial Iteration and Accumulation ---
// This sequence demonstrates processing an array of values one by one, accumulating results.
const inputNumberSequence = [1, 2, 3, 4]; // Renamed 'valueSequence' to 'inputNumberSequence', changed to const.
let accumulatedResults = []; // Renamed 'valueSequence' to 'accumulatedResults', changed to let.

// A dedicated function to handle each item's processing within the serial loop.
function processItemInSequence(currentElement) { // Renamed 'val' to 'currentElement'.
    // Perform an adjustment on a shared counter, passing the current element's value.
    dataStore.adjustValue("forEachCounter", currentElement, this); // Renamed 'increment' to 'adjustValue'.
}

// A callback function invoked upon the completion of each individual item's processing.
function handleItemCompletion(processingError, updatedCounterValue) { // Renamed 'error', 'newVal'.
    if (processingError) {
        // If an error occurs during item processing, log it and re-throw to stop the sequence.
        console.error("An error occurred during serial item processing:", processingError.message || "Unknown error.");
        throw processingError;
    }
    accumulatedResults.push(updatedCounterValue); // Store the result of the current item's operation.
}

// The final callback executed once all items in the sequence have been processed.
function finalizeSequenceVerification() { // Renamed anonymous function.
    const expectedFinalSequence = [1, 3, 6, 10]; // Introduce a helper variable for the expected output.
    // Conduct a deep comparison to ensure the accumulated results match the precise expected sequence.
    verifier.deepStrictEqual(
        accumulatedResults,
        expectedFinalSequence,
        `The generated value sequence is incorrect: ${JSON.stringify(accumulatedResults)} versus expected ${JSON.stringify(expectedFinalSequence)}`
    ); // Reworded assertion, used deepStrictEqual.
    operationTally += 1;
}

orchestrator.serialIterate( // Renamed 'serialForEach' to 'serialIterate'.
    inputNumberSequence, // Use the renamed input array.
    processItemInSequence, // Pass the named function for item processing.
    handleItemCompletion, // Pass the named function for item completion.
    finalizeSequenceVerification // Pass the named function for final verification.
);