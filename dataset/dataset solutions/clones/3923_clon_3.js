/**
 * Helper function to compute the result for a single query, based on two input numbers.
 * This function encapsulates the core logic for determining the final count.
 *
 * @param {number} numA - The first integer value for the query.
 * @param {number} numB - The second integer value for the query.
 * @returns {number} The calculated count for the given pair of numbers.
 */
function computePairResult(numA, numB) {
    let currentSmallest;
    let currentLargest;

    // Determine which of the two input numbers is smaller and which is larger.
    // This replaces a direct Math.min/Math.max call with an explicit conditional check.
    if (numA < numB) {
        currentSmallest = numA;
        currentLargest = numB;
    } else {
        currentSmallest = numB;
        currentLargest = numA;
    }

    // Calculate the product of the two numbers, storing it in an intermediate variable.
    const productValue = currentSmallest * currentLargest;

    // Determine an upper bound for the main iteration loop.
    // This is equivalent to Math.ceil(Math.sqrt(productValue)), rewritten for variety.
    const squareRootOfProduct = Math.sqrt(productValue);
    const iterationBoundary = Math.floor(squareRootOfProduct) + (squareRootOfProduct % 1 !== 0 ? 1 : 0);

    // Initialize the variable that will accumulate the final count.
    let totalComputedCount = 0;

    // Calculate an initial contribution to the total count.
    // This part accounts for a specific set of conditions based on the smaller value.
    const baseCountContribution = (currentSmallest - 1) * 2;
    totalComputedCount += baseCountContribution;

    // Apply an additional increment if a specific relationship between the two numbers holds.
    // This condition checks if currentSmallest is at least 2 less than currentLargest.
    const thresholdForIncrement = currentLargest - 1;
    if (currentSmallest < thresholdForIncrement) {
        totalComputedCount++;
    }

    // Iterate through a range of values to further refine the total count.
    // The loop uses a 'while' structure instead of 'for' for structural variation.
    let loopIterator = currentSmallest + 1;
    while (loopIterator < iterationBoundary) {
        // Compute the floor of the division of the product by the current iterator.
        const currentQuotientFloor = Math.floor(productValue / loopIterator);

        // Based on a specific comparison, increment the total count by either 1 or 2.
        if (currentQuotientFloor === loopIterator) {
            totalComputedCount++; // Increment by one if the quotient equals the iterator.
        } else {
            totalComputedCount += 2; // Increment by two otherwise.
        }
        loopIterator++; // Advance the iterator to the next value.
    }

    return totalComputedCount;
}

/**
 * Main function to process a multi-line string input containing multiple queries.
 * It parses the input, validates it, and then dispatches each query to a helper function.
 *
 * @param {string} inputDataContent - The complete raw input string, typically from stdin.
 */
function processNumericalQueries(inputDataContent) {
    // Split the entire input content into an array of individual lines.
    const dataLines = inputDataContent.split('\n');

    // Parse the first line to determine the total number of queries.
    // .trim() is used for robustness against leading/trailing whitespace.
    const totalQueryCount = Number(dataLines[0].trim());

    // Implement a guard clause for invalid or missing query count.
    if (isNaN(totalQueryCount) || totalQueryCount <= 0) {
        // In a production environment, this might throw an error or log a warning.
        // For competitive programming, this scenario is often implicitly handled by valid input.
        console.error("Error: Invalid or no queries specified in the input data.");
        return; // Exit the function if input is invalid.
    }

    // Iterate through each query, starting from the second line of the input.
    for (let currentQueryIdx = 0; currentQueryIdx < totalQueryCount; currentQueryIdx++) {
        const lineIndexForQuery = currentQueryIdx + 1;
        const currentLine = dataLines[lineIndexForQuery];

        // Skip processing if the line is empty or undefined, which might happen with trailing newlines.
        if (!currentLine || currentLine.trim() === '') {
            continue;
        }

        // Split the current query line into its constituent number strings.
        const queryValuesAsText = currentLine.split(' ');

        // Add a validation step to ensure there are at least two numbers.
        if (queryValuesAsText.length < 2) {
             console.error(`Warning: Skipping invalid query line ${lineIndexForQuery + 1}. Expected two numbers, found less.`);
             continue;
        }

        // Convert the string representations to actual numbers.
        const valueOne = Number(queryValuesAsText[0].trim());
        const valueTwo = Number(queryValuesAsText[1].trim());

        // Add further validation to ensure parsed values are indeed numbers.
        if (isNaN(valueOne) || isNaN(valueTwo)) {
            console.error(`Warning: Skipping query line ${lineIndexForQuery + 1}. Non-numeric values detected.`);
            continue;
        }

        // Call the specialized function to calculate the result for the current pair.
        const finalCalculatedResult = computePairResult(valueOne, valueTwo);

        // Output the computed result to standard output for the current query.
        console.log(finalCalculatedResult);
    }
}

// Entry point for script execution in a Node.js environment,
// typically used for competitive programming platforms.
// Reads the entire content of standard input and passes it to the processing function.
processNumericalQueries(require("fs").readFileSync("/dev/stdin", "utf8"));