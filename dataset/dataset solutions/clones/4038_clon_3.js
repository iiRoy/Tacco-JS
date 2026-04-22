// --- Input Source Configuration and Setup ---

/**
 * Provides a hardcoded, simulated input string for development or testing.
 * This acts as a mock for standard input, allowing local execution without
 * relying on external file system operations.
 */
const MockInputProvider = function () {
    /**
     * Retrieves a pre-defined multi-line string.
     * @param {string} [placeholderText] - An optional parameter, included for signature consistency
     *                                     with the production input fetcher, but not used here.
     * @returns {string} The simulated input data.
     */
    const provideSimulatedInput = function (placeholderText) {
        // The raw input data, embedded directly within the code.
        const mockDataBuffer = `5
        3 1 4 1 5
        2 7 1 8 2
        `;
        // Trim leading/trailing whitespace from the entire buffer for clean data.
        return mockDataBuffer.trim();
    };

    // Expose the function that provides the simulated input.
    return provideSimulatedInput;
};

/**
 * Fetches input from the standard input stream, typically used in production environments.
 * This module leverages Node.js's file system capabilities to read from /dev/stdin.
 */
const StandardInputFetcher = function () {
    // Import the Node.js file system module, necessary for reading files.
    const fileSystemModule = require('fs');

    /**
     * Reads content from the standard input path (`/dev/stdin`).
     * @param {string} [optionalMessage] - An optional message to log to the console
     *                                     before attempting to read input.
     * @returns {string} The content read from standard input.
     */
    const fetchRealInput = function (optionalMessage) {
        // If a message is supplied, print it to the console.
        if (optionalMessage) {
            console.log(optionalMessage);
        }
        // Synchronously read the entire content of '/dev/stdin' and decode it as UTF-8.
        const fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        return fileContent;
    };

    // Expose the function that fetches real input.
    return fetchRealInput;
};

// --- Global Configuration Flag ---
/**
 * A boolean flag indicating whether the application is running in debug/mock mode.
 * Set to `true` to use `MockInputProvider`, `false` for `StandardInputFetcher`.
 */
const isDebugModeActive = false; // Renamed from 'debug'

// --- Input Acquisition Logic ---
/**
 * Selects and initializes the appropriate input source based on the `isDebugModeActive` flag.
 * This variable will hold the function responsible for retrieving the raw input string.
 */
const inputSourceResolver = isDebugModeActive ? MockInputProvider() : StandardInputFetcher();

// --- Helper Functions for Data Parsing and Validation ---

/**
 * Parses a string line into an array of integers, filtering out invalid entries and sorting them.
 * Includes robust error handling and validation for input.
 * @param {string} lineContent - The string line to be parsed.
 * @returns {number[]} An array of sorted integers. Returns an empty array if parsing fails.
 */
const parseNumberArray = (lineContent) => {
    // Input validation: Ensure the line content is a non-empty string.
    if (!lineContent || typeof lineContent !== 'string' || lineContent.trim() === '') {
        console.error("Warning: Attempted to parse an invalid or empty line content. Returning empty array.");
        return [];
    }

    // Split the line by spaces, filter out any empty strings resulting from multiple spaces,
    // then attempt to parse each part into an integer with an explicit radix (base 10).
    const parsedNumbers = lineContent
                            .split(' ')
                            .filter(s => s.trim() !== '') // Remove empty strings from split
                            .map(numericString => parseInt(numericString.trim(), 10)); // Parse with radix

    // Further validation: Filter out any results that are Not-a-Number (NaN) after parsing.
    const validatedAndFiltered = parsedNumbers.filter(num => !isNaN(num));

    // Sort the numbers in ascending order for consistent processing.
    validatedAndFiltered.sort((valA, valB) => valA - valB);

    return validatedAndFiltered;
};

/**
 * Parses the first line of input to determine the expected count of elements in subsequent arrays.
 * Includes validation to ensure the count is a positive integer.
 * @param {string} line - The first line of the input, expected to contain the element count.
 * @returns {number} The total number of elements. Exits the process if invalid.
 */
