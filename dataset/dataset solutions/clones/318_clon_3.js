// This script is designed to ingest multi-line data from standard input,
// process sets of transaction records, and then identify and report
// entities whose aggregated transaction values exceed a specified financial threshold.

// Initiate the standard input stream to ensure it remains open and ready to receive data.
process.stdin.resume();

// Configure the encoding for the incoming data stream to UTF-8,
// which is a common and robust character encoding.
process.stdin.setEncoding('utf8');

// Define a constant for the minimum financial value an entity's total
// must reach or exceed to be considered eligible for reporting.
const MINIMUM_ELIGIBILITY_THRESHOLD = 1000000;

/**
 * A utility function to safely parse a string into an integer.
 * It provides a default value of 0 if the parsing operation results in NaN (Not-a-Number),
 * ensuring that numerical operations proceed without errors from invalid input.
 * @param {string} textValue - The string representation of a number to be parsed.
 * @returns {number} The integer value of the string, or 0 if parsing fails.
 */
const extractIntegerSafely = (textValue) => {
    const numericalResult = parseInt(textValue.trim(), 10);
    // If the parsed result is NaN, return 0 to maintain data integrity in calculations.
    return isNaN(numericalResult) ? 0 : numericalResult;
};

/**
 * Processes a single transaction record, extracting entity identifier, quantity, and cost,
 * then updates the running total for that entity within the provided map.
 * Includes basic validation to skip malformed or non-contributing records.
 * @param {string[]} recordComponents - An array of strings: [entityID, quantity, unitCost].
 * @param {Map<number, number>} cumulativeEntityAggregates - A map storing entity IDs to their total values.
 * @returns {void}
 */
const processIndividualTransaction = (recordComponents, cumulativeEntityAggregates) => {
    // Validate that the transaction record has the expected number of components.
    // A record must contain at least ID, quantity, and cost.
    if (recordComponents.length < 3) {
        // Malformed records are silently skipped to prevent errors,
        // aligning with common competitive programming practices.
        return;
    }

    // Parse the individual components of the transaction.
    const uniqueEntityIdentifier = extractIntegerSafely(recordComponents[0]);
    const transactionQuantity = extractIntegerSafely(recordComponents[1]);
    const unitPrice = extractIntegerSafely(recordComponents[2]);

    // Apply specific validation rules:
    // 1. Entity ID: If it parses to 0 but the original string was not '0', it's likely an invalid ID.
    // 2. Quantity/Price: Only positive values contribute to a meaningful transaction total.
    if (uniqueEntityIdentifier === 0 && recordComponents[0].trim() !== '0') {
        return; // Skip if the entity ID is invalid (e.g., non-numeric string).
    }
    if (transactionQuantity <= 0 || unitPrice <= 0) {
        return; // Skip transactions with non-positive quantities or prices.
    }

    // Calculate the total value for this specific transaction.
    const transactionSubtotal = transactionQuantity * unitPrice;

    // Retrieve the current aggregated total for this entity, defaulting to 0 if not yet present.
    const existingAccumulatedValue = cumulativeEntityAggregates.get(uniqueEntityIdentifier) || 0;
    // Update the map with the new total for the entity.
    cumulativeEntityAggregates.set(uniqueEntityIdentifier, existingAccumulatedValue + transactionSubtotal);
};

/**
 * Examines the final aggregated totals for all entities and prints the identifiers
 * of those entities whose totals meet or exceed the predefined eligibility threshold.
 * If no entities qualify, it outputs "NA".
 * @param {Map<number, number>} finalAggregatedData - The map containing all entity IDs and their final totals.
 * @returns {void}
 */
const presentEligibleEntities = (finalAggregatedData) => {
    const qualifyingEntityIdentifiers = [];

    // Iterate through each entry (entity ID and its total) in the aggregated data map.
    for (const [entityKey, totalAccumulatedValue] of finalAggregatedData.entries()) {
        if (totalAccumulatedValue >= MINIMUM_ELIGIBILITY_THRESHOLD) {
            qualifyingEntityIdentifiers.push(entityKey);
        }
    }

    // Sort the list of qualifying entity identifiers numerically for consistent output.
    qualifyingEntityIdentifiers.sort((a, b) => a - b);

    if (qualifyingEntityIdentifiers.length > 0) {
        // If there are eligible entities, print each one on a new line.
        qualifyingEntityIdentifiers.forEach(id => console.log(id));
    } else {
        // If no entities met the eligibility criteria, print "NA".
        console.log("NA");
    }
};

// Attach an event listener to the standard input stream for 'data' events.
// This function will execute whenever a chunk of data is received.
process.stdin.on('data', function(incomingDataPayload) {
    // The original problem structure implies all input for a test run arrives in one 'data' chunk.
    // Process the entire payload: split into lines, trim whitespace from each, and filter out empty lines.
    const parsedInputLines = incomingDataPayload.split('\n')
                                                .map(lineContent => lineContent.trim())
                                                .filter(cleanedLine => cleanedLine.length > 0);

    let currentInputLinePointer = 0; // Initialize a pointer to track the current line being processed.

    // Main processing loop: iterates through test cases as long as there are lines remaining.
    while (currentInputLinePointer < parsedInputLines.length) {
        // The first line of each test case specifies the number of transaction records to follow.
        const recordsForCurrentCase = extractIntegerSafely(parsedInputLines[currentInputLinePointer]);
        currentInputLinePointer++; // Advance the pointer to the next line.

        // A value of 0 for recordsForCurrentCase signals the end of test cases.
        if (recordsForCurrentCase === 0) {
            break; // Exit the main processing loop.
        }

        // Initialize a new Map for each test case to store aggregated totals for its entities.
        const currentCaseEntityAggregates = new Map();

        // Loop through and process each transaction record for the current test case.
        for (let recordIterator = 0; recordIterator < recordsForCurrentCase; recordIterator++) {
            // Implement a guard clause to handle potentially truncated input,
            // preventing attempts to access non-existent lines.
            if (currentInputLinePointer >= parsedInputLines.length) {
                // This could indicate malformed input or an unexpected end of stream.
                // For robustness, we break out, assuming the input might be incomplete.
                break;
            }

            const transactionDataLine = parsedInputLines[currentInputLinePointer];
            currentInputLinePointer++; // Move the pointer to the next line.

            // Split the transaction data line into its individual components (e.g., "ID QUANTITY PRICE").
            const transactionSegments = transactionDataLine.split(' ');

            // Delegate the processing of this individual transaction to a helper function.
            processIndividualTransaction(transactionSegments, currentCaseEntityAggregates);
        }

        // Once all records for the current test case have been processed,
        // display the entities that meet the specified eligibility criteria.
        presentEligibleEntities(currentCaseEntityAggregates);
    }
});

// Note: An 'end' event handler for process.stdin is not strictly necessary here,
// as the problem's typical competitive programming context implies all input
// arrives in a single 'data' event, and processing completes within that handler.