// Main processing function for numerical sequence generation
function processInputData(rawDataString) {
    // Validate input string presence and type.
    if (!rawDataString || typeof rawDataString !== 'string') {
        console.error("Error: Input data is missing or not a string.");
        return; // Terminate execution if input is invalid.
    }

    // Prepare the input string: trim whitespace and split into tokens.
    // Using a regex for splitting handles multiple spaces and leading/trailing spaces robustly.
    const tokenizedValues = rawDataString.trim().split(/\s+/);

    // Ensure that exactly two numerical tokens were provided.
    if (tokenizedValues.length !== 2) {
        console.error(`Error: Expected two numerical inputs, but received ${tokenizedValues.length}.`);
        return;
    }

    // Parse the string tokens into integer values using base 10.
    const firstNumericalOperand = Number.parseInt(tokenizedValues[0], 10);
    const secondNumericalOperand = Number.parseInt(tokenizedValues[1], 10);

    // Perform basic validation to check if parsing resulted in valid numbers.
    if (isNaN(firstNumericalOperand) || isNaN(secondNumericalOperand)) {
        console.error("Error: One or both input values are not valid integers.");
        return;
    }

    let finalSequenceOutput = ''; // Initialize an empty string to accumulate the result.

    // Determine which number is smaller and which dictates the repetition count.
    if (firstNumericalOperand < secondNumericalOperand) {
        // If the first operand is strictly smaller, it will be the character to repeat.
        const characterRepresentation = String(firstNumericalOperand); // Convert the number to its string form.
        const numberOfRepetitions = secondNumericalOperand; // The larger number determines repetition count.

        // Leverage the modern String.prototype.repeat() method for concise repetition.
        finalSequenceOutput = characterRepresentation.repeat(numberOfRepetitions);

    } else {
        // If the second operand is smaller or equal, it will be the character to repeat.
        const characterRepresentation = String(secondNumericalOperand); // Convert the number to its string form.
        const numberOfRepetitions = firstNumericalOperand; // The larger or equal number determines repetition count.

        let currentIterationCount = 0; // Initialize a counter for manual looping.
        // Use a traditional while loop to demonstrate an alternative repetition mechanism.
        while (currentIterationCount < numberOfRepetitions) {
            finalSequenceOutput += characterRepresentation; // Append the character to the accumulator.
            currentIterationCount++; // Increment the loop counter.
        }
    }

    // Display the final generated sequence to the standard output.
    console.log(finalSequenceOutput);
}

// --- Application Entry Point and Input Handling ---
// This immediate invoked function expression (IIFE) handles the environment-specific input reading.
(function executeProcessingPipeline() {
    // Check for the presence of Node.js-specific modules (like 'require' and 'fs').
    if (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports) {
        try {
            // Dynamically import the 'fs' (file system) module for reading from stdin.
            const fileSystemUtilities = require("fs");
            // Read all data from standard input, interpreting it as UTF-8 text.
            const inputDataFromStandardInput = fileSystemUtilities.readFileSync("/dev/stdin", "utf8");
            // Pass the retrieved data to the main processing function.
            processInputData(inputDataFromStandardInput);
        } catch (ioError) {
            // Log any errors encountered during file system operations.
            console.error("Fatal Error: Could not read from /dev/stdin. Details:", ioError.message);
            // In a production scenario, you might want to exit the process here.
        }
    } else {
        // Provide a warning or alternative input mechanism for non-Node.js environments.
        console.warn("Warning: This script is designed for Node.js environments reading from stdin. No input processed.");
        // Example of how to call it manually for testing in a browser or different setup:
        // processInputData("7 3");
    }
})();