const getTotalElementsCount = (line) => {
    const count = parseInt(line.trim(), 10);
    // Validate that the parsed count is a positive integer.
    if (isNaN(count) || count <= 0) {
        console.error("Error: Invalid or non-positive element count provided in the first line.");
        process.exit(1); // Terminate execution due to critical input error.
    }
    return count;
};

// --- Data Processing and Preparation ---

// Fetch the raw input string using the selected resolver and split it into lines.
// Filter out any lines that are empty after trimming whitespace, ensuring only meaningful lines are processed.
const rawInputLines = inputSourceResolver().split('\n').filter(line => line.trim() !== '');

// Initial validation: Ensure there are enough lines of input to proceed.
// We expect at least 3 lines: count, first array, second array.
if (rawInputLines.length < 3) {
    console.error("Error: Insufficient input lines provided. Expected at least 3 lines.");
    process.exit(1); // Terminate due to insufficient input.
}

// Extract the total number of elements from the first line using the helper function.
const arrayLength = getTotalElementsCount(rawInputLines[0]); // Renamed from N

// Parse and sort the first set of numbers from the second line of input.
const firstDataSet = parseNumberArray(rawInputLines[1]); // Renamed from a

// Parse and sort the second set of numbers from the third line of input.
const secondDataSet = parseNumberArray(rawInputLines[2]); // Renamed from b

// Post-parsing validation: Verify that the actual number of elements parsed
// matches the `arrayLength` declared in the first line of input.
if (firstDataSet.length !== arrayLength || secondDataSet.length !== arrayLength) {
    console.error("Error: The actual number of elements in the parsed arrays does not match the declared element count.");
    console.error(`Declared: ${arrayLength}, First Array: ${firstDataSet.length}, Second Array: ${secondDataSet.length}`);
    process.exit(1); // Terminate due to data inconsistency.
}


// --- Core Calculation Logic ---

// Variables to accumulate the sums based on comparisons between elements.
// `deficitSum` accumulates differences where `firstDataSet` element is larger.
let deficitSum = 0; // Renamed from h, changed `var` to `let` for block scoping.
// `surplusHalfSum` accumulates half the differences where `secondDataSet` element is larger.
let surplusHalfSum = 0; // Renamed from k, changed `var` to `let`.

// Iterate through both datasets concurrently, comparing elements at the same index.
for (let elementIndex = 0; elementIndex < arrayLength; elementIndex++) { // Renamed `i` to `elementIndex`, `var` to `let`.
    // Retrieve the current values from each dataset for clarity and potential reuse.
    const currentAValue = firstDataSet[elementIndex];
    const currentBValue = secondDataSet[elementIndex];

    // Conditional logic to update `deficitSum` or `surplusHalfSum`.
    if (currentAValue > currentBValue) {
        // If the element from `firstDataSet` is greater, calculate the positive difference.
        const difference = currentAValue - currentBValue;
        deficitSum += difference;
    } else if (currentBValue > currentAValue) {
        // If the element from `secondDataSet` is greater, calculate the positive excess.
        // Add half of this excess (rounded down) to `surplusHalfSum`.
        const excess = currentBValue - currentAValue;
        surplusHalfSum += Math.floor(excess / 2);
    }
    // Explicitly handling the case where elements are equal.
    // While this `else` block doesn't perform an action, it clarifies the logic
    // that no sum is updated when values are identical.
    else {
        // currentAValue === currentBValue, no operation needed for sums.
        // A debug message could be added here if detailed tracing is required.
    }
}

// --- Final Result Determination and Output ---

// Determine the final condition based on the comparison of accumulated sums.
// The condition is met if `surplusHalfSum` is greater than or equal to `deficitSum`.
const finalConditionMet = surplusHalfSum >= deficitSum;

// Output the result to the console.
console.log(finalConditionMet ? 'Yes' : 'No');

// --- Removed Unused Function (Type III Change) ---
// The original code contained a function named `r` (or `modifyElements` in a Type II clone):
// const r = function (i, j) {
//     a[i] += 2; b[j] += 1;
// };
// This function was defined but was never invoked anywhere in the original script.
// As per Type III cloning guidelines, "some parts of the code may be deleted".
// Identifying and removing dead code like this function is a significant structural change
// that does not alter the observable behavior of the program, thus it has been removed.