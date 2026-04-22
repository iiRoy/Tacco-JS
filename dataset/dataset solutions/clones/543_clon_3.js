// This JavaScript script processes two numeric command-line arguments.
// Its primary function is to compute a value based on these inputs.
// Specifically, it calculates the integer division of the second argument by the first,
// and then increments that result by one. This mimics a specific mathematical operation.

// The execution is encapsulated within an immediately invoked function expression (IIFE)
// to simulate a 'main' entry point and manage scope, typical for script execution.
(function() {
    // Define configuration constants for argument handling.
    // The number of required operational arguments for this script.
    const REQUIRED_NUMERIC_PARAMETERS = 2;
    // The offset in 'process.argv' to start reading user-provided arguments.
    // 'process.argv[0]' is 'node', 'process.argv[1]' is the script filename.
    const COMMAND_LINE_ARGUMENT_OFFSET = 2;

    // Extract the actual user-provided arguments from the command line.
    // This creates an array containing only the relevant input values.
    const scriptInputValues = process.argv.slice(COMMAND_LINE_ARGUMENT_OFFSET);

    // Perform an initial validation check on the number of received arguments.
    // If the count is not as expected, display an error and usage information.
    if (scriptInputValues.length !== REQUIRED_NUMERIC_PARAMETERS) {
        console.error("Error: Insufficient or excessive command-line arguments provided.");
        console.error(`Usage Example: node ${process.argv[1]} <first_integer> <second_integer>`);
        console.error(`Expected exactly ${REQUIRED_NUMERIC_PARAMETERS} numeric inputs, but detected ${scriptInputValues.length}.`);
        process.exit(1); // Terminate the script with an error code.
    }

    // Declare variables to store the converted numeric operands.
    // These will hold the validated integer values after parsing.
    let currentDivisor;
    let currentDividend;

    try {
        // Attempt to convert the first command-line string argument to a number.
        // The Number() constructor is used for flexible string-to-number conversion.
        currentDivisor = Number(scriptInputValues[0]);
        // Attempt to convert the second command-line string argument to a number.
        currentDividend = Number(scriptInputValues[1]);

        // Validate the first parsed number: ensure it's a valid finite number.
        if (isNaN(currentDivisor) || !isFinite(currentDivisor)) {
            console.error(`Input Error: The initial argument '${scriptInputValues[0]}' is not recognized as a valid finite number.`);
            process.exit(1);
        }
        // Validate the second parsed number: ensure it's a valid finite number.
        if (isNaN(currentDividend) || !isFinite(currentDividend)) {
            console.error(`Input Error: The subsequent argument '${scriptInputValues[1]}' is not recognized as a valid finite number.`);
            process.exit(1);
        }

        // Implement a crucial guard clause: prevent division by zero.
        // Division by zero would lead to 'Infinity' or 'NaN', which is undesired.
        if (currentDivisor === 0) {
            console.error("Mathematical Error: Division operation cannot proceed with a zero divisor.");
            console.error("Please ensure the first numeric argument is not zero.");
            process.exit(1);
        }

        // Define an internal utility function to perform the core arithmetic calculation.
        // This promotes modularity and makes the calculation logic reusable or easily modifiable.
        const computeAdjustedIntegerQuotient = (denominator, numerator) => {
            // Perform division and then truncate the fractional part to achieve integer division semantics.
            // Math.trunc() is suitable for this, especially with positive numbers.
            const rawIntegerDivisionResult = Math.trunc(numerator / denominator);
            // Add one to the integer division result as per the specific requirement.
            const incrementedFinalValue = rawIntegerDivisionResult + 1;
            return incrementedFinalValue;
        };

        // Execute the primary calculation using the validated numeric inputs.
        const resultantOutputValue = computeAdjustedIntegerQuotient(currentDivisor, currentDividend);

        // Display the final computed value to the console, prefixed with a descriptive label.
        console.log(`Calculated Final Output: ${resultantOutputValue}`);

    } catch (processingException) {
        // Catch and report any unexpected exceptions that might occur during argument parsing or processing.
        console.error("An unforeseen issue arose during the script's execution:", processingException.message);
        process.exit(1); // Exit with an error code for unhandled exceptions.
    }

})(); // The IIFE concludes here.