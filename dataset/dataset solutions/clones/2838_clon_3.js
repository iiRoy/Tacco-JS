// This module handles the processing of specific problem data.
function handleProblemSolution(rawInputData) {
    // Ensure input data is a string before processing.
    if (typeof rawInputData !== 'string' || rawInputData.trim() === '') {
        console.error("Error: Provided input data is invalid or empty.");
        return; // Exit if input is bad
    }

    // Split the entire input into individual lines.
    const dataLines = rawInputData.split('\n');

    // We expect at least one line containing the primary parameters.
    if (dataLines.length === 0) {
        console.error("Error: No data lines found in the input.");
        return;
    }

    // Extract the first line which contains the main numeric parameters.
    const parameterString = dataLines[0];

    // Split the parameter string by space to get individual tokens.
    const parameterTokens = parameterString.split(' ');

    // Validate that we have at least two parameters.
    if (parameterTokens.length < 2) {
        console.error("Error: Insufficient parameters on the first line.");
        return;
    }

    // Parse the first numeric parameter, often representing a total count.
    const primaryCountValue = parseInt(parameterTokens[0], 10);
    // Parse the second numeric parameter, often representing a count to subtract or modify by.
    const secondaryCountValue = parseInt(parameterTokens[1], 10);

    // Basic validation for parsed numbers.
    if (isNaN(primaryCountValue) || isNaN(secondaryCountValue)) {
        console.error("Error: Failed to parse numeric parameters.");
        return;
    }

    let finalCalculatedResult; // Declare a variable to hold the outcome.

    // Apply the problem's specific logic.
    // If the primary count is exactly one, the result is a special value (zero).
    if (primaryCountValue === 1) {
        finalCalculatedResult = 0;
    } else {
        // Otherwise, the result is the difference between the primary and secondary counts.
        finalCalculatedResult = primaryCountValue - secondaryCountValue;
    }

    // Output the computed result to the console.
    console.log(finalCalculatedResult);
}

// --- Standard input/output boilerplate for execution in a typical competitive programming environment ---
// This section reads from standard input and passes it to the main processing function.
// It should not be modified for problem submission.
const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
handleProblemSolution(systemInput);