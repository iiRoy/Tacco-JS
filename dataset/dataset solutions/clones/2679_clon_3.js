function calculateOddDigitLengthCount(rawInputData) {
    // Validate the presence and type of the input data.
    if (!rawInputData || typeof rawInputData !== 'string') {
        console.error("Processing Error: Input data is either missing or not a string type.");
        return 0; // Default return for invalid input
    }

    // Normalize and split the raw input string into potential numerical components.
    // Using a regex to handle multiple spaces and trim automatically.
    const inputComponents = rawInputData.trim().split(/\s+/);

    // Verify that the input provided at least one segment to parse.
    if (inputComponents.length === 0) {
        console.error("Processing Error: No numerical value could be extracted from the input string.");
        return 0;
    }

    // Attempt to convert the first identified component into an integer representing the upper limit.
    // Using Number() for conversion and then explicitly checking for integer and positivity.
    let upperBoundary = Number(inputComponents[0]);

    // Perform stringent validation on the parsed upper boundary value.
    // It must be a valid number, an integer, and a positive value.
    if (isNaN(upperBoundary) || !Number.isInteger(upperBoundary) || upperBoundary < 1) {
        console.error(`Processing Error: The identified upper boundary '${inputComponents[0]}' is invalid. Expected a positive integer.`);
        return 0;
    }

    // Initialize a counter to accumulate the total count of numbers
    // whose digit count is odd within the specified range.
    let oddDigitCountAccumulator = 0;

    // Begin an iterative process from the first positive integer up to the determined upper boundary.
    // The loop iterates inclusively.
    for (let currentSequenceNumber = 1; currentSequenceNumber <= upperBoundary; ++currentSequenceNumber) {
        // Convert the current number in the sequence to its string representation.
        const textualRepresentation = currentSequenceNumber.toString();
        // Obtain the total number of digits (length of its string form).
        const digitCount = textualRepresentation.length;

        // Check if the obtained digit count is an odd number.
        // A bitwise AND operation with 1 is an efficient way to check for oddness.
        if ((digitCount & 1) !== 0) { // Equivalent to digitCount % 2 === 1
            // If the digit count is odd, increment our accumulator.
            oddDigitCountAccumulator = oddDigitCountAccumulator + 1;
        }
    }

    // Output the final computed count to the standard output stream.
    console.log(oddDigitCountAccumulator);
}

// A utility function to encapsulate the logic for reading input from stdin.
function fetchStandardInput() {
    try {
        // Utilize the Node.js 'fs' module to perform a synchronous read operation
        // from the standard input file descriptor.
        // The 'utf8' encoding ensures the data is returned as a readable string.
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (ioError) {
        // If an error occurs during the file reading process, log it.
        console.error("Input/Output Error: Could not retrieve data from /dev/stdin.", ioError.message);
        // In case of an error, return an empty string to prevent further processing issues.
        return "";
    }
}

// Entry point for the program execution.
// First, retrieve the necessary input data.
const programExecutionInput = fetchStandardInput();
// Then, invoke the primary processing function with the obtained input.
calculateOddDigitLengthCount(programExecutionInput);