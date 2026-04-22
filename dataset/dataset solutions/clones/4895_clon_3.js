// This script is designed to process a multi-line string input,
// extract numerical data, and perform a specific reduction operation
// on a sequence of numbers until a single final value is obtained.
function processInputData(rawDataString) {
    // Split the entire input block into an array of individual lines.
    // Basic validation: ensure there are enough lines for N and the sequence.
    const textLines = rawDataString.split('\n');
    if (textLines.length < 2) {
        console.error("Input error: Expected at least two lines for configuration and data.");
        // In a real application, you might throw an exception or exit.
        return;
    }

    // Extract and parse the first line, which represents the base length (N).
    // This 'N' value determines the expected total number of elements in the initial sequence.
    const baseLengthIdentifier = parseInt(textLines[0], 10);

    // Validate the parsed base length to ensure it's a positive integer.
    if (Number.isNaN(baseLengthIdentifier) || baseLengthIdentifier <= 0) {
        console.error("Input error: The first line must contain a positive integer for the base length.");
        return;
    }

    // Calculate the precise number of elements expected in the initial numerical sequence,
    // based on the problem's rule: (2 * N) - 1.
    const requiredSequenceElementCount = (2 * baseLengthIdentifier) - 1;

    // Process the second line, which holds the space-separated numerical values.
    const stringifiedNumbers = textLines[1].split(' ');

    // Verify that the count of provided stringified numbers matches the calculated expectation.
    if (stringifiedNumbers.length !== requiredSequenceElementCount) {
        console.error(`Input error: Expected ${requiredSequenceElementCount} numeric values, but found ${stringifiedNumbers.length}.`);
        return;
    }

    // A utility function to convert a string to an integer,
    // returning null for invalid numeric strings to allow filtering.
    const safeParseInteger = (str) => {
        const numValue = parseInt(str.trim(), 10); // Trim whitespace before parsing
        return Number.isNaN(numValue) ? null : numValue;
    };

    // Construct the initial numerical array by parsing each string value.
    // Filter out any elements that failed to parse correctly (e.g., non-numeric strings).
    const initialNumericSequence = stringifiedNumbers
        .map(safeParseInteger)
        .filter(val => val !== null);

    // Final validation step for the initial sequence:
    // Ensure that after parsing and filtering, the array still has the correct number of elements.
    if (initialNumericSequence.length !== requiredSequenceElementCount) {
        console.error("Input error: Some provided values were non-numeric, resulting in an incorrect sequence length after parsing.");
        return;
    }

    // This function computes the next reduced sequence from a given array.
    // It applies a "median of three" rule: for every overlapping triplet,
    // the middle (median) value is selected for the new sequence.
    const generateReducedSequence = (sourceArray) => {
        const tripletWindowSize = 3; // The constant size of the window (triplet)

        // If the array is too short to form any triplets, it cannot be reduced further.
        if (sourceArray.length < tripletWindowSize) {
            return []; // Return an empty array indicating no further reduction is possible.
        }

        // Use Array.from to concisely generate the new sequence.
        // The length of the new sequence is (sourceArray.length - tripletWindowSize + 1).
        return Array.from({ length: sourceArray.length - tripletWindowSize + 1 }, (_, index) => {
            // Extract a segment (triplet) from the current array.
            const currentTriplet = sourceArray.slice(index, index + tripletWindowSize);

            // Sort the triplet numerically in ascending order to find its median.
            currentTriplet.sort((valA, valB) => valA - valB);

            // The median is the element at index 1 of the sorted triplet.
            return currentTriplet[1];
        });
    };

    // Begin the iterative reduction process.
    // Start with the fully parsed initial sequence.
    let currentWorkingSequence = initialNumericSequence;

    // Continue reducing the sequence until only one element remains.
    while (currentWorkingSequence.length > 1) {
        currentWorkingSequence = generateReducedSequence(currentWorkingSequence);
        // Optional: add a safety break for extremely long loops or unexpected conditions
        if (currentWorkingSequence.length === 0 && initialNumericSequence.length > 1) {
            console.error("Processing error: Sequence unexpectedly reduced to empty before a single element was found.");
            return;
        }
    }

    // The final result is the single element left in the sequence.
    const ultimateReducedValue = currentWorkingSequence[0];

    // Output the computed final value to standard output.
    console.log(ultimateReducedValue);
}

// The following lines are boilerplate for competitive programming environments.
// They read all input from standard input, decode it as UTF-8, and pass it to the main processing function.
// Do not modify this part.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));