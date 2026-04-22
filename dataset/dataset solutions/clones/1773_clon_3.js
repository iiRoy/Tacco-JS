// This module processes a specific input format to find an integer
// that is closest to a given target value, but not present in a list
// of prohibited numbers. It prioritizes values below the target for
// a given offset magnitude, then values above.
function processInputData(rawInputString) {
    // Perform initial validation on the input type.
    if (typeof rawInputString !== 'string') {
        console.error("Input data type error: Expected a string for processing.");
        return; // Exit if input is not a string.
    }

    // Clean and segment the input into individual lines.
    const parsedLines = rawInputString.trim().split('\n');

    // Define a constant for the minimum number of input lines expected.
    const MINIMUM_EXPECTED_LINES = 2;
    // Ensure we have sufficient lines of data for processing.
    if (parsedLines.length < MINIMUM_EXPECTED_LINES) {
        console.error("Input format error: Not enough data lines provided. Expected at least two.");
        return;
    }

    // Deconstruct the first line, which contains the base reference value
    // and a count that indicates the number of forbidden items.
    const initialConfiguration = parsedLines[0].split(' ');
    // Validate the structure of the first line.
    if (initialConfiguration.length < MINIMUM_EXPECTED_LINES) {
        console.error("Input parsing error: First line requires at least two space-separated values (target and count).");
        return;
    }

    // Extract and convert the base reference value (original 'x').
    const baseReferenceValue = Number(initialConfiguration[0]);
    // Extract and convert the reported forbidden count (original 'n').
    const reportedForbiddenCount = Number(initialConfiguration[1]);

    // Handle the edge case where no numbers are explicitly forbidden.
    // In this scenario, the base reference value itself is the answer.
    if (reportedForbiddenCount === 0) {
        console.log(baseReferenceValue);
        return; // Terminate execution after printing the result.
    }

    // Construct a set of prohibited numbers for efficient lookup.
    // Numbers from the input are treated as strings as per original logic's `includes` behavior.
    const forbiddenValuesList = parsedLines[1].split(' ');
    const disallowedSet = new Set(forbiddenValuesList);

    // Define a utility function to check if a numeric value is in the disallowed set.
    // It converts the number back to a string for comparison with set elements.
    const isValueDisallowed = (numericVal) => disallowedSet.has(String(numericVal));

    // Establish the maximum search range outward from the base reference value.
    // This constant defines how far we will deviate from the base value.
    const MAX_DEVIATION_LIMIT = 100; // Search up to 100 units away in either direction.

    // Commence the search for the nearest non-prohibited integer.
    // The search expands symmetrically around the base reference value,
    // prioritizing values below for a given deviation magnitude.
    for (let currentDeviation = 1; currentDeviation <= MAX_DEVIATION_LIMIT; ++currentDeviation) {
        // Calculate the candidate value that is less than the base reference.
        const candidateBelow = baseReferenceValue - currentDeviation; // Equivalent to (x - i)
        // Calculate the candidate value that is greater than the base reference.
        const candidateAbove = baseReferenceValue + currentDeviation; // Equivalent to (x + i)

        // First, check the candidate value below the base reference.
        if (!isValueDisallowed(candidateBelow)) {
            console.log(candidateBelow);
            return; // Found a suitable value, exit the function.
        } 
        // If the lower candidate is disallowed, then check the higher candidate.
        else if (!isValueDisallowed(candidateAbove)) {
            console.log(candidateAbove);
            return; // Found a suitable value, exit the function.
        }
    }

    // If the loop completes without finding a suitable number, it means
    // no non-prohibited number was found within the defined search range.
    // This indicates an unexpected scenario given typical problem constraints.
    console.log('Algorithm exhausted search range; no suitable non-prohibited number found.');
    // In a more robust system, an exception might be thrown here.
}

// This block simulates the execution environment, typically reading input
// from standard input, similar to how competitive programming platforms operate.
// It includes basic error handling for file operations and function execution.
try {
    // Attempt to read the content of the standard input file.
    const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Process the content using the main function.
    processInputData(systemInputContent);
} catch (ioOrProcessingError) {
    // Log any errors encountered during file reading or the data processing.
    console.error("Execution failed due to an I/O or processing error:", ioOrProcessingError.message);
}