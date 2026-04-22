// Module to handle and process numerical sequences based on a linear recurrence relation.

/**
 * Computes and displays a sequence of numbers following the recurrence:
 * x_k = alpha * x_{k-1} - beta, for k from 1 to 10.
 * The first term x_0 is provided as part of the input.
 *
 * @param {string} incomingDataPayload - A string containing three space-separated numbers:
 *   alpha (the multiplicative factor), beta (the constant decrement), and x_0 (the initial term).
 */
function calculateAndOutputRecurrenceSeries(incomingDataPayload) {
    // Perform initial validation on the input payload.
    // Ensure it's a non-empty string before proceeding.
    if (typeof incomingDataPayload !== 'string' || incomingDataPayload.trim() === '') {
        console.error("Error: The provided input payload is empty or not a valid string.");
        return; // Terminate execution for invalid input.
    }

    // Split the input string into its constituent parts using a robust regex
    // to handle varying amounts of whitespace between numbers.
    const componentStrings = incomingDataPayload.trim().split(/\s+/);

    // Define the expected count of numerical components.
    const expectedComponentCount = 3;
    if (componentStrings.length < expectedComponentCount) {
        console.error(`Input Error: Required ${expectedComponentCount} numerical values, but only ${componentStrings.length} were found.`);
        return;
    }

    // Parse the numerical values from the string components.
    // Using the unary plus operator as a concise alternative to Number().
    const alphaCoefficient = +componentStrings[0];    // Corresponds to 'r' in the original problem.
    const betaConstant = +componentStrings[1];       // Corresponds to 'D' in the original problem.
    let currentXValue = +componentStrings[2];        // Corresponds to the initial 'ans[0]' or x_0.

    // Validate that all parsed components are indeed valid numbers.
    if (isNaN(alphaCoefficient) || isNaN(betaConstant) || isNaN(currentXValue)) {
        console.error("Input Parsing Error: One or more input values could not be converted to valid numbers.");
        return;
    }

    // Initialize an array to store the generated sequence terms.
    // This array will hold x_1 through x_10.
    const generatedTermsCollection = [];
    const seriesLength = 10; // The total number of terms to generate after the initial x_0.

    // Iterate to generate the subsequent terms of the series.
    // The loop runs `seriesLength` times, computing one term in each iteration.
    for (let termIteration = 0; termIteration < seriesLength; termIteration++) {
        // Apply the recurrence relation: x_k = alpha * x_{k-1} - beta.
        const nextTermCalculated = (alphaCoefficient * currentXValue) - betaConstant;
        
        // Add the newly computed term to our collection.
        generatedTermsCollection.push(nextTermCalculated);

        // Update the 'currentXValue' to be used as 'x_{k-1}' in the next iteration.
        currentXValue = nextTermCalculated;
    }

    // Output the complete generated sequence.
    // Each term is placed on a new line, as per typical problem requirements.
    // The initial x_0 is not included in the output, as the generation started from x_1.
    console.log(generatedTermsCollection.join('\n'));
}

// Main execution block: Handles reading input from the standard input stream.
// This setup is typical for competitive programming environments (e.g., Node.js).
try {
    // Attempt to read all content from /dev/stdin synchronously and decode it as UTF-8.
    const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    
    // Pass the read content to our sequence calculation function.
    calculateAndOutputRecurrenceSeries(standardInputContent);
} catch (fileReadError) {
    // Catch and report any errors that occur during file reading.
    console.error("An error occurred while attempting to read from /dev/stdin:", fileReadError.message);
    // Exit the process with an error code to indicate failure.
    process.exit(1); 
}