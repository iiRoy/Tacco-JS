// This module is designed to perform a specific iterative calculation based on two initial integer values
// provided via standard input. It computes a cumulative sum over a fixed number of cycles.

/**
 * Orchestrates the entire process of reading input, validating it, performing the core calculation,
 * and presenting the final result to the user.
 *
 * The calculation involves two iterations. In each iteration, the larger of two current numerical
 * operands is added to an accumulating sum, and that specific operand is then decremented by one.
 *
 * @param {string} incomingDataPayload - The raw string content expected from an input source.
 *                                       It should contain at least one line, with the first line
 *                                       holding two space-separated integers.
 */
function computeIterativeNumericSummation(incomingDataPayload) {
    // A configuration constant defining the number of processing rounds.
    const NUMBER_OF_PROCESSING_ROUNDS = 2;

    // --- Initial Input Preparation and Sanitization ---
    // Remove any leading or trailing whitespace from the entire input payload.
    const sanitizedPayload = incomingDataPayload.trim();

    // Implement a preliminary check for empty input after cleaning.
    if (sanitizedPayload.length === 0) {
        console.error("Operation Aborted: The provided input payload is empty or contains only whitespace.");
        return; // Terminate execution if no meaningful input is present.
    }

    // Extract only the very first line from the sanitized input string.
    const initialDataRow = sanitizedPayload.split('\n')[0];

    // Break down the first line into individual string components, using space as a delimiter.
    const stringComponentArray = initialDataRow.split(' ');

    // Enforce a strict requirement for the number of input components.
    if (stringComponentArray.length !== NUMBER_OF_PROCESSING_ROUNDS) {
        console.error(`Operation Aborted: Expected precisely ${NUMBER_OF_PROCESSING_ROUNDS} numerical components, but detected ${stringComponentArray.length}.`);
        return;
    }

    // --- Numeric Conversion and Validation ---
    // A temporary array to hold the successfully parsed integer values.
    const parsedNumericOperands = [];

    // Iterate through each string component to convert it into an integer.
    for (let componentIndex = 0; componentIndex < stringComponentArray.length; componentIndex++) {
        const currentStringElement = stringComponentArray[componentIndex];
        // Utilize parseInt with a specified radix for robust integer conversion.
        const integerValue = parseInt(currentStringElement, 10);

        // Perform validation to ensure the conversion resulted in a valid number.
        if (isNaN(integerValue)) {
            console.error(`Operation Aborted: Encountered an invalid numeric format: '${currentStringElement}'.`);
            return;
        }
        parsedNumericOperands.push(integerValue);
    }

    // Assign the validated initial values to mutable variables for the calculation.
    let primaryNumericalEntity = parsedNumericOperands[0];   // Corresponds to the original 'a'
    let secondaryNumericalEntity = parsedNumericOperands[1]; // Corresponds to the original 'b'

    // Initialize the variable that will accumulate the final sum.
    let aggregateResultAccumulator = 0;

    // --- Core Iterative Summation Logic ---
    let cycleIterationCounter = 0;
    // Execute the core logic for the predefined number of rounds.
    while (cycleIterationCounter < NUMBER_OF_PROCESSING_ROUNDS) {
        let valueSelectedForAddition; // A temporary variable to hold the value chosen for the current round.

        // Compare the two numerical entities to decide which one is larger (or equal)
        // and should be added to the sum, then decrement that chosen entity.
        if (primaryNumericalEntity >= secondaryNumericalEntity) { // Slight variation: includes equality for primary entity preference.
            valueSelectedForAddition = primaryNumericalEntity;
            primaryNumericalEntity = primaryNumericalEntity - 1; // Explicit subtraction for decrement.
        } else {
            valueSelectedForAddition = secondaryNumericalEntity;
            secondaryNumericalEntity = secondaryNumericalEntity - 1; // Explicit subtraction for decrement.
        }

        // Add the selected value from the current round to the running total.
        aggregateResultAccumulator = aggregateResultAccumulator + valueSelectedForAddition;

        // Advance the iteration counter for the while loop.
        cycleIterationCounter = cycleIterationCounter + 1; // Explicit addition for increment.
    }

    // --- Result Presentation ---
    // Define a concise helper function for standardized output formatting.
    const presentFinalOutcome = (finalCalculatedValue) => {
        console.log(`The final computed sum after ${NUMBER_OF_PROCESSING_ROUNDS} processing rounds is: ${finalCalculatedValue}.`);
    };

    presentFinalOutcome(aggregateResultAccumulator);
}

// --- Application Entry Point & Input Management ---
// This block serves as the main entry point for the script's execution.
// It is responsible for reading the input from standard input and invoking the core processing function.
try {
    // Dynamically require the Node.js 'fs' (file system) module.
    const fileSystemHandler = require('fs');
    // Read the entire content of standard input synchronously, decoding it as UTF-8.
    const receivedStdinContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
    // Pass the received content to our primary processing function.
    computeIterativeNumericSummation(receivedStdinContent);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or the main processing.
    console.error("An unhandled exception occurred during the application's execution:", executionError.message);
}