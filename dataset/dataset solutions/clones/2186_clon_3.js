// This JavaScript module is designed to compute the integral quotient of two numbers
// provided as command-line arguments. It includes robust input validation.

/**
 * Executes the primary logic for calculating the integer division.
 * This function retrieves command-line arguments, validates them,
 * performs the division, and outputs the floored result.
 * @returns {void} No explicit return value; outputs directly to console or exits on error.
 */
const executeIntegerDivision = () => {
    // Access the raw command-line arguments.
    // In Node.js, process.argv[0] is 'node', process.argv[1] is the script path.
    // User-provided arguments start from index 2.
    const cliArguments = process.argv;

    // Extract the string representations of the dividend and divisor.
    const dividendInputString = cliArguments[2]; // Corresponds to original 'h'
    const divisorInputString = cliArguments[3];  // Corresponds to original 'a'

    // --- Phase 1: Input Validation ---

    // Verify that both required arguments have been supplied by the user.
    if (dividendInputString === undefined || divisorInputString === undefined) {
        console.error("Operation Failed: Two numeric arguments are required.");
        console.error("Usage example: node script.js <dividend_value> <divisor_value>");
        // Terminate the process with a non-zero status code to indicate an error.
        process.exit(1);
    }

    // Convert the string inputs into numerical values.
    // Using Number.parseFloat allows for decimal numbers, which will then be floored.
    const parsedDividendValue = Number.parseFloat(dividendInputString);
    const parsedDivisorValue = Number.parseFloat(divisorInputString);

    // Validate that the parsed values are indeed finite numbers.
    // isNaN checks for 'Not a Number', !Number.isFinite checks for Infinity/-Infinity.
    if (Number.isNaN(parsedDividendValue) || !Number.isFinite(parsedDividendValue) ||
        Number.isNaN(parsedDivisorValue) || !Number.isFinite(parsedDivisorValue)) {
        console.error(`Input Error: Both "${dividendInputString}" and "${divisorInputString}" must represent valid finite numbers.`);
        process.exit(1);
    }

    // Implement a guard clause against division by zero, which is undefined.
    if (parsedDivisorValue === 0) {
        console.error("Mathematical Error: Division by zero is not permitted.");
        process.exit(1);
    }

    // --- Phase 2: Core Computation ---

    // Perform the floating-point division.
    const intermediateFloatResult = parsedDividendValue / parsedDivisorValue;

    // Determine the integer portion of the result by rounding down to the nearest whole number.
    // This precisely matches the behavior of Math.floor from the original code.
    const finalIntegralOutcome = Math.floor(intermediateFloatResult);

    // --- Phase 3: Output Result ---

    // Display the calculated integer quotient to the console, providing context.
    console.log(`Calculation Result: The integer part of (${dividendInputString} / ${divisorInputString}) is ${finalIntegralOutcome}.`);

    // Optionally, exit with a success code.
    // process.exit(0);
};

// Initiate the execution of the integer division logic when the script is run.
executeIntegerDivision();