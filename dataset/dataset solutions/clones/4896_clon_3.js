const processInputData = (rawDataString) => {
    // Ensure the input is a valid string before proceeding
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        throw new Error("Input data is empty or not a valid string.");
    }

    // Split the raw input content into an array of lines, trimming leading/trailing whitespace
    const inputLines = rawDataString.trim().split("\n");

    // Verify that we have at least two lines: one for N and one for the sequence
    if (inputLines.length < 2) {
        throw new Error("Insufficient input. Expected at least two lines for N and the data sequence.");
    }

    // Parse the integer value N from the first line
    const sequenceLength = Number(inputLines[0]);

    // Validate N to be a positive integer
    if (!Number.isInteger(sequenceLength) || sequenceLength <= 0) {
        throw new Error(`Invalid sequence length parameter 'N': ${inputLines[0]}. Must be a positive integer.`);
    }

    // Calculate the total number of elements expected in the initial sequence
    const expectedInitialElementCount = (2 * sequenceLength) - 1;

    // Parse the initial sequence of numbers from the second line
    // Each string element is converted to a number using the Number constructor
    const initialNumericSequence = inputLines[1].split(" ").map(Number);

    // Validate that the parsed sequence has the expected number of elements
    if (initialNumericSequence.length !== expectedInitialElementCount) {
        throw new Error(`Mismatched sequence size. Expected ${expectedInitialElementCount} elements, but received ${initialNumericSequence.length}.`);
    }

    /**
     * This internal utility function generates a new, reduced sequence
     * by applying a median-of-three rule to sliding windows.
     * @param {number[]} sourceSequence The array of numbers to be processed.
     * @returns {number[]} A new array, which is a reduced version of the sourceSequence.
     */
    const generateNextReducedSequence = (sourceSequence) => {
        // Define the size of the sliding window for median calculation
        const windowSize = 3;

        // If the source sequence is too short to form a window, an empty array is returned.
        // This acts as a protective measure against invalid states, though the main loop
        // should prevent calls with length < 2.
        if (sourceSequence.length < windowSize) {
            return [];
        }

        // Calculate the length of the resulting reduced sequence
        const nextSequenceElementCount = sourceSequence.length - (windowSize - 1); // equivalent to length - 2

        // Initialize an array to store the medians
        const reducedSequenceResult = Array.from({ length: nextSequenceElementCount });

        // Iterate through the source sequence to create sliding windows
        for (let windowStartIndex = 0; windowStartIndex < nextSequenceElementCount; windowStartIndex++) {
            // Extract the current 3-element window using slice
            const currentThreeElementWindow = sourceSequence.slice(windowStartIndex, windowStartIndex + windowSize);

            // Sort the window numerically to find the median
            // The default sort behavior for numbers is typically `a - b` for ascending order
            currentThreeElementWindow.sort((valueA, valueB) => valueA - valueB);

            // The median of three elements is always the element at index 1 after sorting
            reducedSequenceResult[windowStartIndex] = currentThreeElementWindow[1];
        }

        return reducedSequenceResult;
    };

    // Initialize the working sequence with the parsed input data
    let currentWorkingSequence = initialNumericSequence;

    // Continue reducing the sequence until only a single element remains
    // This loop is the core algorithm for the problem
    while (currentWorkingSequence.length > 1) {
        currentWorkingSequence = generateNextReducedSequence(currentWorkingSequence);
    }

    // After the loop, there should be exactly one element left in the sequence
    if (currentWorkingSequence.length !== 1) {
        // This indicates an unexpected state or logical error in the reduction process
        throw new Error("Final sequence does not contain exactly one element. Algorithm error.");
    }

    // Return the final single element
    return currentWorkingSequence[0];
};

// --- Execution Entry Point ---
// This block handles reading from standard input and executing the main logic.
try {
    // Read all input from standard input (e.g., /dev/stdin in Unix-like systems)
    // The 'utf8' encoding ensures correct character interpretation
    const stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Call the primary function to process the input and get the final result
    const computedFinalValue = processInputData(stdInputContent);

    // Output the computed result to standard output
    console.log(computedFinalValue);
} catch (executionError) {
    // Catch and log any errors that occur during file reading or processing
    console.error("An execution error occurred:", executionError.message);
    // Exit the process with a non-zero status code to indicate failure
    process.exit(1);
}