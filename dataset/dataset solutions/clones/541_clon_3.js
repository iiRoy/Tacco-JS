/*
 * This JavaScript module processes a single string input containing two
 * space-separated integer values.
 * It computes a derived numerical result based on an integer division operation
 * and outputs this result to the console.
 * This implementation includes robust input validation and error handling.
 */

/**
 * Executes the primary calculation logic based on provided command-line arguments.
 * @param {string[]} commandLineArgs - An array of strings representing command-line inputs.
 *                                     Expected to contain at least one element:
 *                                     a string with two space-separated numbers (e.g., "10 3").
 * @returns {void}
 */
const processInputAndCalculate = (commandLineArgs) => {
    // Type III: Initial validation for the presence of any input arguments.
    // The original Java code assumes input is always available from standard input.
    if (!commandLineArgs || commandLineArgs.length === 0) {
        console.error("Execution Aborted: No input string was provided. " +
                      "Please supply a single string argument containing two numbers separated by a space.");
        return; // Early exit on critical error
    }

    // Type III: Extract the primary input string from the arguments array.
    // This step directly mirrors the Java `br.readLine()` which obtains a single line of text.
    const fullInputEntry = commandLineArgs[0];

    // Type II: Renamed variable from 'numbers' to 'numericalSegments'.
    // Type III: Splits the input string into parts, precisely like Java's `line.split(" ")`.
    const numericalSegments = fullInputEntry.split(" ");

    // Type III: Validate that exactly two numerical segments were found after splitting.
    if (numericalSegments.length !== 2) {
        console.error(`Execution Aborted: Expected two numerical values, but found ${numericalSegments.length}. ` +
                      "Ensure your input string contains exactly two numbers separated by a single space.");
        return;
    }

    // Type III: Declare variables for parsed numbers. Initialized as undefined until parsed.
    let firstNumericItem;
    let secondNumericItem;

    // Type II: Use Number.parseInt instead of Java's Integer.valueOf.
    // Type III: Explicit radix (10) for parseInt to ensure decimal interpretation,
    // and assignment through intermediate steps for clarity.
    firstNumericItem = Number.parseInt(numericalSegments[0], 10);
    secondNumericItem = Number.parseInt(numericalSegments[1], 10);

    // Type III: Validate that both parsed values are indeed numbers (not NaN).
    if (isNaN(firstNumericItem) || isNaN(secondNumericItem)) {
        console.error("Execution Aborted: One or both of the provided inputs are not valid numbers. " +
                      "Please ensure both values are integers for correct computation.");
        return;
    }

    // Type III: Implement a guard clause for division by zero.
    // This critical error condition was not explicitly handled in the original Java snippet.
    if (firstNumericItem === 0) {
        console.error("Execution Aborted: Division by zero is not permitted. " +
                      "The first numerical input (divisor) cannot be zero.");
        return;
    }

    // Type II: Equivalent of Java's Math.floorDiv(B, A), which performs integer division.
    // Type III: Use an intermediate constant for the result of the quotient calculation.
    const calculatedQuotient = Math.floor(secondNumericItem / firstNumericItem);

    // Type III: Define the constant increment value explicitly for better readability.
    const valueToAdd = 1;

    // Type II: Renamed variable from 'num' to 'finalComputedResult'.
    // Type III: Clearer naming and direct assignment for the final value.
    const finalComputedResult = calculatedQuotient + valueToAdd;

    // Type II: Use console.log for output instead of Java's System.out.print.
    // Type III: Direct output of the final calculated value to standard output.
    console.log(finalComputedResult);
};

// --- Script Entry Point ---
// Type III: This block simulates the 'main' method in a Java class.
// It sets up the environment by extracting command-line arguments and
// then invokes the primary processing function.
// For Node.js, `process.argv` is an array containing command-line arguments.
// `slice(2)` is used to skip the 'node' executable path and the script file path itself.
const scriptArguments = process.argv.slice(2);

// Type III: Invoke the core processing function with the extracted arguments.
processInputAndCalculate(scriptArguments);