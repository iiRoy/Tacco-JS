const fileSystemOperations = require('node:fs');
const pathUtilities = require('node:path');
const assertionModule = require('node:assert');
const csvDataSource = require('../index.js'); // Assuming '..' refers to the parent directory where index.js is

// Define the temporary file location for testing purposes
const temporaryDataCacheFile = pathUtilities.join('/tmp', 'processed_csv_data_test_cache.csv');

// --- Setup Phase: Prepare the test data file ---
try {
    // Determine the source path for the initial test data
    const sourceTestDataPath = pathUtilities.resolve(__dirname, 'test.csv');
    // Read the content from the original test data file
    const rawBufferContent = fileSystemOperations.readFileSync(sourceTestDataPath);
    // Write this content to the temporary cache file
    fileSystemOperations.writeFileSync(temporaryDataCacheFile, rawBufferContent);
    console.log(`[INFO] Test data successfully provisioned at: ${temporaryDataCacheFile}`);
} catch (dataPrepError) {
    // Handle any errors during file preparation
    console.error(`[CRITICAL] Failed to set up test data file: ${dataPrepError.message}`);
    process.exit(1); // Exit if data setup fails, as tests cannot proceed
}

// --- Initialization Phase: Instantiate the CSV data processor ---
const processorConfiguration = {
    autoRefreshIntervalMs: 1000 // Renamed and clarified the autofetch option
};
const dataProcessingEngine = csvDataSource(temporaryDataCacheFile, processorConfiguration);
console.log('[DEBUG] CSV data processing engine initialized and awaiting data load.');

// --- Validation Phase: Listen for data readiness and perform assertions ---
dataProcessingEngine.once('fetch', function handleDataReadyEvent() {
    console.log('[DEBUG] "fetch" event triggered. Data is now available for validation.');

    const expectedEntryCount = 2; // Helper variable for expected total entries
    const currentRecordsCollection = dataProcessingEngine.cachedEntries; // Renamed 'entries' property
    const recordKeysArray = Object.keys(currentRecordsCollection);

    // Guard clause: Check if any records were loaded at all
    if (recordKeysArray.length === 0) {
        console.error('[ERROR] No records were loaded into the data engine!');
        assertionModule.fail('The data collection is unexpectedly empty.');
    }

    // Assertion 1: Verify the total number of records loaded
    assertionModule.strictEqual(recordKeysArray.length, expectedEntryCount,
        `Expected ${expectedEntryCount} records, but found ${recordKeysArray.length}.`);
    console.log(`[SUCCESS] Verified total record count: ${recordKeysArray.length} entries.`);

    const specificRecordIdentifier = "key3"; // Helper variable for the target key
    const targetRecordObject = currentRecordsCollection[specificRecordIdentifier]; // Renamed 'row'

    // Guard clause: Ensure the specific record exists before checking its properties
    if (!targetRecordObject) {
        console.error(`[ERROR] The expected record with key '${specificRecordIdentifier}' was not found!`);
        assertionModule.fail(`Missing critical record: ${specificRecordIdentifier}`);
    }

    // Assertion 2: Check data type for the 'enabled' field
    assertionModule.strictEqual(typeof targetRecordObject.enabled, "boolean",
        `Type mismatch for 'enabled' field: Expected boolean, got ${typeof targetRecordObject.enabled}.`);

    // Assertion 3: Check data type for the 'update-time' field (using bracket notation)
    assertionModule.strictEqual(typeof targetRecordObject['update-time'], "object",
        `Type mismatch for 'update-time' field: Expected object, got ${typeof targetRecordObject['update-time']}.`);

    // Assertion 4: Check data type for the 'first' field
    assertionModule.strictEqual(typeof targetRecordObject.first, "string",
        `Type mismatch for 'first' field: Expected string, got ${typeof targetRecordObject.first}.`);

    // Assertion 5: Check data type for the 'phone' field
    assertionModule.strictEqual(typeof targetRecordObject.phone, "number",
        `Type mismatch for 'phone' field: Expected number, got ${typeof targetRecordObject.phone}.`);

    console.log(`[SUCCESS] All data type assertions passed for record '${specificRecordIdentifier}'.`);

    // --- Cleanup Phase: Stop the data engine ---
    dataProcessingEngine.stop();
    console.log('[INFO] CSV data processing engine has been gracefully halted.');
});