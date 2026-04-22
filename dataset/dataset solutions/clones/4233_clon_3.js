// This function processes a raw string input to calculate and display a specific numerical result.
// It involves parsing multiple numerical parameters, performing arithmetic operations,
// and applying a conditional adjustment before outputting the final value.
function calculateComputedOutcome(sourceDataString) {
    // First, ensure the raw input is free from leading/trailing whitespace.
    const cleanedInput = sourceDataString.trim();

    // Divide the cleaned string into its constituent parts based on spaces.
    let componentStrings = cleanedInput.split(" ");

    // Implement a basic check to ensure the input format is as expected (at least three parts).
    if (componentStrings.length < 3) {
        console.error("Data input error: Expected at least three numerical components, but fewer were found.");
        return; // Terminate execution if input is malformed.
    }

    // Convert the string components into numerical values.
    // Using the unary plus operator for type conversion, which is a concise alternative to Number() or parseInt().
    let firstInputParameter = +componentStrings[0];
    let secondInputParameter = +componentStrings[1];
    let thirdInputParameter = +componentStrings[2];

    // Validate that the parsed values are indeed numbers.
    if (isNaN(firstInputParameter) || isNaN(secondInputParameter) || isNaN(thirdInputParameter)) {
        console.error("Data parsing error: One or more input components could not be converted to valid numbers.");
        return; // Terminate if any component is not a number.
    }

    // Compute an initial adjusted quantity.
    // This value represents a modified primary parameter.
    let initialModifiedQuantity = firstInputParameter - (2 * thirdInputParameter);

    // Determine the combined step increment, which acts as a divisor in subsequent calculations.
    let aggregateStepSize = secondInputParameter + thirdInputParameter;

    // Crucial validation: Prevent division by zero, which would lead to an invalid result (Infinity/NaN).
    if (aggregateStepSize === 0) {
        console.error("Calculation error: The aggregate step size computes to zero, preventing valid division.");
        console.log(0); // Output a default or error value in this specific failure case.
        return;
    }

    // Calculate the base number of complete units or cycles.
    // This is the integer part of the division result.
    let baseCycleCount = Math.floor(initialModifiedQuantity / aggregateStepSize);

    // Compute the residual amount after extracting the base cycles.
    // The modulo operator elegantly provides this remainder.
    let residualAmount = initialModifiedQuantity % aggregateStepSize;

    // Declare a variable to hold the final calculated output.
    let finalCalculatedResult;

    // Apply a conditional adjustment based on the residual amount.
    // If the residual is sufficiently large, an additional unit is added.
    if (residualAmount >= secondInputParameter) {
        finalCalculatedResult = baseCycleCount + 1;
    } else {
        finalCalculatedResult = baseCycleCount;
    }

    // Display the final computed result to the standard output.
    console.log(finalCalculatedResult);
}

// This immediately invoked function expression (IIFE) serves as the program's entry point,
// handling the reading of input from stdin and orchestrating the main calculation.
(function programInitializer() {
    try {
        // Attempt to load the Node.js 'fs' (file system) module.
        const fileSystemModule = require('fs');
        // Read the entire content of standard input as a UTF-8 encoded string.
        const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        // Invoke the main processing function with the obtained input.
        calculateComputedOutcome(standardInputContent);
    } catch (operationError) {
        // Catch and log any errors that occur during file reading or processing.
        console.error("An unexpected error occurred during program execution:", operationError.message);
    }
})();