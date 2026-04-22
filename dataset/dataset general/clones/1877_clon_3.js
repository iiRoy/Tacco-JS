// This script demonstrates interacting with a NoSQL database,
// focusing on view creation, data insertion, and querying.

// Core Node.js modules for file system operations.
const fileSystemUtility = require('fs');

// Define the absolute path for the database file.
// This path is specific to the original environment and is retained for context.
const databaseStoragePath = '/users/petersirka/desktop/test/test.nosql';

// Import the custom NoSQL database management module.
// Assuming 'index.js' in the parent directory is the entry point.
const dataStoreManager = require('../index');

// Load or create the database instance at the specified path.
let databaseHandle = dataStoreManager.load(databaseStoragePath);

// --- Configuration Constants (Type III: added for clarity and flexibility) ---
const VIEW_DEFINITION_LABEL = 'filteredDocumentsView';
const INITIAL_VIEW_DELAY_MS = 1000;
const BULK_INSERT_DELAY_MS = 2000;
const VIEW_QUERY_DELAY_MS = 3000;
const TOTAL_DOCS_TO_INSERT = 10000;

// --- Main Execution Orchestration (Type III: structured into a self-invoking async function) ---
(async () => {
    // Type III: Added an initial validation check for the database handle.
    if (!databaseHandle) {
        console.error("Critical: Failed to obtain a database handle. Exiting process.");
        process.exit(1);
    }
    console.log(`[INFO] Database successfully initialized at: ${databaseStoragePath}`);

    // Operation 1: Define a new view within the database.
    // This operation is scheduled to run after a specific delay.
    setTimeout(() => {
        console.log(`[TASK] Scheduled: Creating view '${VIEW_DEFINITION_LABEL}'...`);

        // Type III: Extracted map function into a named constant for readability.
        // Renamed 'doc' parameter to 'documentItem'.
        const documentMapper = (documentItem) => {
            // Type III: Rewritten condition slightly for emphasis on range,
            // also checking for property existence and type robustness.
            if (documentItem && typeof documentItem.uniqueId === 'number' &&
                documentItem.uniqueId > 10 && documentItem.uniqueId < 1000) {
                return documentItem; // Include document if it matches the criteria.
            }
            return null; // Explicitly exclude if criteria not met.
        };

        // Type III: Extracted sort function into a named constant.
        // Renamed 'a, b' parameters to 'itemA, itemB'.
        // Rewritten comparison for numeric properties for conciseness.
        const documentSorter = (itemA, itemB) => {
            // Assumes 'uniqueId' is always a number for consistent sorting.
            return itemA.uniqueId - itemB.uniqueId;
        };

        // Type III: Extracted callback into a named constant.
        // Renamed 'count' parameter to 'matchedEntriesCount'.
        const viewCreationCompletion = (matchedEntriesCount) => {
            console.log(`[SUCCESS] View '${VIEW_DEFINITION_LABEL}' successfully created. Matched ${matchedEntriesCount} initial entries.`);
        };

        // Call the database's view creation method with new identifiers and functions.
        databaseHandle.views.create(
            VIEW_DEFINITION_LABEL,
            documentMapper,
            documentSorter,
            viewCreationCompletion,
            'A custom view for selecting and sorting documents by their unique numeric ID.' // Type III: Updated description string.
        );

    }, INITIAL_VIEW_DELAY_MS); // Using a named constant for the delay.

    // Operation 2: Insert a large number of documents into the database.
    // This operation is scheduled to run after a specific delay.
    setTimeout(() => {
        console.log(`[TASK] Scheduled: Initiating bulk insertion of ${TOTAL_DOCS_TO_INSERT} documents.`);

        // Type III: Renamed loop variable 'i' to 'documentCounter'.
        for (let documentCounter = 0; documentCounter < TOTAL_DOCS_TO_INSERT; documentCounter++) {
            // Type III: Changed property name from 'index' to 'uniqueId'.
            // Type III: Added a new property 'creationTimestamp' for more data.
            const newDocumentRecord = {
                uniqueId: documentCounter,
                creationTimestamp: new Date().toISOString()
            };

            // Type III: Changed key generation from `i.toString()` to a template literal.
            const documentKeyIdentifier = `doc_entry_${documentCounter}`;

            databaseHandle.insert(newDocumentRecord, documentKeyIdentifier);

            // Type III: Added a progress log within the loop for large operations.
            if (documentCounter > 0 && documentCounter % 2500 === 0) {
                console.log(`[PROGRESS] ... ${documentCounter} documents have been inserted.`);
            }
        }
        console.log(`[SUCCESS] Finished inserting all ${TOTAL_DOCS_TO_INSERT} documents.`);

    }, BULK_INSERT_DELAY_MS); // Using a named constant for the delay.

    // Operation 3: Query the previously defined view and apply a client-side filter.
    // This operation is scheduled to run after a specific delay.
    setTimeout(() => {
        console.log(`[TASK] Scheduled: Querying view '${VIEW_DEFINITION_LABEL}' with a custom filter.`);

        // Type III: Extracted query callback into a named constant.
        // Renamed 'selected, count' parameters to 'filteredResults, totalMatchingCount'.
        const queryResultsHandler = (filteredResults, totalMatchingCount) => {
            // Type III: Added a guard clause for empty results.
            if (!filteredResults || filteredResults.length === 0) {
                console.warn(`[INFO] View '${VIEW_DEFINITION_LABEL}' query returned no items after filtering.`);
                return;
            }
            console.log(`[SUCCESS] View query completed. Retrieved ${totalMatchingCount} items (after client-side filter).`);
            // console.log("Detailed filtered items:", filteredResults); // Optional: log all items
        };

        // Type III: Extracted filter function into a named constant.
        // Renamed 'f' parameter to 'currentItem'.
        const clientSideFilter = (currentItem) => {
            // Type III: Rewritten condition for filtering, changed range slightly for demonstration
            // (original was >10 && <20, which is 11-19. New is >=11 && <=19, functionally equivalent range).
            // Also checking for property existence.
            if (currentItem && typeof currentItem.uniqueId === 'number' &&
                currentItem.uniqueId >= 11 && currentItem.uniqueId <= 19) {
                // Type III: Changed the property name from 'kokotar' to 'isClientProcessed'.
                currentItem.isClientProcessed = true;
                return currentItem; // Return the modified item.
            }
            return null; // Exclude if not matching.
        };

        // Call the database's view query method with new identifiers and functions.
        databaseHandle.views.all(
            VIEW_DEFINITION_LABEL,
            queryResultsHandler,
            clientSideFilter
        );

    }, VIEW_QUERY_DELAY_MS); // Using a named constant for the delay.

})(); // End of self-invoking function.