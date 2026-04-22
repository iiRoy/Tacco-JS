// This module encapsulates the logic for determining active elements in a numerical sequence.
// It processes raw input data based on a specific algorithm involving initial states and their multiples.

/**
 * A utility function to parse the raw problem input string into structured parameters.
 * It handles extracting the sequence size and the array of initial states from the provided text.
 *
 * @param {string} problemDescription - The complete raw input string, typically from standard input.
 * @returns {{sequenceSize: number, baseStates: number[]}} An object containing the parsed sequence size and initial states.
 * @throws {Error} If the input data is malformed or insufficient.
 */
const extractProblemParameters = (problemDescription) => {
    // Trim whitespace and split the input into individual lines for processing.
    const dataSegments = problemDescription.trim().split('\n');

    // Validate that at least two lines of data are present (for size and states).
    if (dataSegments.length < 2) {
        throw new Error("Input data is incomplete. Expected at least two lines for sequence definition.");
    }

    // Parse the total number of elements in the sequence from the first line.
    const totalElementCount = Number.parseInt(dataSegments[0], 10);
    // Perform basic validation on the parsed sequence size.
    if (Number.isNaN(totalElementCount) || totalElementCount < 0) {
        throw new Error(`Invalid sequence length: "${dataSegments[0]}". Must be a non-negative integer.`);
    }

    // Parse the initial state values from the second line.
    // Each string element is converted to a number.
    const initialConfigurationValues = dataSegments[1].split(' ').map(Number);
    // A warning is issued if the number of provided states doesn't match the declared sequence size,
    // which could indicate a data mismatch, unless the sequence size is zero.
    if (totalElementCount > 0 && initialConfigurationValues.length !== totalElementCount) {
        console.warn(`Data Mismatch: Declared sequence length is ${totalElementCount}, but ${initialConfigurationValues.length} initial states were found.`);
    }

    return {
        sequenceSize: totalElementCount,
        baseStates: initialConfigurationValues
    };
};

/**
 * The primary function responsible for executing the sequence processing algorithm.
 * It reads raw input, calculates final states based on a reverse-propagation rule,
 * and outputs the count and list of "active" (state 1) indices.
 *
 * @param {string} rawInputContent - The full string content read from the input source (e.g., stdin).
 */
const executeSequenceAnalysis = (rawInputContent) => {
    const BINARY_STATE_MODULO = 2; // A constant representing the modulo operation for binary states.

    let parsedConfiguration;
    try {
        parsedConfiguration = extractProblemParameters(rawInputContent);
    } catch (dataParsingError) {
        // If input parsing fails, log the error and terminate execution gracefully.
        console.error(`An error occurred during input parsing: ${dataParsingError.message}`);
        return;
    }

    const { sequenceSize, baseStates } = parsedConfiguration;

    // Handle edge case: if the sequence has no elements or a negative count, output zero active positions and exit.
    if (sequenceSize <= 0) {
        console.log(0);
        return;
    }

    // Initialize an array to store the computed binary states for each position.
    // All elements are initially set to 0. This array is 0-indexed.
    const computedFinalStates = new Array(sequenceSize).fill(0);

    // An array to accumulate the 1-based indices that ultimately result in an 'active' state (1).
    const identifiedActiveIndices = [];

    // The algorithm iterates backwards from the largest possible 1-based index down to 1.
    // This reverse order is critical because the state of an element `k` depends on the states
    // of its multiples (e.g., `2k`, `3k`, ...), which are at higher indices and thus must be
    // computed *before* `k` itself.
    let currentPositionOneBased = sequenceSize; // Represents the 1-based index we are currently processing.
    while (currentPositionOneBased > 0) {
        // Derive the 0-based index for array access.
        const currentPositionZeroBased = currentPositionOneBased - 1;

        let aggregatedMultipleEffect = 0; // This variable will sum the states of multiples.

        // Inner loop: Iterate through multiples of the `currentPositionOneBased`.
        // We start with the second multiple (factor of 2).
        let currentMultiplier = 2;
        while (true) {
            // Calculate the 0-based index for the current multiple.
            const multipleZeroBasedIndex = currentPositionOneBased * currentMultiplier;

            // If the multiple's index falls outside the sequence bounds, we've processed all relevant multiples.
            if (multipleZeroBasedIndex >= sequenceSize) {
                break;
            }

            // Add the already-computed state of this multiple to the aggregate.
            aggregatedMultipleEffect += computedFinalStates[multipleZeroBasedIndex];
            currentMultiplier++; // Move to the next multiple (e.g., 3x, 4x, etc.).
        }

        // Retrieve the initial value for the current element from the `baseStates` array.
        // We assume `baseStates` contains valid numbers due to prior parsing.
        const initialElementState = baseStates[currentPositionZeroBased];

        // Calculate the final binary state for the current element.
        // This is the sum of its initial state and the aggregated effect from its multiples,
        // all taken modulo 2. The bitwise AND `& 1` is an efficient way to achieve modulo 2.
        const finalElementState = (aggregatedMultipleEffect + initialElementState) & 1;

        // Store the newly computed state in our results array.
        computedFinalStates[currentPositionZeroBased] = finalElementState;

        // If the calculated final state for this element is '1' (active),
        // add its 1-based index to our list of active positions.
        if (finalElementState === 1) {
            identifiedActiveIndices.push(currentPositionOneBased);
        }

        currentPositionOneBased--; // Move to the next element (decrementing the 1-based index).
    }

    // Output the total count of elements found to be in an active state.
    console.log(identifiedActiveIndices.length);

    // If there is at least one active index, print them joined by spaces.
    // An empty `join(' ')` on an empty array produces an empty string, which is generally acceptable,
    // but the explicit check ensures no unnecessary output if the list is empty.
    if (identifiedActiveIndices.length > 0) {
        console.log(identifiedActiveIndices.join(' '));
    }
};

// ******************************************************************************
// The following lines handle standard input/output and invoke the primary processing function.
// This section is typically boilerplate for competitive programming environments.
// Please refrain from modifying this part when submitting your solution,
// as it ensures correct interaction with the execution environment.
// ******************************************************************************
executeSequenceAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));