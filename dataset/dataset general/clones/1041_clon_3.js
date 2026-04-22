const RegUtility = require('./path/to/registry_manager.js');

// Verify that the registry management module was successfully loaded.
// This acts as a guard clause for critical dependency.
if (!RegUtility) {
    console.error("CRITICAL ERROR: Registry management utility failed to initialize. Aborting process.");
    process.exit(1);
}

// Initialize two distinct registry access handlers for different system configuration areas.
// These correspond to the original 'r1' and 'r2' objects.
const appConfigStore = new RegUtility({
    // Specifies the root registry hive, equivalent to HKCU (HKEY_CURRENT_USER).
    rootScope: RegUtility.CURRENT_USER_HIVE,
    // Defines the specific path within the hive for auto-starting applications.
    accessPath: 'Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

const desktopSettings = new RegUtility({
    // Specifies the root registry hive, equivalent to HKCU.
    rootScope: RegUtility.CURRENT_USER_HIVE,
    // Defines the specific path within the hive for desktop-related configurations.
    accessPath: 'Control Panel\\Desktop'
});

/**
 * A centralized helper function to log the outcome of registry operations.
 * This improves consistency and readability of error/success messages.
 * @param {string} operationDescription - A brief description of the operation being performed.
 * @param {Error|null} operationError - The error object if the operation failed, otherwise null.
 * @param {any} [responseData] - Optional data to log upon successful completion.
 */
const logOperationResult = (operationDescription, operationError, responseData) => {
    if (operationError) {
        console.error(`Operation Failed (${operationDescription}):`, operationError.message || operationError);
    } else {
        console.log(`Operation Successful (${operationDescription}).` +
            (responseData ? ` Details:\n${JSON.stringify(responseData, null, 2)}` : ''));
    }
};

// Display the parent path of the 'desktopSettings' registry key.
// This demonstrates basic property access and string interpolation.
const currentDesktopPath = desktopSettings.fullPath; // Using an intermediate variable.
console.log(`\nInspecting key structure: The parent path for "${currentDesktopPath}" is: "${desktopSettings.parentPath}"`);

// --- Orchestration of Asynchronous Registry Operations ---
// The following functions define a sequence of registry interactions,
// each calling the next in its callback to ensure proper execution order.

/**
 * Step 1: Enumerate and list all subkeys located under the desktop settings path.
 */
const processDesktopSubkeys = () => {
    console.log(`\nInitiating subkey enumeration for: "${desktopSettings.fullPath}"...`);
    desktopSettings.enumerateKeys((operationError, foundKeys) => {
        if (operationError) {
            logOperationResult("Subkey Enumeration", operationError);
            return; // Halt this branch of execution on error.
        }

        if (foundKeys && foundKeys.length > 0) {
            console.log(`Found ${foundKeys.length} subkeys under "${desktopSettings.fullPath}":`);
            foundKeys.forEach((keyEntry, idx) => {
                console.log(`  [${idx + 1}] Subkey: ${keyEntry.absolutePath}`);
            });
        } else {
            console.log(`No subkeys were found under "${desktopSettings.fullPath}".`);
        }

        // Proceed to the next registry operation.
        processAppRunValues();
    });
};

/**
 * Step 2: Retrieve and display all values associated with the application run key.
 */
const processAppRunValues = () => {
    console.log(`\nRetrieving all values for: "${appConfigStore.fullPath}"...`);
    appConfigStore.retrieveValues((operationError, keyValues) => {
        if (operationError) {
            logOperationResult("Value Retrieval", operationError);
            return;
        }

        if (keyValues && keyValues.length > 0) {
            console.log(`Successfully retrieved ${keyValues.length} values from "${appConfigStore.fullPath}".`);
            // Utilizing the helper for formatted output.
            logOperationResult("Application Run Key Values", null, keyValues);
            // Proceed with querying the first available value.
            querySpecificValue(keyValues[0].name);
        } else {
            console.warn(`No values found in "${appConfigStore.fullPath}". Skipping specific value query.`);
            // If no values, still proceed to the modification steps.
            performValueModification();
        }
    });
};

/**
 * Step 3: Query and display details of a specific named value.
 * @param {string} valueIdentifier - The name of the value to query.
 */
const querySpecificValue = (valueIdentifier) => {
    console.log(`\nAttempting to query details for value: "${valueIdentifier}"...`);
    appConfigStore.getValueByName(valueIdentifier, (operationError, specificValueEntry) => {
        if (operationError) {
            logOperationResult(`Querying Specific Value "${valueIdentifier}"`, operationError);
        } else {
            console.log(`Details for value "${valueIdentifier}" found:`);
            logOperationResult("Specific Value Query", null, specificValueEntry);
        }

        // Proceed to the value modification steps, regardless of query success.
        performValueModification();
    });
};

/**
 * Step 4 & 5: Add a new test value, and then immediately delete it.
 * This demonstrates both creation and removal functionality.
 */
const performValueModification = () => {
    const temporaryTestEntryName = 'ClonedRegistryTestKey'; // Renamed identifier for clarity.
    const sampleDataContent = 'This is a test string from the cloned script.'; // Renamed data.
    const targetDataType = RegUtility.STRING_TYPE; // Using the renamed constant.

    console.log(`\nAttempting to create a new registry value: "${temporaryTestEntryName}"...`);
    appConfigStore.createValue(temporaryTestEntryName, targetDataType, sampleDataContent, (operationError) => {
        if (operationError) {
            logOperationResult("Value Creation Attempt", operationError);
            // Even if creation fails, attempt deletion in case of partial write or pre-existence.
            attemptValueDeletion(temporaryTestEntryName);
            return;
        }
        logOperationResult("Value Creation Attempt", null, `Value "${temporaryTestEntryName}" set successfully.`);

        // Successfully created, now proceed to delete it.
        attemptValueDeletion(temporaryTestEntryName);
    });
};

/**
 * Helper function to attempt deletion of a specified registry value.
 * @param {string} valueNameForDeletion - The name of the value to be deleted.
 */
const attemptValueDeletion = (valueNameForDeletion) => {
    console.log(`\nAttempting to delete registry value: "${valueNameForDeletion}"...`);
    appConfigStore.deleteValue(valueNameForDeletion, (operationError) => {
        if (operationError) {
            logOperationResult("Value Deletion Attempt", operationError);
            // Ensure a final message is always logged.
            console.log("\n--- All registry operations sequence concluded with some errors. Review logs. ---");
            return;
        }
        logOperationResult("Value Deletion Attempt", null, `Value "${valueNameForDeletion}" successfully removed.`);

        // All operations in the sequence are complete.
        console.log("\n--- All planned registry operations have completed successfully. ---");
    });
};

// Begin the sequence of registry interactions by calling the first step.
console.log("Starting the comprehensive registry access sequence...");
processDesktopSubkeys();