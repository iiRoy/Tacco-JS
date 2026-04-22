// This self-executing anonymous function is designed to process
// a single line of string input, typically from standard input,
// to perform a series of arithmetic computations.
(function processAndOutputCalculations(rawInputData) {
    // A comment clarifying the purpose of the input parameter.
    // rawInputData is expected to be a string containing two numbers
    // separated by one or more spaces.

    // --- Input Validation and Pre-processing ---

    // Guard clause 1: Check if the input is valid (not null, undefined, or empty string).
    if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        console.error("Processing Error: The provided input data is empty, null, or not a string.");
        return; // Terminate execution if input is invalid.
    }

    // Split the trimmed input string into an array of string components.
    // Using a regular expression `/\s+/` handles multiple spaces between numbers
    // and ensures robustness against varying whitespace.
    const stringComponents = rawInputData.trim().split(/\s+/);

    // Guard clause 2: Ensure there are at least two components for arithmetic operations.
    if (stringComponents.length < 2) {
        console.error("Processing Error: Insufficient numeric components. Expected at least two numbers.");
        return; // Terminate if not enough data.
    }

    // --- Data Type Conversion and Validation ---

    // Convert the string components to numerical types.
    // Using the unary plus operator `+` is a concise way to convert strings to numbers.
    // It handles both integers and floats, returning NaN for non-numeric strings.
    const dividendValue = +stringComponents[0]; // Represents the first number (x)
    const divisorValue = +stringComponents[1];  // Represents the second number (y)

    // Guard clause 3: Validate if the converted values are actual numbers.
    if (isNaN(dividendValue) || isNaN(divisorValue)) {
        console.error(`Processing Error: Failed to parse one or both input values into valid numbers.
                       Received: '${stringComponents[0]}' and '${stringComponents[1]}'.`);
        return; // Terminate if parsing fails.
    }

    // Guard clause 4: Prevent division by zero for the divisor.
    if (divisorValue === 0) {
        console.error("Processing Error: Division by zero is not permitted for the second operand.");
        // For Type III, we can still output some form of result or specific message
        // instead of just crashing or returning silently.
        console.log(`${dividendValue} / 0 = Undefined (Int Div), NaN (Modulo), Infinity (Float Div)`);
        return;
    }

    // --- Core Arithmetic Computations ---

    // Calculate the integer part of the division.
    // Math.floor ensures the result is an integer, handling negative numbers correctly
    // for standard integer division semantics (truncates towards negative infinity).
    const integerDivisionResult = Math.floor(dividendValue / divisorValue);

    // Calculate the remainder of the division.
    // The modulo operator (%) returns the remainder.
    const remainderAfterDivision = dividendValue % divisorValue;

    // Perform the full floating-point division.
    // This intermediate variable helps in readability before formatting.
    const rawFloatingPointDivision = dividendValue / divisorValue;

    // Format the floating-point result to six decimal places.
    // .toFixed() returns a string representation.
    const formattedFloatDivision = rawFloatingPointDivision.toFixed(6);

    // --- Output Generation ---

    // Construct the final output string using a template literal.
    // This provides a clear and readable way to combine the computed values.
    const compositeResultString = `${integerDivisionResult} ${remainderAfterDivision} ${formattedFloatDivision}`;

    // Print the final result to the console (standard output).
    console.log(compositeResultString);

// The IIFE is immediately invoked by passing the content of '/dev/stdin'
// as the rawInputData. This mimics the original code's input mechanism.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));