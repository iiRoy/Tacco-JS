// Helper function for comparing numbers in ascending order.
// This ensures that the sort method handles numerical values correctly.
function compareNumericValues(valA, valB) {
    return valA - valB; // Standard ascending numeric comparison
}

// The main function responsible for processing the input data and
// generating the unique array configurations.
const processInputData = (inputPayload) => {

    // --- Input Validation and Parsing ---

    // Defensive check: Ensure the input is a valid string.
    if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
        console.error("Error: Provided input payload is invalid or empty.");
        return; // Abort if input is not usable.
    }

    // Split the entire input string into individual lines for easier processing.
    const inputLines = inputPayload.split('\n');

    // Ensure there are at least two lines: one for N/K and one for the sequence P.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines.");
        return;
    }

    // Parse the first line to extract the problem's configuration parameters:
    // total number of elements (N) and the segment length (K).
    const configurationParameters = inputLines[0].trim().split(' ');

    // Validate that the configuration line contains enough parts.
    if (configurationParameters.length < 2) {
        console.error("Error: Configuration line must specify both N and K.");
        return;
    }

    // Use parseInt with radix for robust numerical conversion.
    const totalElementsCount = parseInt(configurationParameters[0], 10);
    const segmentLength = parseInt(configurationParameters[1], 10);

    // Validate the parsed numeric parameters.
    if (isNaN(totalElementsCount) || isNaN(segmentLength) || totalElementsCount <= 0 || segmentLength <= 0) {
        console.error("Error: Invalid or non-positive numerical values for N or K detected.");
        return;
    }

    // Logical constraint check: segment length cannot exceed the total number of elements.
    if (segmentLength > totalElementsCount) {
        console.error("Error: The segment length (K) cannot be greater than the total element count (N).");
        return;
    }

    // Parse the second line to obtain the primary sequence of numbers (P).
    // Each string element is mapped to an integer.
    const originalNumericSequence = inputLines[1].trim().split(' ').map(strVal => parseInt(strVal, 10));

    // Validate the parsed sequence: check for NaN values and correct length.
    if (originalNumericSequence.some(isNaN) || originalNumericSequence.length !== totalElementsCount) {
        console.error("Error: The sequence of numbers (P) is malformed or its length does not match N.");
        return;
    }

    // --- Core Logic for Generating and Collecting Unique Arrangements ---

    // A Set is used to store the string representations of the modified arrays.
    // This automatically handles uniqueness, as duplicate string forms will not be added.
    const uniqueArrayConfigurations = new Set();

    // The loop iterates through all possible starting indices for the sub-segment
    // that will be sorted. The last possible start index is N - K.
    for (let currentWindowStart = 0; currentWindowStart <= (totalElementsCount - segmentLength); ++currentWindowStart) {
        // Create a temporary array to hold the current state of the sequence.
        // This is done to avoid modifying the original sequence directly in each iteration.
        const currentWorkingSequence = [...originalNumericSequence];

        // Identify the beginning of the sub-segment.
        const windowEndExclusive = currentWindowStart + segmentLength;

        // Extract the sub-segment that needs to be sorted.
        // Using slice creates a shallow copy.
        const segmentToBeSorted = currentWorkingSequence.slice(currentWindowStart, windowEndExclusive);

        // Sort the extracted segment using our custom numeric comparison function.
        segmentToBeSorted.sort(compareNumericValues);

        // Reconstruct the full sequence by inserting the sorted segment
        // back into its original position.
        // This involves taking the prefix, adding the sorted segment, and then the suffix.
        const reconstructedSequence = [
            ...currentWorkingSequence.slice(0, currentWindowStart), // Elements before the segment
            ...segmentToBeSorted,                                  // The newly sorted segment
            ...currentWorkingSequence.slice(windowEndExclusive)    // Elements after the segment
        ];

        // Convert the reconstructed array into a string representation.
        // Array.prototype.toString() typically joins elements with commas.
        const sequenceAsString = reconstructedSequence.toString();

        // Add the string representation to the Set. If it's a new unique configuration,
        // the Set will store it; otherwise, it will be ignored.
        uniqueArrayConfigurations.add(sequenceAsString);
    }

    // --- Output Result ---

    // Print the final count of distinct array configurations found.
    console.log(uniqueArrayConfigurations.size);
};

// --- Execution Entry Point ---

// This block handles reading the input from standard input and
// invoking the main processing function.
try {
    // Read the entire content of standard input as a UTF-8 string.
    const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Call the primary function with the collected input.
    processInputData(standardInputContent);
} catch (ioError) {
    // Catch and report any errors that occur during file reading.
    console.error(`Error encountered while reading from standard input: ${ioError.message}`);
    // Additional error handling logic could be placed here, e.g., exiting with a non-zero code.
}