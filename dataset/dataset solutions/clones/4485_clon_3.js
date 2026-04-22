// Function responsible for orchestrating the main data processing workflow
function processInputData(rawInputString) {
    // --- Type III: Robust input validation at the entry point ---
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === "") {
        console.error("Error: Provided input is empty, null, or not a string. Processing halted.");
        return;
    }

    const inputLines = rawInputString.trim().split("\n");

    // --- Type III: Guard clause for ensuring sufficient input lines ---
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two configuration and data lines.");
        return;
    }

    // Parse configuration parameters from the first line of input
    // --- Type II: Renamed 'mem' to 'configurationDetails', using descriptive variable names ---
    // --- Type III: Directly extract the required index, implicitly deleting the unused first element of configNumbers ---
    const configurationDetails = inputLines[0].split(" ").map(Number);
    if (configurationDetails.length < 2) {
        console.error("Error: Configuration line malformed. Expected at least two numeric parameters.");
        return;
    }
    const finalResultSelectionIndex = configurationDetails[1]; // The index (0 or 1) to pick from the final state

    // Parse the sequence of numbers from the second line of input
    // --- Type II: Renamed 'arr' to 'numericSequence', using more explicit parsing ---
    let numericSequence = inputLines[1].split(" ").map(val => {
        const parsedValue = parseInt(val.trim(), 10);
        if (isNaN(parsedValue)) {
            console.error(`Warning: Non-numeric value '${val}' found in sequence. Defaulting to 0.`);
            return 0; // Type III: Handle potential non-numeric input gracefully
        }
        return parsedValue;
    });

    // --- Type III: Introduced a dedicated helper function for binary normalization ---
    // This function ensures that any integer (positive or negative) maps consistently to 0 or 1.
    const getBinaryEquivalent = (value) => {
        // (value % 2 + 2) % 2 handles negative numbers correctly, e.g., -1 % 2 = -1, but (-1 % 2 + 2) % 2 = 1
        return (value % 2 + 2) % 2;
    };

    // Transform each number in the sequence into its binary equivalent (0 or 1)
    // --- Type II: Renamed loop variable 'i' to 'sequenceElementPosition' ---
    // --- Type III: Removed redundant block statement around the loop ---
    for (let sequenceElementPosition = 0; sequenceElementPosition < numericSequence.length; sequenceElementPosition++) {
        numericSequence[sequenceElementPosition] = getBinaryEquivalent(numericSequence[sequenceElementPosition]);
    }

    // Initialize the BigInt accumulator array that stores the two state components
    // --- Type II: Renamed 'ans' to 'currentAccumulatorState', using explicit BigInt conversion ---
    // --- Type III: Used named constants for initial values for clarity ---
    const initialComponentA = BigInt(1);
    const initialComponentB = BigInt(0);
    let currentAccumulatorState = [initialComponentA, initialComponentB];

    // --- Type III: Introduced a constant for the BigInt multiplication factor ---
    const multiplierForZeroCase = 2n;

    // Iterate through the normalized binary sequence to update the accumulator state
    // --- Type II: Renamed loop variable 'i' to 'processingIndex' ---
    for (let processingIndex = 0; processingIndex < numericSequence.length; processingIndex++) {
        const currentBinaryValue = numericSequence[processingIndex];

        if (currentBinaryValue === 0) {
            // Case 0: Both components of the state are multiplied by the defined factor
            currentAccumulatorState[0] *= multiplierForZeroCase;
            currentAccumulatorState[1] *= multiplierForZeroCase;
        } else {
            // Case 1: Both components are updated to their sum
            // --- Type II: Renamed 'tmp' to 'calculatedSum' ---
            // --- Type III: Rewrote assignment for improved readability and conciseness ---
            const calculatedSum = currentAccumulatorState[0] + currentAccumulatorState[1];
            currentAccumulatorState[0] = currentAccumulatorState[1] = calculatedSum;
        }
        // Original code had a commented-out console.log, so we continue to omit it.
    }

    // Prepare the final result for output
    // --- Type III: Added validation for the final result index before access ---
    if (finalResultSelectionIndex < 0 || finalResultSelectionIndex >= currentAccumulatorState.length) {
        console.error(`Error: Invalid final result selection index (${finalResultSelectionIndex}). Must be 0 or 1.`);
        return;
    }

    const selectedFinalValue = currentAccumulatorState[finalResultSelectionIndex];
    console.log(selectedFinalValue.toString());
}

// Main execution block: Reads input from standard input and passes it to the processing function
// --- Type II: Updated function call name ---
// --- Type III: Encapsulated file read operation in a try-catch block for error handling ---
try {
    // Attempt to read the entire content from standard input synchronously
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    processInputData(fileContents); // Invoke the main processing function
} catch (readError) {
    // Log any errors encountered during file reading
    console.error("Fatal Error: Could not read input from /dev/stdin. Details:", readError.message);
}