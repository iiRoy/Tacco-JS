/*
 * RJSON-like data compaction library unit validation suite.
 * This file contains various test cases to ensure the robust functionality
 * of the data condensation and decompression processes.
 */

// Simulated environment check for module loading.
// In a browser context, 'globalThis.module' might not exist.
if (typeof globalThis !== 'undefined' && globalThis.module && globalThis.module.exports) {
    // Attempt to load the compaction module from a relative path.
    globalThis.CompactorLib = require('../rjson.js');
} else if (typeof window !== 'undefined') {
    // Assume CompactorLib is globally available in a browser scenario.
    // This is a placeholder; in a real setup, it would be loaded via script tag.
    if (typeof CompactorLib === 'undefined') {
        console.warn("CompactorLib not found in global scope. Tests may fail.");
    }
}


/**
 * A utility function to assert equality for test purposes.
 * This mimics a testing framework's `equal` function.
 * @param {any} actualValue - The value produced by the code.
 * @param {any} expectedValue - The value expected.
 * @param {string} assertionContext - A descriptive message for the assertion.
 */
function assertScalarEquality(actualValue, expectedValue, assertionContext) {
    if (actualValue === expectedValue) {
        console.log(`PASS: ${assertionContext}`);
    } else {
        console.error(`FAIL: ${assertionContext} - Expected: ${expectedValue}, Got: ${actualValue}`);
        throw new Error(`Assertion failed: ${assertionContext}`);
    }
}

/**
 * A utility function to assert deep equality for test purposes.
 * This mimics a testing framework's `deepEqual` function.
 * @param {any} actualObject - The object produced by the code.
 * @param {any} expectedObject - The object expected.
 * @param {string} assertionContext - A descriptive message for the assertion.
 */
function assertStructuralEquality(actualObject, expectedObject, assertionContext) {
    const stringifiedActual = JSON.stringify(actualObject);
    const stringifiedExpected = JSON.stringify(expectedObject);

    if (stringifiedActual === stringifiedExpected) {
        console.log(`PASS: ${assertionContext}`);
    } else {
        console.error(`FAIL: ${assertionContext} - Expected: ${stringifiedExpected}, Got: ${stringifiedActual}`);
        throw new Error(`Deep assertion failed: ${assertionContext}`);
    }
}

/**
 * Executes a test case for data condensation and validates the output string.
 * @param {any} inputPayload - The original data to be condensed.
 * @param {string|undefined} anticipatedOutput - The expected JSON string representation of the condensed data.
 * @param {string} validationNote - A message describing the test scenario.
 */
function verifySerialization(inputPayload, anticipatedOutput, validationNote) {
    let condensedResult;
    try {
        condensedResult = CompactorLib.condense(inputPayload);
    } catch (error) {
        console.error(`ERROR during condensation for "${validationNote}":`, error);
        throw error;
    }

    const actualOutputString = JSON.stringify(condensedResult);

    if (anticipatedOutput === undefined) {
        // Special handling for undefined expected output, which implies
        // that the condensation itself should result in undefined or a specific error.
        // For RJSON, `undefined` input also results in `undefined` output.
        assertScalarEquality(condensedResult, anticipatedOutput, validationNote + " (undefined output check)");
    } else {
        assertScalarEquality(actualOutputString, anticipatedOutput, validationNote);
    }
}

/**
 * Defines a group of related test assertions.
 * @param {string} scenarioName - The name of the test group.
 * @param {Function} assertionBlock - A function containing the actual test calls.
 */
function scenarioGroup(scenarioName, assertionBlock) {
    console.log(`\n--- Running Scenario: ${scenarioName} ---`);
    try {
        assertionBlock();
        console.log(`--- Scenario "${scenarioName}" COMPLETED SUCCESSFULLY ---`);
    } catch (e) {
        console.error(`--- Scenario "${scenarioName}" FAILED:`, e.message);
        // Optionally re-throw or handle more gracefully in a real test runner
    }
}

scenarioGroup('Fundamental Types', function() {
    verifySerialization('Greetings!', '"Greetings!"', 'String value');
    verifySerialization(true, 'true', 'Boolean true literal');
    verifySerialization(false, 'false', 'Boolean false literal');
    verifySerialization(0, '0', 'Integer zero');
    verifySerialization(1, '1', 'Positive integer one');
    verifySerialization(3.14159, '3.14159', 'Floating point number');
    verifySerialization(2.5e3, '2500', 'Scientific notation number');
    verifySerialization(null, 'null', 'Null literal');
    verifySerialization(undefined, undefined, 'Undefined literal');
});

