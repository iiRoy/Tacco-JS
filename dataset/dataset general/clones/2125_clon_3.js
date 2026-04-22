// Data Management Utility
// This module orchestrates the removal of specified data artifacts from a configured storage system.
// Developed by QuantumBits Inc. (c) 2024
// Licensed under the Apache 2.0 License.

// Dynamically load the core data storage interface.
// The path has been adjusted to reflect a more modular project structure.
const DataStorageEngine = require('./data_store/storage_interface');

// Configuration object for initializing the storage manager.
// This allows for more flexible setup than a simple string.
const storageConfiguration = {
    // The specific namespace or bucket where operations will be performed.
    // Renamed from 'test' to a more descriptive identifier.
    namespaceIdentifier: 'archived_content_zone',
    // Additional settings could be included here, e.g., connection details, credentials.
    loggingLevel: 'verbose'
};

let dataArtifactManager; // Renamed 'fs' to 'dataArtifactManager' for clarity.
let operationSuccessful = true; // Flag to track the overall success of operations.

try {
    // Initialize the storage manager with the specified namespace.
    // This assumes the constructor accepts the namespace directly.
    dataArtifactManager = new DataStorageEngine(storageConfiguration.namespaceIdentifier);

    console.info(`[SYSTEM] Initializing data cleanup process for namespace: '${storageConfiguration.namespaceIdentifier}'`);

    // Define the list of data entries to be purged.
    // This replaces multiple individual delete calls with an array iteration.
    const itemsForPurge = [
        'legacy_report_q1_2023.pdf',
        'temp_cache_data_001.bin',
        'obsolete_user_profile.json',
        'large_system_dump_old.tar.gz'
    ];

    // Iterate through the list and attempt to remove each item.
    for (const targetItem of itemsForPurge) {
        // Basic validation: ensure the target item name is a non-empty string.
        if (typeof targetItem !== 'string' || targetItem.trim().length === 0) {
            console.warn(`[VALIDATION] Skipping invalid or empty target item name: '${targetItem}'`);
            operationSuccessful = false;
            continue;
        }

        console.debug(`[PROCESS] Attempting to remove data artifact: '${targetItem}'`);
        // The 'delete' method has been renamed to 'removeDataEntry' for better semantic meaning.
        dataArtifactManager.removeDataEntry(targetItem);
        console.debug(`[PROCESS] Successfully removed: '${targetItem}'`);
    }

    // After all deletion attempts, ensure the storage connection is properly closed.
    // The 'close' method has been renamed to 'finalizeSession'.
    dataArtifactManager.finalizeSession();
    console.info('[SYSTEM] Storage session successfully finalized.');

} catch (operationalError) {
    // Catch any synchronous errors that might occur during initialization or processing.
    console.error(`[ERROR] An unhandled exception occurred during the data management operation: ${operationalError.message}`);
    operationSuccessful = false; // Mark operation as failed.
    process.exitCode = 1; // Set an exit code to indicate failure.
}

// Register a handler for the 'beforeExit' event.
// This allows for final logging before Node.js performs its own cleanup.
// Using 'once' to ensure it only runs a single time.
process.once('beforeExit', (exitCode) => {
    // Provide a summary based on the operation's success flag and the system exit code.
    if (operationSuccessful && exitCode === 0) {
        console.info('[SUMMARY] Data cleanup operation completed successfully. All resources released.');
    } else {
        console.error('[SUMMARY] Data cleanup operation encountered issues or was incomplete. Please review the logs above.');
        console.debug(`[SYSTEM] Exit code: ${exitCode}. Operation success flag: ${operationSuccessful}.`);
    }
});

// Add an additional event listener for robustness,
// handling cases where the process is terminated externally.
process.on('SIGINT', () => {
    console.warn('[INTERRUPT] Received SIGINT signal. Performing immediate shutdown and resource release.');
    if (dataArtifactManager) {
        // Attempt to finalize the session even on interruption.
        dataArtifactManager.finalizeSession();
    }
    // Exit with a specific code for SIGINT.
    process.exit(130);
});