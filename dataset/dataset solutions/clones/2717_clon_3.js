// Input/Output system configuration module
const consoleInputHandler = require('readline').createInterface({
    input: process.stdin,  // Standard input stream
    output: process.stdout // Standard output stream
});

// A dynamic array to accumulate all lines received from input
const receivedDataBuffer = [];

// A state flag to indicate if any input has been processed
let dataReceptionInitiated = false;

// Register an event listener for each line of text read from the input stream
consoleInputHandler.on('line', (currentInputLineString) => {
    // Set the flag to true upon receiving the first line
    if (!dataReceptionInitiated) {
        dataReceptionInitiated = true;
    }
    // Store the current line in our buffer
    receivedDataBuffer.push(currentInputLineString);
});

// Register an event listener to execute the main logic once the input stream is closed
consoleInputHandler.on('close', () => {
    // Implement an early exit validation for cases where no input was provided
    if (!dataReceptionInitiated || receivedDataBuffer.length === 0) {
        console.error("Error: No input data was detected. Please supply a numeric value.");
        process.exit(1); // Terminate the process with an error code
    }

    // Define a constant for the minimum allowable value for the second factor
    const LOWER_BOUND_FOR_SECOND_FACTOR = 1_000_000_000; // Using numeric separators for clarity

    // Attempt to parse the first line of input into a floating-point number
    const targetNumericValue = parseFloat(receivedDataBuffer[0]);

    // Perform comprehensive validation on the parsed input value
    if (isNaN(targetNumericValue) || targetNumericValue < 0 || !Number.isInteger(targetNumericValue)) {
        console.error(`Input Validation Failed: The provided value '${receivedDataBuffer[0]}' is not a valid non-negative integer.`);
        process.exit(1);
    }

    // Variables to store the final pair of factors that meet the criteria
    let resultingFactorA = 0;
    let resultingFactorB = 0;

    // Special handling for the case where the target number is zero
    if (targetNumericValue === 0) {
        resultingFactorA = 1; // As per original code's behavior for s=0
        resultingFactorB = 0;
    } else {
        // Iterate through potential divisors starting from 1
        for (let candidateDivisor = 1; ; candidateDivisor++) {
            // Check if the current candidate divisor exceeds the target value itself.
            // This acts as a safety break for very small target values or to prevent infinite loops.
            if (candidateDivisor > targetNumericValue) {
                // This scenario implies that even `candidateDivisor = 1` failed the conditions.
                // The values stored in resultingFactorA/B should reflect this initial failure.
                // However, the loop structure already ensures `resultingFactorA` and `resultingFactorB`
                // are set to the *first* values for which the condition fails.
                break;
            }

            // Evaluate the two conditions required by the original logic
            const isTargetValueDivisible = (targetNumericValue % candidateDivisor === 0);
            const calculatedQuotient = targetNumericValue / candidateDivisor;
            const isQuotientAboveThreshold = (calculatedQuotient >= LOWER_BOUND_FOR_SECOND_FACTOR);

            // The original loop `while(condition) x++;` means `x` will be the first value for which `condition` is FALSE.
            // Therefore, we assign `resultingFactorA` and `resultingFactorB` when the combined condition fails.
            if (isTargetValueDivisible && isQuotientAboveThreshold) {
                // Conditions are met, so we continue to the next candidate divisor
                // The loop implicitly increments `candidateDivisor`
            } else {
                // Conditions are NOT met for this `candidateDivisor`.
                // This `candidateDivisor` and its `calculatedQuotient` are the values to be output.
                resultingFactorA = candidateDivisor;
                resultingFactorB = calculatedQuotient;
                break; // Exit the loop as the breaking point has been found
            }
        }
    }

    // Output the final result in the specified format using a template literal
    // The "0 0" and "0 0" parts are static placeholders as per the original problem statement.
    console.log(`0 0 ${resultingFactorA} 0 0 ${resultingFactorB}`);
});