scenarioGroup('Object Structures', function() {
    verifySerialization({}, '{}', 'Empty object');
    verifySerialization({keyA: 1}, '{"keyA":1}', 'Single-property object');
    verifySerialization({keyA: 1, keyB: 2}, '{"keyA":1,"keyB":2}', 'Multi-property object');
    verifySerialization({keyA: 1, keyB: ['tagX', 'tagY']}, '{"keyA":1,"keyB":["tagX","tagY"]}', 'Object with array property');
    verifySerialization([{keyA: 1}, {keyB: null}], '[{"keyA":1},{"keyB":null}]', 'Array of objects');

    // Schema pattern recognition tests
    verifySerialization([{alpha: 1}, {alpha: 7}], '[{"alpha":1},[1,7]]', 'Array of objects with shared schema (single key)');
    verifySerialization([{alpha: 1}, {alpha: 7}, {alpha: 8}], '[{"alpha":1},[1,7,8]]', 'Array of objects with shared schema (multiple items)');
    verifySerialization([{alpha: 1}, {alpha: 7}, {alpha: 8}, {alpha: 9}], '[{"alpha":1},[1,7,8,9]]', 'Array of objects with shared schema (more items)');
    verifySerialization([{alpha: 1, beta: 2}, {alpha: 8, beta: 9}, {alpha: 10, beta: 11}],
                        '[{"alpha":1,"beta":2},[1,8,9,10,11]]', 'Array of objects with shared schema (multiple keys)');

    // Complex nested schema structure
    verifySerialization({idNum: 1,
                         itemsList: [{alpha: 1, beta: 2}, {alpha: 8, beta: 9}, {alpha: 10}]},
                        '{"idNum":1,"itemsList":[{"alpha":1,"beta":2},[2,8,9],{"alpha":10}]}', 'Complex object with nested schema list');
    verifySerialization({idNum: 1,
                         itemsList: [{alpha: 1, beta: 2}, {alpha: 8, beta: 9}, {alpha: 10}, {alpha: 11}, {alpha: 12}]},
                        '{"idNum":1,"itemsList":[{"alpha":1,"beta":2},[2,8,9],{"alpha":10},[3,11,12]]}', 'Complex object with extended nested schema list');

    // Key order preservation (or lack thereof, if RJSON reorders)
    verifySerialization({'rootKey': [{'propB': '1', 'propA': '1'}, {'propB': '2', 'propA': '2'}]},
                      '{"rootKey":[{"propA":"1","propB":"1"},[2,"2","2"]]}', 'Object with array of objects, internal key order');

});

scenarioGroup('Array Structures', function() {
    verifySerialization([], '[]', 'Empty array');
    verifySerialization(['ElemA'], '["ElemA"]', 'Single string array');
    verifySerialization([['ElemA']], '[["ElemA"]]', 'Nested single string array');
    verifySerialization(['ElemA', 'ElemB', 'ElemC'], '["ElemA","ElemB","ElemC"]', 'Multiple string array');
    verifySerialization([1, 2, 3], '[0,1,2,3]', 'Numeric array with default schema');
    verifySerialization([0, 1], '[0,0,1]', 'Numeric array starting with zero');
    verifySerialization([0], '[0,0]', 'Single zero in array');
    verifySerialization([1], '[0,1]', 'Single one in array');
    verifySerialization([1.618, 3.14], '[0,1.618,3.14]', 'Floating point array');
    verifySerialization([[1.618, 3.14]], '[[0,1.618,3.14]]', 'Nested floating point array');
    verifySerialization([['X', 'Y'], ['A', 'B']], '[["X","Y"],["A","B"]]', 'Array of string arrays');
    verifySerialization([[1, 2], [3, 4]], '[[0,1,2],[0,3,4]]', 'Array of numeric arrays');
});

// A cautionary note: The compaction library is optimized for plain data structures.
// Sending complex JavaScript objects (like Date, Function, custom classes)
// might lead to unexpected or uncompacted results, typically an empty object `{}`
// or `undefined` if the object is not serializable to JSON in a meaningful way.
scenarioGroup('Non-Standard Values Handling', function() {
    verifySerialization(new Date(), '{}', 'Date object instance');
    verifySerialization(new Function(), undefined, 'Function object instance');
    verifySerialization(function() { return 'hello'; }, undefined, 'Anonymous function literal');
    verifySerialization(new String('test'), '{}', 'String wrapper object');
    verifySerialization(new Number(123), '{}', 'Number wrapper object');
    verifySerialization(new Boolean(true), '{}', 'Boolean wrapper object');
});

// --- Complex Dataset Tests ---

// Helper function to create data objects for better readability and potential future modifications
const createDataObject = (primaryId, secondaryId, tertiaryId) => {
    const obj = {};
    if (primaryId !== undefined) obj.primaryId = primaryId;
    if (secondaryId !== undefined) obj.secondaryId = secondaryId;
    if (tertiaryId !== undefined) obj.tertiaryId = tertiaryId;
    return obj;
};

