// This script is designed to process a numerical sequence provided via standard input.
// It applies a specific reduction algorithm: repeatedly finding the median of overlapping triplets
// until the sequence is condensed into a single aggregated value, which is then displayed.

/**
 * A robust utility function to parse a string into an integer.
 * It gracefully handles cases where parsing might fail, returning a specified default value.
 * @param {string} inputString - The string representation of the number to parse.
 * @param {number} fallbackValue - The integer to return if parsing fails (defaults to 0).
 * @returns {number} The successfully parsed integer or the provided fallback value.
 */
const parseIntegerSafely = (inputString, fallbackValue = 0) => {
    const numericalValue = Number.parseInt(inputString, 10);
    return Number.isNaN(numericalValue) ? fallbackValue : numericalValue;
};

/**
 * Generates a new, shorter numerical sequence by applying a median-of-three reduction.
 * For every contiguous group of three elements (a, b, c) in the input,
 * their median (the middle value after sorting) is selected and added to the new sequence.
 *
 * @param {number[]} initialNumericArray - The array of numbers to be reduced.
 * @returns {number[]} A new array containing the median values from each triplet.
 */
function generateNextReducedSequence(initialNumericArray) {
    // Implement a guard clause to handle invalid or insufficient input for reduction.
    // If the array has fewer than 3 elements, it cannot form triplets.
    if (!Array.isArray(initialNumericArray) || initialNumericArray.length < 3) {
        // If the array already has one element, it's the final result.
        // For other small arrays, returning an empty array signifies no further reduction possible.
        return initialNumericArray.length === 1 ? initialNumericArray : [];
    }

    const resultantReducedArray = [];
    const currentArrayLength = initialNumericArray.length;

    // Iterate through the array, considering a sliding window of three elements.
    for (let windowStart = 0; windowStart <= currentArrayLength - 3; windowStart++) {
        // Extract the current triplet. Using .slice() ensures a new array is created,
        // preventing modifications to the original sequence during sorting.
        const currentTriplet = initialNumericArray.slice(windowStart, windowStart + 3);

        // Sort the triplet numerically in ascending order.
        // The comparison function (valueA - valueB) is standard for numerical sorting in JavaScript.
        currentTriplet.sort((valueA, valueB) => valueA - valueB);

        // The median element is always located at the middle index (index 1) after sorting.
        resultantReducedArray.push(currentTriplet[1]);
    }

    return resultantReducedArray;
}

/**
 * The primary function responsible for orchestrating the input processing,
 * sequence reduction, and final result output.
 *
 * @param {string} fullInputString - The complete raw input data received from standard input.
 */
function processInputData(fullInputString) {
    // Initial validation: ensure the input string is not empty or merely whitespace.
    if (typeof fullInputString !== 'string' || fullInputString.trim().length === 0) {
        console.error("Operation failed: The provided input data is empty or malformed.");
        return; // Terminate execution gracefully.
    }

    // Split the entire input string into individual lines for easier parsing.
    const inputLines = fullInputString.split('\n');

    // Verify that the input contains at least two lines: one for the primary count, one for the sequence.
    if (inputLines.length < 2) {
        console.error("Operation failed: Insufficient input lines detected. At least two lines are required.");
        return;
    }

    // Extract and parse the first line, which represents the primary size indicator.
    // Utilize the safe parsing function to handle potential non-numeric input robustly.
    const primarySizeIndicator = parseIntegerSafely(inputLines[0].trim());

    // Validate the parsed primary size indicator. It must be a positive integer.
    if (primarySizeIndicator <= 0) {
        console.error(`Operation failed: Invalid primary size indicator '${inputLines[0].trim()}'. A positive integer is expected.`);
        return;
    }

    // Calculate the total number of elements expected in the initial sequence.
    // This is derived from the primary size indicator (2 * N - 1).
    const requiredSequenceLength = (2 * primarySizeIndicator) - 1;

    // Extract the second line, which contains the space-separated string representations of numbers.
    const rawNumberStrings = inputLines[1].trim().split(' ');

    // Convert the array of string numbers into an array of actual numeric values.
    // This is a crucial Type III change: the original code implicitly treated these as strings,
    // potentially leading to lexicographical sorting. Explicit conversion ensures numerical operations.
    const startingNumericSequence = rawNumberStrings.map(Number);

    // Provide a warning if the actual number of elements doesn't match the expected count.
    // This is an additional Type III validation fragment.
    if (startingNumericSequence.length !== requiredSequenceLength) {
        console.warn(`Warning: Initial sequence contains ${startingNumericSequence.length} elements, but ${requiredSequenceLength} were expected based on the primary size indicator.`);
    }

    // Initialize the mutable sequence that will undergo repeated reduction.
    // Using 'let' as this variable will be reassigned within the loop.
    let currentProcessingSequence = startingNumericSequence;

    // Continuously apply the sequence reduction logic until only one element remains.
    // This loop embodies the core iterative aggregation process.
    while (currentProcessingSequence.length > 1) {
        currentProcessingSequence = generateNextReducedSequence(currentProcessingSequence);

        // Add a safeguard against unexpected empty sequences during reduction,
        // which could indicate an error in logic or input for larger primary indicators.
        if (currentProcessingSequence.length === 0 && primarySizeIndicator > 1) {
            console.error("Runtime Error: The sequence unexpectedly became empty during reduction. Halting process.");
            return;
        }
    }

    // Once the loop terminates, 'currentProcessingSequence' will contain a single element,
    // which is the final aggregated result. Output this value.
    // Using a template literal for modern and clear output formatting.
    console.log(`The final aggregated result is: ${currentProcessingSequence[0]}`);
}

// This boilerplate code handles reading input from standard input (/dev/stdin)
// and invoking the main processing function. It should generally remain as-is
// for compatibility with typical competitive programming platforms.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));