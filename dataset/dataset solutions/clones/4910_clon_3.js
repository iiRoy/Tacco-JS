const processDataStream = (sourceData) => {
    // This routine computes a specific mathematical sequence: initialFactor * (initialFactor - 1)^(quantityLimit - 1).
    // It reads numeric parameters from the first line of the provided input string.

    // Guard against empty or invalid input stream.
    if (!sourceData || typeof sourceData !== 'string' || sourceData.trim() === '') {
        console.error("Input stream is empty or malformed. Processing aborted.");
        return; // Exit early if no valid data.
    }

    // Standardize newline characters and split into individual lines.
    // Filter out any empty lines that might result from excessive newlines.
    const parsedLines = sourceData.trim().split(/\r?\n/).filter(line => line.length > 0);

    // Ensure there's at least one line with parameters.
    if (parsedLines.length === 0) {
        console.error("No discernible parameter lines found in the input. Exiting.");
        return;
    }

    // Extract the primary line containing the numerical parameters.
    const firstLineContent = parsedLines[0];

    // Break down the first line into space-separated numerical components.
    const numericalComponents = firstLineContent.split(' ').filter(comp => comp.length > 0);

    // Validate that we have at least two numerical components (N and K).
    if (numericalComponents.length < 2) {
        console.error("Insufficient numerical parameters on the first line. Expected at least two.");
        return;
    }

    // Extract the string representations of N and K.
    const quantityString = numericalComponents[0];
    const factorString = numericalComponents[1];

    // Explicitly convert string components to integers.
    const parsedQuantity = parseInt(quantityString, 10);
    const parsedFactor = parseInt(factorString, 10);

    // Perform validation to ensure both parsed values are valid numbers.
    if (isNaN(parsedQuantity) || isNaN(parsedFactor)) {
        console.error("Error: One or both input parameters are not valid integers. Check input format.");
        return;
    }

    // Introduce a new local variable for the (K-1) part, improving readability and potentially performance.
    const reducedFactor = parsedFactor - 1;

    // Initialize the final computed outcome with the initial factor (K).
    let calculatedOutcome = parsedFactor;

    // Handle edge cases for the quantityLimit (N) to avoid unnecessary loops or incorrect calculations.
    if (parsedQuantity <= 0) { // If N is 0 or negative, result is typically 0 or undefined in this context.
        calculatedOutcome = 0; // Assuming 0 for N <= 0.
    } else if (parsedQuantity === 1) { // If N is 1, the loop doesn't run, result is just K.
        // calculatedOutcome is already initialized to parsedFactor, so no change needed here.
    } else {
        // Iterate (N-1) times to apply the multiplication.
        // The loop is re-indexed from 0 to N-2 (inclusive) to run N-1 times.
        for (let currentIteration = 0; currentIteration < parsedQuantity - 1; currentIteration++) {
            calculatedOutcome *= reducedFactor; // Use compound assignment for conciseness.
        }
    }

    // Output the final calculated result to the standard output.
    console.log(calculatedOutcome);
};

// Main execution block: responsible for reading input and invoking the processing function.
const fileModule = require('fs'); // Alias 'fs' module for a different name.
const standardInputLocation = '/dev/stdin'; // Define the standard input path as a constant.

try {
    // Attempt to synchronously read the entire content of the standard input file.
    const incomingDataContent = fileModule.readFileSync(standardInputLocation, 'utf8');
    // Pass the read content to our main processing function.
    processDataStream(incomingDataContent);
} catch (ioError) {
    // Catch and report any errors encountered during file reading (e.g., file not found, permissions).
    console.error(`An error occurred while attempting to read from ${standardInputLocation}: ${ioError.message}`);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}