// Global storage for the number of elements in the first set for the current test case.
let firstSetElementCount;
// Global storage for the number of elements in the second set for the current test case.
let secondSetElementCount;

// Array to hold the first collection of numbers.
let collectionAlpha = [];
// Array to hold the second collection of numbers, which will be searched.
let collectionBeta = [];

/**
 * Performs a binary search on a sorted array to find if a target value exists.
 * This function specifically operates on the globally defined 'collectionBeta'.
 * @param {number} soughtValue - The value to search for within collectionBeta.
 * @returns {boolean} True if the value is found, false otherwise.
 */
function findInSortedCollection(soughtValue) {
    // Early exit: If the collection is empty, the value cannot be found.
    if (collectionBeta.length === 0) {
        return false;
    }

    let lowerBound = 0;
    // The upper bound is exclusive, representing the length of the array.
    let upperBound = secondSetElementCount;

    // Binary search loop: continues as long as there's more than one element in the search range.
    // The loop maintains the invariant that if 'soughtValue' exists, it is in [lowerBound, upperBound).
    while (upperBound - lowerBound > 1) {
        // Calculate the middle index. Using unsigned right shift (>>>) ensures a positive integer.
        const midPoint = (lowerBound + upperBound) >>> 1;

        // If the element at the midpoint is less than or equal to the sought value,
        // it means the value might be in the right half (including the midpoint).
        if (collectionBeta[midPoint] <= soughtValue) {
            lowerBound = midPoint;
        }
        // Otherwise, the value must be in the left half, so narrow the upper bound.
        else {
            upperBound = midPoint;
        }
    }
    // After the loop, 'lowerBound' points to the potential match or the largest element less than 'soughtValue'.
    // Check if the element at 'lowerBound' is indeed the 'soughtValue'.
    return collectionBeta[lowerBound] === soughtValue;
}

/**
 * Main processing function for each set of input data.
 * Reads numbers, sorts them, calculates sums, and attempts to find a specific pair
 * that satisfies the given condition for sum equality after a swap.
 */
function processDataSets() {
    // Loop through multiple test cases. The loop continues as long as 'retrieveNextNumericValue()'
    // successfully provides a number for 'firstSetElementCount'.
    while ((firstSetElementCount = retrieveNextNumericValue()) !== null) {
        secondSetElementCount = retrieveNextNumericValue();

        // Clear the global arrays for the new test case to prevent data leakage.
        collectionAlpha.length = 0;
        collectionBeta.length = 0;

        // Populate the first collection by reading 'firstSetElementCount' numbers.
        for (let idx = 0; idx < firstSetElementCount; ++idx) {
            collectionAlpha.push(retrieveNextNumericValue());
        }

        // Populate the second collection by reading 'secondSetElementCount' numbers.
        for (let idx = 0; idx < secondSetElementCount; ++idx) {
            collectionBeta.push(retrieveNextNumericValue());
        }

        // Sort both collections in ascending order. This is crucial for the binary search.
        collectionAlpha.sort((valA, valB) => valA - valB);
        collectionBeta.sort((valA, valB) => valA - valB);

        // Calculate the sum of elements in the first collection using the reduce method.
        let sumOfCollectionAlpha = collectionAlpha.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        // Calculate the sum of elements in the second collection using the reduce method.
        let sumOfCollectionBeta = collectionBeta.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        // The problem requires finding an element 'x' from collectionAlpha and 'y' from collectionBeta
        // such that if 'x' and 'y' are swapped, the sums of the two collections become equal.
        // Let S_alpha be sumOfCollectionAlpha and S_beta be sumOfCollectionBeta.
        // After swapping x and y:
        // New S_alpha = S_alpha - x + y
        // New S_beta = S_beta - y + x
        // For equality: S_alpha - x + y = S_beta - y + x
        // Rearranging: S_alpha - S_beta = 2x - 2y
        // S_alpha - S_beta = -2(y - x)
        // 2(y - x) = S_beta - S_alpha
        // y - x = (S_beta - S_alpha) / 2
        // Let 'targetSwapDifference' = (S_beta - S_alpha) / 2.
        // We need to find x from collectionAlpha and y from collectionBeta such that y = x + targetSwapDifference.

        const overallSumDifference = sumOfCollectionBeta - sumOfCollectionAlpha;

        // If the 'overallSumDifference' is odd, it's impossible to find integer 'x' and 'y'
        // that satisfy the condition, as 'y - x' must be an integer.
        if (overallSumDifference % 2 !== 0) {
            outputResult(-1); // Output -1 as no solution exists.
            continue; // Move to the next test case.
        }

        const targetSwapDifference = overallSumDifference / 2; // This is the required (y - x).

        let solutionFound = false; // Flag to track if a suitable pair is discovered.

        // Iterate through each element 'currentElementAlpha' in the first collection.
        // For each 'currentElementAlpha', calculate the 'requiredElementBeta' and search for it.
        for (const currentElementAlpha of collectionAlpha) {
            const requiredElementBeta = currentElementAlpha + targetSwapDifference;
            // Use the optimized binary search to check if 'requiredElementBeta' exists in 'collectionBeta'.
            if (findInSortedCollection(requiredElementBeta)) {
                // If found, print the pair and set the flag.
                outputResult(`${currentElementAlpha} ${requiredElementBeta}`);
                solutionFound = true;
                break; // A solution is found, so we can exit the loop for this test case.
            }
        }

        // If the loop completes without finding any suitable pair.
        if (!solutionFound) {
            outputResult(-1); // Output -1.
        }
    }
}

// --- Input/Output Handling Utilities ---

// Buffer to store raw input received from stdin.
let inputBuffer = '';
// Array to hold parsed and reversed input tokens (numbers/strings).
let processedInputTokens = [];

/**
 * Retrieves the next numeric value from the pre-processed input tokens.
 * @returns {number|null} The next number, or null if no more tokens are available.
 */
function retrieveNextNumericValue() {
    // If the token array is empty, there's no more input.
    if (processedInputTokens.length === 0) {
        return null;
    }
    // Pop the last element (which is the next in original order due to reversal) and convert to number.
    return +processedInputTokens.pop();
}

/**
 * Retrieves the next string value from the pre-processed input tokens.
 * This function is included for completeness but not strictly used in this problem.
 * @returns {string|null} The next string, or null if no more tokens.
 */
function retrieveNextStringValue() {
    if (processedInputTokens.length === 0) {
        return null;
    }
    return processedInputTokens.pop();
}

/**
 * Displays a value to the console, typically for the problem's output.
 * @param {*} valueToPrint - The value (number or string) to be displayed.
 */
function outputResult(valueToPrint) {
    console.log(valueToPrint);
}

// Set up event listeners for standard input stream.
process.stdin.resume(); // Ensure the Node.js process does not exit prematurely.
process.stdin.setEncoding('utf8'); // Specify character encoding for input.

// Event handler for 'data' chunks received from stdin.
process.stdin.on('data', function(dataChunk) {
    inputBuffer += dataChunk; // Append incoming data to the global buffer.
});

// Event handler for 'end' of stdin stream, indicating all input has been received.
process.stdin.on('end', function() {
    // Process the buffered input:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string by any whitespace (spaces, newlines, tabs) into an array of tokens.
    // 3. Reverse the array so that `pop()` retrieves tokens in their original input order.
    processedInputTokens = inputBuffer.trim().split(/\s+/).reverse();
    // Once all input is ready, initiate the main data processing logic.
    processDataSets();
});