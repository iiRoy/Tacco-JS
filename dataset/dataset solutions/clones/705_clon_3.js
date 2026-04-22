// Global variables to store data for processing.
// Renamed from 'n', 'm', 'a', 'b' to be more descriptive and avoid single-letter names.
let countXElements, countYElements;
let primaryDataSet = [];
let secondaryDataSet = [];

/**
 * Performs an efficient binary search on a pre-sorted numeric array to locate a specific value.
 * This function was originally named 'search'.
 * @param {number} targetValue The numeric value to be found within the 'secondaryDataSet'.
 * @returns {boolean} Returns 'true' if 'targetValue' is present in 'secondaryDataSet', otherwise 'false'.
 */
function findValueInSortedSet(targetValue) {
    // Implement a guard clause for an empty or invalid dataset to prevent errors.
    if (!secondaryDataSet || secondaryDataSet.length === 0) {
        return false;
    }

    let lowerBound = 0; // Represents the leftmost boundary of the search space. Renamed from 'l'.
    let upperBound = secondaryDataSet.length; // Represents the rightmost boundary (exclusive). Renamed from 'r'.

    // The binary search loop continues as long as there are at least two elements in the search range.
    // The condition 'upperBound - lowerBound > 1' is rewritten to 'lowerBound + 1 < upperBound' for clarity.
    while (lowerBound + 1 < upperBound) {
        // Calculate the middle index of the current search range.
        // Changed from bitwise right shift '>> 1' to 'Math.floor((...)/2)' for explicit division and floor.
        const middleIndex = Math.floor((lowerBound + upperBound) / 2); // Renamed from 'c'.

        // If the element at 'middleIndex' is less than or equal to the 'targetValue',
        // it means the 'targetValue' could be at 'middleIndex' or to its right.
        if (secondaryDataSet[middleIndex] <= targetValue) {
            lowerBound = middleIndex; // Adjust the lower bound to 'middleIndex'.
        } else {
            // Otherwise, the 'targetValue' must be to the left of 'middleIndex'.
            upperBound = middleIndex; // Adjust the upper bound to 'middleIndex'.
        }
    }
    // After the loop, 'lowerBound' will point to the largest element that is less than or equal to 'targetValue'.
    // We perform a final check to see if this element is precisely the 'targetValue'.
    return secondaryDataSet[lowerBound] === targetValue;
}

/**
 * A utility helper function to compute the sum of all numeric elements within an array.
 * This is a newly added fragment for Type III transformation, improving code modularity.
 * @param {number[]} numericArray The array of numbers whose sum is to be calculated.
 * @returns {number} The cumulative sum of the array's elements.
 */
const calculateArraySum = (numericArray) => numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);


/**
 * Orchestrates the processing of each test case provided in the input stream.
 * This function was originally named 'main'.
 */
