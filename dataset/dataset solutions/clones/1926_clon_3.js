function processInputData(rawDataString) {
    // Ensure input data is provided before processing
    if (!rawDataString || typeof rawDataString !== 'string') {
        console.error("Error: Invalid or empty input string provided.");
        return;
    }

    // Process the raw text into structured numerical parameters
    const processedParameters = parseDataString(rawDataString);

    // If parsing failed, halt execution
    if (!processedParameters) {
        console.error("Error: Failed to parse input parameters.");
        return;
    }

    // Calculate the maximum fractional component based on the parsed parameters
    const finalCalculatedResult = calculateMaximumFractionalTerm(
        processedParameters.valA,
        processedParameters.valB,
        processedParameters.valN
    );

    // Display the computed result
    console.log(finalCalculatedResult);
}

function parseDataString(inputTextData) {
    // Splits the input string by spaces to get individual number tokens
    const dataTokens = inputTextData.split(' ');

    // Validate that exactly three numeric tokens are present
    if (dataTokens.length !== 3) {
        console.error(`Parsing Error: Expected 3 numeric values, but received ${dataTokens.length}.`);
        return null; // Return null to indicate parsing failure
    }

    // Attempt to parse each token into an integer
    const firstVal = parseInt(dataTokens[0], 10);
    const secondVal = parseInt(dataTokens[1], 10);
    const thirdVal = parseInt(dataTokens[2], 10);

    // Validate that all parsed values are indeed numbers
    if (isNaN(firstVal) || isNaN(secondVal) || isNaN(thirdVal)) {
        console.error("Parsing Error: One or more input values are not valid numbers.");
        return null; // Return null on invalid number detection
    }

    // Return an object containing the parsed integer values
    return {
        valA: firstVal,
        valB: secondVal,
        valN: thirdVal,
    };
}

/**
 * Computes the maximum value of the expression floor(firstFactor * iterationCounter / divisorTerm) - firstFactor * floor(iterationCounter / divisorTerm)
 * for iterationCounter from 1 up to a dynamically determined upper limit.
 * This expression essentially captures a scaled fractional part.
 *
 * @param {number} firstFactor The 'a' parameter from the original problem.
 * @param {number} divisorTerm The 'b' parameter from the original problem.
 * @param {number} upperLimitForX The 'n' parameter from the original problem, defining the overall constraint for x.
 * @returns {number} The maximum value found for the expression.
 */
function calculateMaximumFractionalTerm(firstFactor, divisorTerm, upperLimitForX) {
    // Initialize the variable to store the highest value encountered
    let currentOptimalResult = 0;

    // Basic validation to prevent division by zero or negative divisor which might lead to unexpected behavior
    if (divisorTerm <= 0) {
        console.warn("Warning: Divisor term must be positive. Returning 0.");
        return 0;
    }

    // Determine the upper bound for our loop.
    // This logic replicates the original problem's specific constraint:
    // if 'n' is less than 'b', iterate up to 'n'. Otherwise, iterate up to 'floor(n/b)'.
    // The original loop condition was `x <= N + 1`, meaning it iterates up to N (inclusive) plus one additional step.
    let loopIterationCap;
    if (upperLimitForX < divisorTerm) {
        loopIterationCap = upperLimitForX;
    } else {
        loopIterationCap = Math.floor(upperLimitForX / divisorTerm);
    }

    // Iterate through possible values of 'x' (renamed to iterationCounter)
    // The loop runs from 1 up to (loopIterationCap + 1) inclusive, mirroring the original `x <= N + 1`
    for (let iterationCounter = 1; iterationCounter <= loopIterationCap + 1; ++iterationCounter) {
        // Calculate the first part of the expression: floor(firstFactor * iterationCounter / divisorTerm)
        const termOne = Math.floor((firstFactor * iterationCounter) / divisorTerm);

        // Calculate the second part of the expression: firstFactor * floor(iterationCounter / divisorTerm)
        const termTwo = firstFactor * Math.floor(iterationCounter / divisorTerm);

        // Compute the value of the current expression
        const computedTermValue = termOne - termTwo;

        // Update the maximum result if the current value is higher
        currentOptimalResult = Math.max(currentOptimalResult, computedTermValue);
    }

    // Return the highest value found
    return currentOptimalResult;
}

// --- Main execution block for competitive programming environment ---

// Define the standard input file path
const stdinFilePath = '/dev/stdin';

try {
    // Read the content of the standard input file synchronously
    const systemInputContent = require('fs').readFileSync(stdinFilePath, 'utf8');

    // Call the primary processing function with the obtained input
    processInputData(systemInputContent);
} catch (error) {
    // Handle potential errors during file reading or processing
    console.error(`An error occurred during input processing: ${error.message}`);
}