// This script processes a series of operations on a dynamically generated numeric sequence.
// It reads initial parameters, constructs an arithmetic progression,
// then applies modifications (swaps or assignments) based on subsequent commands,
// finally outputting a specific element from the modified sequence.

const fileSystem = require('node:fs'); // Using node:fs for clarity and modern practice

/**
 * Safely parses a string into an integer. Includes basic validation.
 * @param {string} lineData - The string to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails (a default handling for errors).
 */
const parseNumericValue = (lineData) => {
    // Ensure robust parsing by specifying radix
    const parsed = parseInt(lineData, 10);
    // Basic validation: NaN check
    if (isNaN(parsed)) {
        console.error("Error: Could not parse numeric value from line:", lineData);
        // In a real application, might throw an error or use a more sophisticated default.
        // For this context, returning 0 or a sentinel value is typical.
        return 0;
    }
    return parsed;
};

// Read all input from stdin, decode as UTF-8, trim leading/trailing whitespace, and split into individual lines.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split('\n');

// --- Phase 1: Sequence Initialization ---

// The first line indicates the desired length of the initial sequence.
const initialSequenceLength = parseNumericValue(inputLines.shift());

// Guard clause for non-positive sequence length to prevent errors or unexpected behavior.
if (initialSequenceLength < 0) {
    console.error("Error: Initial sequence length cannot be negative. Setting to 0.");
    // Adjusting to 0 to allow the script to proceed without crashing, but with an empty sequence.
    initialSequenceLength = 0;
} else if (initialSequenceLength === 0) {
    console.warn("Warning: Initial sequence length is zero. The sequence will be empty.");
}

// The second line provides the starting term (alpha) and common difference (delta) for the arithmetic progression.
const [alphaTerm, deltaStep] = inputLines.shift().split(' ').map(Number);

// Initialize the primary data structure with an arithmetic progression.
// Using Array.from for a more declarative and functional approach compared to a traditional for loop.
const dynamicSequence = Array.from({ length: initialSequenceLength }, (_, indexCounter) => {
    return alphaTerm + indexCounter * deltaStep;
});

// --- Phase 2: Process Operations ---

// The next line specifies the total number of modification operations to perform.
const numberOfModifications = parseNumericValue(inputLines.shift());

/**
 * Performs a swap operation on two elements within the sequence.
 * Includes boundary checks for safer array access.
 * @param {number[]} sequence - The array to modify.
 * @param {number} idxA - The 0-based index of the first element.
 * @param {number} idxB - The 0-based index of the second element.
 */
const executeSwap = (sequence, idxA, idxB) => {
    // Basic bounds checking to prevent errors from invalid indices.
    if (idxA < 0 || idxA >= sequence.length || idxB < 0 || idxB >= sequence.length) {
        console.warn(`Attempted swap with out-of-bounds indices: [${idxA}, ${idxB}]. Sequence length: ${sequence.length}. Operation skipped.`);
        return; // Skip invalid operation
    }
    // Using a temporary variable for swapping, an alternative to array destructuring.
    const temporaryValue = sequence[idxA];
    sequence[idxA] = sequence[idxB];
    sequence[idxB] = temporaryValue;
};

/**
 * Performs an assignment operation: sequence[idxA] = sequence[idxB].
 * Includes boundary checks for safer array access.
 * @param {number[]} sequence - The array to modify.
 * @param {number} idxA - The 0-based index of the target element.
 * @param {number} idxB - The 0-based index of the source element.
 */
const executeAssignment = (sequence, idxA, idxB) => {
    // Basic bounds checking to prevent errors from invalid indices.
    if (idxA < 0 || idxA >= sequence.length || idxB < 0 || idxB >= sequence.length) {
        console.warn(`Attempted assignment with out-of-bounds indices: [${idxA}, ${idxB}]. Sequence length: ${sequence.length}. Operation skipped.`);
        return; // Skip invalid operation
    }
    sequence[idxA] = sequence[idxB];
};

// Iterate through each modification command.
for (let opCounter = 0; opCounter < numberOfModifications; opCounter++) {
    // Each operation line contains three space-separated numbers:
    // commandType (0 for swap, anything else for assignment), firstOperandIndex, secondOperandIndex.
    const [commandType, firstOperandIndex, secondOperandIndex] = inputLines.shift().split(' ').map(Number);

    // Adjusting from 1-based indexing in input to 0-based indexing for array access.
    const actualIndex1 = firstOperandIndex - 1;
    const actualIndex2 = secondOperandIndex - 1;

    // Using a switch statement for clearer distinction of operation types,
    // enhancing readability over an if/else if chain.
    switch (commandType) {
        case 0: // Command type 0: Swap elements
            executeSwap(dynamicSequence, actualIndex1, actualIndex2);
            break;
        default: // Any other command type: Assign value from second index to first index
            executeAssignment(dynamicSequence, actualIndex1, actualIndex2);
            break;
    }
}

// --- Phase 3: Final Output ---

// The last line indicates the 1-based index of the element to be printed.
const finalRequestedElementIndex = parseNumericValue(inputLines.shift());

// Adjust to 0-based indexing for array access.
const zeroBasedOutputIndex = finalRequestedElementIndex - 1;

// Add a guard clause for out-of-bounds access for the final output.
if (zeroBasedOutputIndex < 0 || zeroBasedOutputIndex >= dynamicSequence.length) {
    console.error(`Error: Requested output index (${finalRequestedElementIndex}) is out of bounds for sequence of length ${dynamicSequence.length}.`);
    // Output a specific error string to indicate the failure, rather than undefined or crashing.
    console.log("INDEX_OUT_OF_BOUNDS_ERROR");
} else {
    // Print the value of the element at the specified index.
    // Using a template literal for potentially more descriptive output if needed,
    // though here it's just for consistency and style.
    console.log(`${dynamicSequence[zeroBasedOutputIndex]}`);
}

// End of script execution.