function processInputData() {
    // The main loop continues as long as valid numeric data for element counts can be read.
    // The original 'while(n = scan())' behavior is replicated by checking for null/NaN.
    while (true) {
        const nextXCount = getNextNumericToken();
        // If no more numeric tokens or an invalid number is encountered, it signifies the end of input.
        if (nextXCount === null || isNaN(nextXCount)) {
            break; // Terminate the processing loop.
        }
        countXElements = nextXCount; // Assign the count for the primary dataset.

        const nextYCount = getNextNumericToken();
        // A robustness check for secondary count, though typically input is well-formed.
        if (nextYCount === null || isNaN(nextYCount)) {
            break;
        }
        countYElements = nextYCount; // Assign the count for the secondary dataset.

        // Re-initialize (clear) the global arrays for the current test case.
        // This ensures no leftover data from previous test cases.
        primaryDataSet = [];
        secondaryDataSet = [];

        // Populate the primaryDataSet by reading 'countXElements' numbers.
        // Replaced the custom 'rep' loop helper with a standard 'for' loop.
        for (let i = 0; i < countXElements; ++i) {
            primaryDataSet.push(getNextNumericToken());
        }

        // Populate the secondaryDataSet by reading 'countYElements' numbers.
        // Replaced the custom 'rep' loop helper with a standard 'for' loop.
        for (let i = 0; i < countYElements; ++i) {
            secondaryDataSet.push(getNextNumericToken());
        }

        // Sort both datasets in ascending order to enable binary search and other ordered operations.
        // The original anonymous comparison function is retained.
        primaryDataSet.sort((valA, valB) => valA - valB);
        secondaryDataSet.sort((valA, valB) => valA - valB);

        // Calculate the sum of elements for both datasets using the new helper function.
        const sumPrimary = calculateArraySum(primaryDataSet); // Renamed from 's'.
        const sumSecondary = calculateArraySum(secondaryDataSet); // Renamed from 't'.

        // Determine the overall difference between the sums.
        const totalDifference = sumSecondary - sumPrimary;
        // Calculate the required 'shift' value (renamed from 'd').
        const requiredDiff = Math.floor(totalDifference / 2);

        // Check if the 'totalDifference' is odd. If so, a valid pair cannot be found.
        // Rewritten from 't - s !== 2 * d' to a direct modulo check 'totalDifference % 2 !== 0'.
        if (totalDifference % 2 !== 0) {
            outputResult(-1); // Output -1 indicating no solution for this case.
            continue; // Skip the rest of the current iteration and proceed to the next test case.
        }

        let isSolutionFound = false; // Flag to track if a valid pair has been identified. Renamed from 'ans'.

        // Iterate through each element in the primary dataset.
        // Replaced the custom 'rep' loop with a standard 'for' loop for iteration.
        for (let i = 0; i < primaryDataSet.length; i++) {
            const currentPrimaryElement = primaryDataSet[i];
            // Calculate the target value that needs to be found in the secondary dataset.
            const targetInSecondary = currentPrimaryElement + requiredDiff;

            // Use the renamed binary search function to efficiently check for 'targetInSecondary'.
            if (findValueInSortedSet(targetInSecondary)) {
                // If a matching value is found, output the pair.
                outputResult(`${currentPrimaryElement} ${targetInSecondary}`);
                isSolutionFound = true; // Mark that a solution has been found.
                break; // Exit the loop early as per the problem's requirement (find any valid pair).
            }
        }

        // If after checking all elements in 'primaryDataSet', no solution was found.
        if (!isSolutionFound) {
            outputResult(-1); // Output -1.
        }

        // The original code had 'a = []; b = [];' here. This is removed as the arrays are re-initialized
        // at the beginning of each loop iteration, making this redundant.
    }
}

// --- Enhanced Input/Output Management ---

// A buffer to accumulate all raw input from standard input. Renamed from 'input'.
let rawInputBuffer = '';
// An array to store processed input tokens, reversed so 'pop()' gets them in original order.
let processedTokens = [];

/**
 * Retrieves and converts the next available token from the input stream into a number.
 * This function was originally named 'scan'.
 * @returns {number|null} The next numeric token, or 'null' if no more tokens are available.
 */
function getNextNumericToken() {
    if (processedTokens.length === 0) {
        return null; // Indicates that the input stream has been exhausted.
    }
    // 'pop()' is used on the reversed array to get tokens in their logical order.
    const token = processedTokens.pop();
    return Number(token); // Explicitly convert the string token to a number.
}

// The original 'scan_string' function has been removed as it was not utilized in the core logic.

/**
 * Handles the output of results to the console.
 * This function was originally named 'print'.
 * @param {*} value The data (number, string, etc.) to be displayed.
 */
function outputResult(value) {
    console.log(value);
}

// Standard Node.js setup for reading from standard input asynchronously.
// These sections are generally boilerplate and are kept largely similar to the original.
process.stdin.resume(); // Ensures the stdin stream remains open.
process.stdin.setEncoding('utf8'); // Specifies the character encoding for input.

// Event listener to accumulate incoming data chunks into the buffer.
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

// Event listener for when the entire input stream has been received.
process.stdin.on('end', function() {
    // Process the accumulated raw input:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string into an array of tokens using any whitespace as a delimiter.
    // 3. Reverse the array so that 'pop()' retrieves tokens in their original order of appearance.
    processedTokens = rawInputBuffer.trim().split(/\s+/).reverse();
    processInputData(); // Initiate the main data processing logic.
});

// The original 'rep' function has been entirely removed. Its functionality has been
// replaced by direct usage of standard JavaScript 'for' loops and 'forEach' methods
// throughout the 'processInputData' function, which is a structural deletion.