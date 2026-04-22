const fileSystemModule = require('fs'); // Import the Node.js file system module for I/O operations.

/**
 * Utility function to safely parse a line of space-separated numeric strings into an array of integers.
 * Non-numeric parts or empty strings will default to 0 after parsing, or can be handled as errors.
 * @param {string} textLine - The input string line to be parsed.
 * @returns {number[]} An array of integers derived from the input line.
 */
function extractIntegersFromLine(textLine) {
    // Perform basic validation to ensure the input is a non-empty string.
    if (typeof textLine !== 'string' || textLine.trim().length === 0) {
        // Return an empty array for invalid or empty input lines to prevent errors downstream.
        return [];
    }

    // Split the line by spaces, then attempt to convert each segment to an integer.
    // Using parseInt with radix 10 ensures proper decimal conversion.
    // If a segment cannot be parsed, it defaults to 0 to maintain array consistency,
    // though in a real-world scenario, more robust error handling might be preferred.
    return textLine.split(' ').map(segment => {
        const numericValue = parseInt(segment, 10);
        return isNaN(numericValue) ? 0 : numericValue; // Replace NaN with 0.
    });
}

// Read the entire content of standard input (typically /dev/stdin in competitive programming).
// The input is expected to be UTF-8 encoded text.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Normalize the input: remove leading/trailing whitespace and split into individual lines.
const processedInputRecords = rawInputContent.trim().split('\n');

let currentRecordPointer = 0; // Initialize a pointer to track the current line being processed.
const totalRecordsAvailable = processedInputRecords.length; // Cache the total number of lines.

// Begin the primary loop to process each test case or configuration block.
// The loop continues as long as there are records left to process.
while (currentRecordPointer < totalRecordsAvailable) {
    // Fetch the current configuration line using the pointer and then advance the pointer.
    const configurationRecord = processedInputRecords[currentRecordPointer++];
    
    // Parse the configuration line to extract key numerical parameters.
    const configParameters = extractIntegersFromLine(configurationRecord);

    // Implement a guard clause for malformed configuration lines.
    // A valid configuration line should typically contain at least two numbers.
    if (configParameters.length < 2) {
        // If the line is empty or doesn't conform, check for the termination signal.
        // If it's not the termination signal, skip this malformed record and proceed.
        if (configParameters[0] === 0 && configParameters[1] === 0) break; // Exit if termination.
        continue; // Skip to the next record if malformed but not termination.
    }

    const expectedItemQuantity = configParameters[0]; // The first parameter, often an item count.
    const purchaseBudgetCeiling = configParameters[1]; // The second parameter, representing a budget limit.

    // Check for the global termination condition: both primary parameters are zero.
    if (expectedItemQuantity === 0 && purchaseBudgetCeiling === 0) {
        break; // Exit the entire processing routine.
    }

    // Ensure there's a subsequent line available for item costs before attempting to read it.
    if (currentRecordPointer >= totalRecordsAvailable) {
        console.error("Critical Error: Incomplete input - missing item cost data after configuration.");
        break; // Terminate due to unexpected end of input.
    }

    // Read the line containing the individual costs of items.
    const itemCostRecord = processedInputRecords[currentRecordPointer++];
    const individualProductCosts = extractIntegersFromLine(itemCostRecord);

    // Optional validation: Compare the actual number of items found with the expected quantity.
    // This can help identify discrepancies in the input data format.
    if (expectedItemQuantity > 0 && individualProductCosts.length !== expectedItemQuantity) {
        // In a production system, this might trigger a warning or a more specific error.
        // For this problem, we proceed with the available costs.
        // console.warn(`Warning: Expected ${expectedItemQuantity} items, but found ${individualProductCosts.length}.`);
    }

    // Initialize an array to store all valid sums of two distinct items.
    const feasiblePairSums = [];

    // Employ nested 'for' loops to efficiently calculate sums of all unique pairs of items.
    // The inner loop starts from 'i + 1' to ensure that:
    // 1. Each item is paired with a *different* item (distinct indices).
    // 2. Each pair (A, B) is considered only once, avoiding redundant (B, A) calculations.
    for (let i = 0; i < individualProductCosts.length; i++) {
        const firstProductValue = individualProductCosts[i];

        for (let j = i + 1; j < individualProductCosts.length; j++) {
            const secondProductValue = individualProductCosts[j];

            const combinedPrice = firstProductValue + secondProductValue;

            // Check if the calculated sum respects the defined budget ceiling.
            if (combinedPrice <= purchaseBudgetCeiling) {
                feasiblePairSums.push(combinedPrice); // Add valid sum to our collection.
            }
        }
    }

    let maximumFeasibleSum = null; // Initialize the result variable to null.

    // Only attempt to sort and find the maximum if there are any valid sums.
    // This avoids errors with `[0]` on an empty array and is an optimization.
    if (feasiblePairSums.length > 0) {
        // Sort the collected sums in descending order (largest to smallest).
        feasiblePairSums.sort((valueA, valueB) => valueB - valueA);
        // The largest sum will then be the first element in the sorted array.
        maximumFeasibleSum = feasiblePairSums[0];
    }

    // Output the final result for the current test case.
    // If a valid maximum sum was found, print it; otherwise, indicate 'NONE'.
    if (maximumFeasibleSum !== null) {
        console.log(maximumFeasibleSum);
    } else {
        console.log('NONE');
    }
}