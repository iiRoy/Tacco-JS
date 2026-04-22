function processSweetDistribution(rawInputString) {
    // This function calculates the maximum number of individual sweet requests
    // that can be fulfilled given a finite quantity of available sweets.

    let fulfilledRequestsCount = 0; // Counter for successfully satisfied requests.
    let currentConsumedSweets = 0;  // Accumulates the total sweets distributed.

    // --- Input Parsing and Validation (Type III additions & Type II renames) ---
    const inputLinesArray = rawInputString.split('\n');

    // A crucial check to ensure the raw input contains at least two lines.
    if (inputLinesArray.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines for configuration and requests.");
        return -1; // Indicate a processing error.
    }

    const firstLineParts = inputLinesArray[0].split(' ');
    // Verify that the first line has exactly two components (total participants and available sweets).
    if (firstLineParts.length !== 2) {
        console.error("Error: Malformed first input line. Expected two space-separated numbers.");
        return -1;
    }

    const totalParticipantsString = firstLineParts[0];
    const availableSweetsString = firstLineParts[1];

    // Explicitly parse string inputs to base-10 integers for safety.
    const totalParticipants = parseInt(totalParticipantsString, 10);
    const availableSweets = parseInt(availableSweetsString, 10);

    // Validate the parsed numeric values to ensure they are valid and non-negative.
    if (isNaN(totalParticipants) || totalParticipants < 0) {
        console.error(`Error: Invalid or negative total participants count: "${totalParticipantsString}"`);
        return -1;
    }
    if (isNaN(availableSweets) || availableSweets < 0) {
        console.error(`Error: Invalid or negative available sweets quantity: "${availableSweetsString}"`);
        return -1;
    }

    // Convert the string array of individual requests into an array of numbers.
    let individualRequests = inputLinesArray[1].split(' ').map(Number);

    // --- Data Preprocessing (Type III additions & Type II renames) ---
    // Filter out any invalid (NaN) or non-positive request amounts to ensure data integrity.
    individualRequests = individualRequests.filter(requestAmount => !isNaN(requestAmount) && requestAmount > 0);

    // Sort the individual requests in ascending order. This greedy approach
    // maximizes the number of satisfied requests by fulfilling smaller ones first.
    individualRequests.sort((requestA, requestB) => requestA - requestB);

    // Optional: Provide a warning if the number of parsed requests doesn't match the declared participant count.
    // The loop logic will handle this discrepancy gracefully by iterating only over available valid requests
    // up to the declared participant limit.
    if (individualRequests.length < totalParticipants) {
        console.warn(`Warning: Fewer valid individual requests (${individualRequests.length}) found than declared participants (${totalParticipants}). Processing available requests.`);
    } else if (individualRequests.length > totalParticipants) {
        console.warn(`Warning: More valid individual requests (${individualRequests.length}) found than declared participants (${totalParticipants}). Only processing the first ${totalParticipants} requests.`);
    }
    
    // --- Core Distribution Logic (Type III rewrite) ---
    // Iterate through the sorted requests. The loop considers both the number of valid requests
    // and the declared total participants, whichever is smaller.
    for (let requestIndex = 0; requestIndex < individualRequests.length && requestIndex < totalParticipants; requestIndex++) {
        const currentRequestAmount = individualRequests[requestIndex];

        // Check if fulfilling the current request would exceed the remaining available sweets.
        if (currentConsumedSweets + currentRequestAmount <= availableSweets) {
            currentConsumedSweets += currentRequestAmount; // Allocate sweets for this request.
            fulfilledRequestsCount++;                      // Increment the count of fulfilled requests.
        } else {
            // If the current request cannot be met, no subsequent (and thus larger) requests
            // will be able to be met either. Terminate the process early.
            break;
        }
    }

    // --- Output Result (Type II change) ---
    // Output the final count of requests that were successfully fulfilled.
    console.info(fulfilledRequestsCount);

    // Return the final count, enabling this function to be used in other contexts or for testing.
    return fulfilledRequestsCount;
}

// --- Execution Entry Point (Type III addition for robustness) ---
// This block handles reading input from stdin and invoking the main processing function.
// A try-catch block is added to gracefully handle potential file system errors or other exceptions.
try {
    const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    processSweetDistribution(inputData);
} catch (executionError) {
    console.error("An unexpected error occurred during program execution:", executionError.message);
    // Depending on requirements, a default output or further error handling could be implemented here.
}