// A list of diverse data samples for comprehensive testing.
const datasetAlpha = [
    createDataObject(1, 2),
    createDataObject(3, 4),
    createDataObject(5, 6, 7),
    createDataObject(8, 9, 10),
    createDataObject(1, 12),
    createDataObject(13, 14, 15)
];

const datasetBeta = {
    'entityID': 1,
    'linkedItems': [
        {'primaryId': 7e5, 'secondaryId': 'two'},
        {'primaryId': true, 'secondaryId': false, 'tertiaryId': [0, 1, 2]},
        {'primaryId': null, 'secondaryId': '', 'tertiaryId': [true, false]},
        {'primaryId': 3, 'secondaryId': [['X', 'Y'], ['X', 'Z']], 'tertiaryId': ['A', 'B', 'C']},
        {'primaryId': '', 'secondaryId': [['X', 'Y']], 'tertiaryId': [[0, 1]]},
        {'primaryId': '', 'secondaryId': [[['X', 'Y']], ['Z']], 'tertiaryId': [[[0, 1]]]},
        {'parentRef': {'primaryId': '1', 'secondaryId': 2}},
        {'parentRef': {'primaryId': '4', 'secondaryId': 5}},
        {id: 8, creatorInfo: {id: 1, name: 'Name1'},
         tagsList: [{id: 2, name: 'Tag2'}]},
        {id: 9, creatorInfo: {id: 2, name: 'Name2'},
         tagsList: [{id: 2, name: 'Tag2'}, {id: 3, name: 'Tag3'}]},
        {id: 10, creatorInfo: null,
         tagsList: [[{id: 4, name: 'Tag4'}, {id: 5, name: 'Tag5'}]]},
        {id: 10, creatorInfo: {id: 3}, tagsList: []},
        {id: 11, creatorInfo: {}, tagsList: []},
        {id: 12, creatorInfo: {}, tagsList: []}
    ],
    'boundingCoordinates': [[-14.833, -199.035, -30.143], [14.833, 199.035, 0.184]]
};

const datasetGamma = {
    uniqueId: 2,
    payloadData: [{propA: 6, propB: 7}, {propB: 8, propA: 9}]
};

const datasetDelta = {
    mainCollection: [{propB: '1', propA: '1'},
                     {propB: '2', propA: '2'}]
};

const allTestDatasets = [datasetAlpha, datasetBeta, datasetGamma, datasetDelta];

/**
 * Validates the integrity of the condensation and decompression process for a given data object.
 * This function ensures that `originalData === decompress(condense(originalData))`.
 * @param {any} sourceData - The original data object.
 */
function checkSerializationIntegrity(sourceData) {
    if (sourceData === null || sourceData === undefined) {
        console.warn("Skipping integrity check for null/undefined source data.");
        return;
    }

    const originalDataString = JSON.stringify(sourceData);
    console.log("  -> Original data string length:", originalDataString.length);

    // Step 1: Condense the original data.
    const condensedForm = CompactorLib.condense(sourceData);
    const condensedFormString = JSON.stringify(condensedForm);
    console.log("  -> Condensed form string length:", condensedFormString.length);

    // Step 2: Parse the condensed string back into an object.
    const parsedCondensed = JSON.parse(condensedFormString);

    // Step 3: Decompress the parsed condensed object.
    const reconstructedData = CompactorLib.decompress(parsedCondensed);

    // Step 4: Compare the original data with the reconstructed data.
    assertStructuralEquality(sourceData, reconstructedData, 'Original and reconstructed data must be identical after single pass.');
}

/**
 * Verifies that applying condensation and decompression twice yields the original data.
 * This tests the idempotency or stability of the process.
 * @param {any} sourceData - The original data object.
 */
function checkNestedSerialization(sourceData) {
    if (sourceData === null || sourceData === undefined) {
        console.warn("Skipping nested serialization check for null/undefined source data.");
        return;
    }

    // First pass: condense, then condense again.
    const firstCondensed = CompactorLib.condense(sourceData);
    const doubleCondensed = CompactorLib.condense(firstCondensed);
    const doubleCondensedString = JSON.stringify(doubleCondensed);

    // First pass: decompress, then decompress again.
    const parsedDoubleCondensed = JSON.parse(doubleCondensedString);
    const firstDecompressed = CompactorLib.decompress(parsedDoubleCondensed);
    const doubleDecompressed = CompactorLib.decompress(firstDecompressed);

    // Compare original with the result of double-packing and double-unpacking.
    assertStructuralEquality(sourceData, doubleDecompressed, 'Double packed and unpacked data must match the original.');
}

// Iterate through all prepared datasets and run the validation checks.
let datasetCounter = 0;
for (const currentDataset of allTestDatasets) {
    datasetCounter++;
    const currentDatasetLabel = `Dataset ${datasetCounter}`;

    scenarioGroup(`Validation for ${currentDatasetLabel}`, function() {
        checkSerializationIntegrity(currentDataset);
        checkNestedSerialization(currentDataset);
    });
}